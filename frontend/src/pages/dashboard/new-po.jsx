import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Plus, Upload, Download, Save, FileSpreadsheet, Trash2, PlusSquare } from 'lucide-react'

function groupByOperator(rows) {
  return rows.reduce((acc, row) => {
    const key = row.operator
    if (!acc[key]) acc[key] = []
    acc[key].push(row)
    return acc
  }, {})
}

export default function NewPOPage() {
  const [groupBy, setGroupBy] = useState('operator')
  const [sheet, setSheet] = useState(() => createInitialSheet())
  const [dirty, setDirty] = useState(false)
  const autosaveTimer = useRef(null)

  function handleSelect(sel) {
    setSheet((s) => ({ ...s, selection: sel }))
  }

  function handleCellChange(rowIdx, key, value) {
    setSheet((s) => {
      const newRows = s.rows.slice()
      const coerced = coerceValue(key, value)
      newRows[rowIdx] = { ...newRows[rowIdx], [key]: coerced }
      return { ...s, rows: newRows }
    })
    setDirty(true)
  }

  function coerceValue(key, value) {
    if (['received', 'balance'].includes(key)) {
      const n = Number(String(value).replace(/[^0-9.-]/g, ''))
      return Number.isFinite(n) ? n : 0
    }
    if (key === 'roi') {
      const n = Number(String(value).replace(/[^0-9.-]/g, ''))
      return Number.isFinite(n) ? n : 0
    }
    return value
  }

  function addRow() {
    setSheet((s) => ({
      ...s,
      rows: s.rows.concat({ keyId: '', project: '', poNumber: '', poDate: '', invoiceNumber: '', invoiceDate: '', boqEntry: '', term: '', received: 0, roi: 0, balance: 0 })
    }))
    setDirty(true)
  }

  function deleteSelected() {
    setSheet((s) => {
      const idx = s.selection.row
      if (idx < 0 || idx >= s.rows.length) return s
      const nextRows = s.rows.slice(0, idx).concat(s.rows.slice(idx + 1))
      const nextSel = { row: Math.max(0, idx - 1), col: s.selection.col }
      return { ...s, rows: nextRows, selection: nextSel }
    })
    setDirty(true)
  }

  async function performSave(source = 'manual') {
    try {
      // mock save to localStorage; replace with API
      localStorage.setItem('newpo_sheet', JSON.stringify(sheet))
      setDirty(false)
    } catch {}
  }

  function onSave() { performSave('manual') }

  function onExport() {
    const blob = new Blob([JSON.stringify(sheet.rows, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'new-po-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function onImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const rows = JSON.parse(String(reader.result))
          setSheet((s) => ({ ...s, rows }))
          setDirty(true)
        } catch {}
      }
      reader.readAsText(file)
    }
    input.click()
  }

  useEffect(() => {
    if (!dirty) return
    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => performSave('autosave'), 1200)
    return () => clearTimeout(autosaveTimer.current)
  }, [dirty, sheet])

  const data = useMemo(() => ([
    { id: 'K-101', operator: 'Urban Infra', project: 'Metro Line 3', poNumber: 'PO-7781', poDate: '2025-09-12', invoiceNumber: 'INV-2201', invoiceDate: '2025-09-30', boqEntry: 'Phase 1', termPayments: 'Net 30', received: 1200000, roi: 6.2, balance: 380000 },
    { id: 'K-102', operator: 'Urban Infra', project: 'Metro Line 3', poNumber: 'PO-7782', poDate: '2025-10-01', invoiceNumber: 'INV-2205', invoiceDate: '2025-10-10', boqEntry: 'Phase 1', termPayments: 'Net 30', received: 820000, roi: 6.2, balance: 120000 },
    { id: 'K-201', operator: 'Coastal Builders', project: 'Harbor Expansion', poNumber: 'PO-8810', poDate: '2025-08-22', invoiceNumber: 'INV-2109', invoiceDate: '2025-08-31', boqEntry: 'Dock B', termPayments: 'Net 45', received: 450000, roi: 5.4, balance: 90000 },
    { id: 'K-202', operator: 'Coastal Builders', project: 'Harbor Expansion', poNumber: 'PO-8812', poDate: '2025-09-04', invoiceNumber: 'INV-2111', invoiceDate: '2025-09-15', boqEntry: 'Dock C', termPayments: 'Net 45', received: 560000, roi: 5.4, balance: 110000 },
  ]), [])

  const grouped = useMemo(() => groupBy === 'operator' ? groupByOperator(data) : { All: data }, [data, groupBy])

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:flex-nowrap gap-3 md:gap-4">
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <button onClick={addRow} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
              <PlusSquare className="h-4 w-4" />
              Add Row
            </button>
            <button onClick={onImport} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button onClick={onExport} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button onClick={onSave} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border ${dirty ? 'border-blue-600 text-white bg-blue-600 hover:bg-blue-700' : 'border-secondary-300 bg-white'} transition-colors`}>
              <Save className="h-4 w-4" />
              Save
            </button>
            <button onClick={deleteSelected} className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          <div className="shrink-0">
            <label className="text-sm mr-2 text-secondary-700">Group by</label>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="text-sm px-2.5 py-2 rounded-md border border-secondary-300 bg-white">
              <option value="operator">Operator</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        {/* Spreadsheet Card */}
        <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
          <Spreadsheet sheet={sheet} onChangeCell={handleCellChange} onSelect={handleSelect} />
        </div>
      </div>
    </DashboardLayout>
  )
}

function GroupSection({ operator, rows, subtotalReceived, subtotalBalance }) {
  return (
    <>
      <tr className="bg-secondary-50/80">
        <td colSpan={11} className="px-4 py-2 font-medium text-secondary-700">
          <span className="inline-flex items-center gap-2"><User className="h-4 w-4" /> {operator}</span>
        </td>
      </tr>
      {rows.map((r, i) => (
        <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-secondary-50/40'}>
          <Td>{r.id}</Td>
          <Td>{r.project}</Td>
          <Td>{r.poNumber}</Td>
          <Td>{r.poDate}</Td>
          <Td>{r.invoiceNumber}</Td>
          <Td>{r.invoiceDate}</Td>
          <Td>{r.boqEntry}</Td>
          <Td>{r.termPayments}</Td>
          <Td className="text-right">{formatCurrency(r.received)}</Td>
          <Td className="text-right">{r.roi.toFixed(1)}%</Td>
          <Td className="text-right">{formatCurrency(r.balance)}</Td>
        </tr>
      ))}
      <tr className="bg-gradient-to-r from-secondary-50 to-secondary-100">
        <td colSpan={8} className="px-4 py-2 text-right font-medium text-secondary-700">Subtotal</td>
        <Td className="text-right font-semibold">{formatCurrency(subtotalReceived)}</Td>
        <Td />
        <Td className="text-right font-semibold">{formatCurrency(subtotalBalance)}</Td>
      </tr>
      <tr><td colSpan={11} className="h-2" /></tr>
    </>
  )
}

function Th({ children, className = '' }) {
  return <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top text-secondary-800 ${className}`}>{children}</td>
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

// ---------- Spreadsheet implementation (lightweight) ----------
function createInitialSheet() {
  // columns definition
  const columns = [
    { key: 'keyId', title: 'Key ID', width: 120 },
    { key: 'project', title: 'Project Name', width: 240 },
    { key: 'poNumber', title: 'PO Number', width: 140 },
    { key: 'poDate', title: 'PO Date', width: 140 },
    { key: 'invoiceNumber', title: 'Invoice Number', width: 160 },
    { key: 'invoiceDate', title: 'Date', width: 140 },
    { key: 'boqEntry', title: 'BOQ Entry', width: 160 },
    { key: 'term', title: 'Term-wise Payments', width: 180 },
    { key: 'received', title: 'Received', width: 140, align: 'right' },
    { key: 'roi', title: 'Rate of Interest', width: 160, align: 'right' },
    { key: 'balance', title: 'Balance', width: 140, align: 'right' },
  ]
  const rows = [
    { keyId: 'K-101', project: 'Metro Line 3', poNumber: 'PO-7781', poDate: '2025-09-12', invoiceNumber: 'INV-2201', invoiceDate: '2025-09-30', boqEntry: 'Phase 1', term: 'Net 30', received: 1200000, roi: 6.2, balance: 380000 },
    { keyId: 'K-102', project: 'Metro Line 3', poNumber: 'PO-7782', poDate: '2025-10-01', invoiceNumber: 'INV-2205', invoiceDate: '2025-10-10', boqEntry: 'Phase 1', term: 'Net 30', received: 820000, roi: 6.2, balance: 120000 },
    { keyId: 'K-201', project: 'Harbor Expansion', poNumber: 'PO-8810', poDate: '2025-08-22', invoiceNumber: 'INV-2109', invoiceDate: '2025-08-31', boqEntry: 'Dock B', term: 'Net 45', received: 450000, roi: 5.4, balance: 90000 },
  ]
  return { columns, rows, selection: { row: 0, col: 0 } }
}

function Spreadsheet({ sheet, onChangeCell, onSelect }) {
  const containerRef = useRef(null)
  const [editing, setEditing] = useState(null) // {row, col, value}

  useEffect(() => {
    function onKeyDown(e) {
      if (!containerRef.current?.contains(document.activeElement)) return
      if (editing) return
      const { row, col } = sheet.selection
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab','Enter'].includes(e.key)) {
        e.preventDefault()
        const delta = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1], Tab:[0,1], Enter:[1,0] }[e.key]
        const next = { row: clamp(row + delta[0], 0, sheet.rows.length - 1), col: clamp(col + delta[1], 0, sheet.columns.length - 1) }
        onSelect(next)
        return
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        const key = sheet.columns[col].key
        setEditing({ row, col, value: '' })
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const key = sheet.columns[col].key
        onChangeCell(row, key, '')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sheet, editing, onChangeCell, onSelect])

  function onCellDoubleClick(r, c) {
    const key = sheet.columns[c].key
    const value = sheet.rows[r][key] ?? ''
    setEditing({ row: r, col: c, value: String(value) })
  }
  function onInputBlur() { setEditing(null) }
  function onInputKeyDown(e) {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      commitEdit()
    }
    if (e.key === 'Escape') setEditing(null)
  }
  function commitEdit() {
    if (!editing) return
    const key = sheet.columns[editing.col].key
    onChangeCell(editing.row, key, editing.value)
    setEditing(null)
  }

  return (
    <div ref={containerRef} className="overflow-auto">
      <div className="min-w-[1200px]">
        {/* Column headers */}
        <div className="grid" style={{ gridTemplateColumns: `56px ${sheet.columns.map(c=>`${c.width}px`).join(' ')}` }}>
          <div className="h-10 bg-secondary-50 border-b border-secondary-200/70 sticky left-0 z-10" />
          {sheet.columns.map((col, i) => (
            <div key={col.key} className="h-10 bg-secondary-50 border-b border-secondary-200/70 text-secondary-600 text-xs flex items-center justify-center uppercase tracking-wide">{numberToColumn(i)}</div>
          ))}
        </div>
        {/* Rows */}
        {sheet.rows.map((row, rIdx) => (
          <div key={rIdx} className="grid" style={{ gridTemplateColumns: `56px ${sheet.columns.map(c=>`${c.width}px`).join(' ')}` }}>
            {/* Row header */}
            <div className="h-10 bg-secondary-50 border-b border-secondary-200/60 border-r text-secondary-600 text-xs flex items-center justify-center sticky left-0 z-10">{rIdx + 1}</div>
            {sheet.columns.map((col, cIdx) => {
              const isSel = sheet.selection.row === rIdx && sheet.selection.col === cIdx
              const align = col.align === 'right' ? 'text-right' : 'text-left'
              const value = row[col.key]
              return (
                <div
                  key={col.key}
                  className={`h-10 border-b border-r border-secondary-200/60 px-2 flex items-center ${align} ${isSel ? 'ring-2 ring-blue-400 ring-offset-0' : ''}`}
                  onDoubleClick={() => onCellDoubleClick(rIdx, cIdx)}
                  onClick={() => onSelect({ row: rIdx, col: cIdx })}
                >
                  {editing && editing.row === rIdx && editing.col === cIdx ? (
                    <input
                      autoFocus
                      value={editing.value}
                      onChange={(e) => setEditing((s) => ({ ...s, value: e.target.value }))}
                      onBlur={onInputBlur}
                      onKeyDown={onInputKeyDown}
                      className="w-full h-7 px-2 border border-blue-400 rounded-sm text-sm focus:outline-none"
                    />
                  ) : (
                    <span className="w-full truncate text-sm text-secondary-800">{formatDisplay(value, col)}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function numberToColumn(n) {
  // 0 -> A, 1 -> B, ...
  let s = ''
  n++
  while (n > 0) {
    const mod = (n - 1) % 26
    s = String.fromCharCode(65 + mod) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)) }

function formatDisplay(value, col) {
  if (value == null || value === '') return ''
  if (['received','balance'].includes(col.key)) return formatCurrency(value)
  if (col.key === 'roi') return `${Number(value).toFixed(1)}%`
  return String(value)
}

// ---------- Toolbar handlers and data ops ----------
function useAutosave(dirty, performSave) {
  const timerRef = useRef(null)
  useEffect(() => {
    if (!dirty) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => performSave('autosave'), 1200)
    return () => clearTimeout(timerRef.current)
  }, [dirty, performSave])
}




import React from 'react'
import { HotTable } from '@handsontable/react'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.min.css'
import { HyperFormula } from 'hyperformula'
import { registerAllModules } from 'handsontable/registry'

// Ensure all Handsontable modules/plugins are registered (contextMenu, formulas, etc.)
// Safe to call once; calling multiple times is a no-op.
try {
  registerAllModules()
} catch (_) {
  // ignore if already registered
}

/**
 * ExcelSheet
 *
 * A production-ready, Excel-like spreadsheet built with Handsontable and HyperFormula.
 * - Excel-style formulas (SUM, IF, etc.) via HyperFormula
 * - Copy–paste, undo–redo, right-click context menu
 * - Fully responsive: 100% width, ~90vh height
 * - Virtualized rendering: smooth scrolling even with 100k+ rows
 * - Dynamic sheet sizing via a button to set rows/columns instantly
 *
 * Sample data demonstrates calculations. To scale to large datasets later,
 * you can fetch/generate rows on-demand and use `minRows`/`minCols` with an empty `data` array,
 * letting Handsontable virtualize without allocating the entire grid in memory.
 */
export default function ExcelSheet() {
  const hotRef = React.useRef(null)
  // Prefer passing the HyperFormula class to let Handsontable manage the engine instance
  const hfClassRef = React.useRef(HyperFormula)

  // Default grid size
  const [sheetRows, setSheetRows] = React.useState(200) // small but sizable default
  const [sheetCols, setSheetCols] = React.useState(10)

  // No explicit cleanup needed when Handsontable manages the engine
  React.useEffect(() => {
    const id = setTimeout(() => {
      const hot = hotRef.current?.hotInstance
      hot?.refreshDimensions?.()
      hot?.render?.()
    }, 0)
    return () => clearTimeout(id)
  }, [])

  React.useEffect(() => {
    const hot = hotRef.current?.hotInstance
    hot?.refreshDimensions?.()
    hot?.render?.()
  }, [sheetRows, sheetCols])

  // Always-initialized data state so Handsontable never receives undefined.
  const makeGrid = React.useCallback((rows, cols) => {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''))
  }, [])
  const [data, setData] = React.useState(() => makeGrid(20, 10))

  const handleSetSize = () => {
    const input = window.prompt('Enter rows,columns (e.g., 100000,20):', `${sheetRows},${sheetCols}`)
    if (!input) return
    const parts = input.split(',').map(s => parseInt(s.trim(), 10))
    if (!Number.isFinite(parts[0]) || !Number.isFinite(parts[1]) || parts[0] <= 0 || parts[1] <= 0) {
      alert('Please enter valid positive integers for rows and columns.')
      return
    }
    const [rows, cols] = parts
    setSheetRows(rows)
    setSheetCols(cols)
    if (hotRef.current?.hotInstance) {
      hotRef.current.hotInstance.updateSettings({
        minRows: rows,
        minCols: cols
      })
      hotRef.current.hotInstance.render()
    }
    // Expand the in-memory data only for moderate sizes to avoid freezing.
    const cellCount = rows * cols
    if (cellCount <= 50000) {
      setData(makeGrid(rows, cols))
    }
  }

  // Stable column widths for performance (disables expensive auto size measurements)
  const colWidths = React.useMemo(() => 120, [])

  // Generate column headers as A, B, C... beyond Z to AA, AB, etc.
  const columnHeaders = React.useMemo(() => {
    const toLetters = (n) => {
      let s = ''
      let x = n
      while (x >= 0) {
        s = String.fromCharCode((x % 26) + 65) + s
        x = Math.floor(x / 26) - 1
      }
      return s
    }
    return (index) => toLetters(index)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={handleSetSize}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: '#1f2937',
            color: 'white',
            border: '1px solid #111827',
            cursor: 'pointer'
          }}
        >
          Set sheet size
        </button>
        <div style={{ color: '#4b5563', fontSize: 14 }}>
          Rows: {sheetRows.toLocaleString()} | Columns: {sheetCols.toLocaleString()}
        </div>
      </div>

      {/* Visible container to ensure the grid has layout space */}
      <div style={{ width: '100%', height: '80vh', overflow: 'auto', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, minHeight: 600 }}>
        <HotTable
          ref={hotRef}
          // Data handling:
          data={data}
          minRows={sheetRows}
          minCols={sheetCols}
          // Appearance & layout
          width="100%"
          height="100%"
          stretchH="all"
          rowHeaders={true}
          colHeaders={true}
          // Performance-focused settings
          autoColumnSize={false}
          autoRowSize={false}
          colWidths={colWidths}
          renderAllRows={false}
          viewportRowRenderingOffset={50}
          viewportColumnRenderingOffset={20}
          // Interactions
          contextMenu
          copyPaste
          undo
          licenseKey="non-commercial-and-evaluation"
          // Formulas with HyperFormula
          formulas={{ engine: hfClassRef.current }}
          // Let Handsontable infer columns
          columns={undefined}
          // Better UX for large grids
          outsideClickDeselects={false}
          // Avoid measuring text for row heights
          wordWrap={false}
          // Improve scroll smoothness on very large datasets
          observeChanges={false}
          // Prevent expensive re-render cascades
          preventOverflow="horizontal"
          // Events (optional: show how to hook into changes)
          afterChange={(changes, source) => {
            // Example: could debounce persistence; keep lightweight to avoid perf hits
          }}
        />
      </div>
    </div>
  )
}



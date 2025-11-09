import { useState, useRef, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { Save, Download, Upload, FileSpreadsheet, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createApiClient } from '../../services/apiClient'

const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const ROWS = 100

export default function POEntry() {
  const { token } = useAuthContext()
  const [workbook, setWorkbook] = useState(null)
  const [sheetData, setSheetData] = useState([])
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 })
  const [editingCell, setEditingCell] = useState(null)
  const [cellValues, setCellValues] = useState({})
  const [cellStyles, setCellStyles] = useState({})
  const fileInputRef = useRef(null)
  const tableRef = useRef(null)

  // Initialize with PO Entry template structure
  useEffect(() => {
    initializePOEntrySheet()
  }, [])

  function initializePOEntrySheet() {
    const initialData = [
      ['CUSTOMER PURCHASE ORDER ENTRY FORM', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Customer Details', '', '', '', '', '', '', '', '', ''],
      ['Customer Name', '', '', '', '', '', '', '', '', ''],
      ['Customer Address', '', '', '', '', '', '', '', '', ''],
      ['State', '', '', '', '', '', '', '', '', ''],
      ['Country', '', '', '', '', '', '', '', '', ''],
      ['GST No', '', '', '', '', '', '', '', '', ''],
      ['Business Type', '', '', '', '', '', '', '', '', ''],
      ['Segment', '', '', '', '', '', '', '', '', ''],
      ['Zone', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Contract and Purchase Order Details', '', '', '', '', '', '', '', '', ''],
      ['Contract Agreement No', '', '', '', '', '', '', '', '', ''],
      ['CA Date', '', '', '', '', '', '', '', '', ''],
      ['PO No', '', '', '', '', '', '', '', '', ''],
      ['PO Date', '', '', '', '', '', '', '', '', ''],
      ['Letter of Intent No', '', '', '', '', '', '', '', '', ''],
      ['LOI Date', '', '', '', '', '', '', '', '', ''],
      ['Letter of Award No', '', '', '', '', '', '', '', '', ''],
      ['LOA Date', '', '', '', '', '', '', '', '', ''],
      ['Tender Reference No', '', '', '', '', '', '', '', '', ''],
      ['Tender Date', '', '', '', '', '', '', '', '', ''],
      ['Description', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Payment and Guarantee Section', '', '', '', '', '', '', '', '', ''],
      ['Payment Type', '', '', '', '', '', '', '', '', ''],
      ['Payment Terms', '', '', '', '', '', '', '', '', ''],
      ['Insurance Types', '', '', '', '', '', '', '', '', ''],
      ['Advance Bank Guarantee No', '', '', '', '', '', '', '', '', ''],
      ['ABG Date', '', '', '', '', '', '', '', '', ''],
      ['Performance Bank Guarantee No', '', '', '', '', '', '', '', '', ''],
      ['PBG Date', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Sales-Related Information', '', '', '', '', '', '', '', '', ''],
      ['Sales Manager', '', '', '', '', '', '', '', '', ''],
      ['Sales Head', '', '', '', '', '', '', '', '', ''],
      ['Agent Name', '', '', '', '', '', '', '', '', ''],
      ['Agent Commission', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Additional Fields', '', '', '', '', '', '', '', '', ''],
      ['Delivery Schedule', '', '', '', '', '', '', '', '', ''],
      ['Liquidated Damages', '', '', '', '', '', '', '', '', ''],
      ['PO Signed Concern Name', '', '', '', '', '', '', '', '', ''],
      ['BOQ as per PO', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Financial Summary', '', '', '', '', '', '', '', '', ''],
      ['Total Ex Works', '', '', '', '', '', '', '', '', ''],
      ['Freight Amount', '', '', '', '', '', '', '', '', ''],
      ['GST', '', '', '', '', '', '', '', '', ''],
      ['Total PO Value', '', '', '', '', '', '', '', '', '']
    ]

    // Pad to ROWS
    while (initialData.length < ROWS) {
      initialData.push(Array(COLUMNS.length).fill(''))
    }

    setSheetData(initialData)
    
    // Initialize styles for section headers
    const styles = {}
    const sectionHeaderRows = [0, 2, 12, 25, 33, 40, 45]
    sectionHeaderRows.forEach(row => {
      COLUMNS.forEach((_, col) => {
        const key = `${row}-${col}`
        if (col === 0) {
          styles[key] = {
            bold: true,
            bgColor: '#4472C4',
            textColor: '#FFFFFF'
          }
        }
      })
    })

    // Style field titles (Column A, odd rows after headers)
    for (let row = 3; row < initialData.length; row++) {
      if (initialData[row] && initialData[row][0] && initialData[row][0].trim() !== '') {
        const key = `${row}-0`
        styles[key] = { bold: true, bgColor: '#F2F2F2' }
      }
    }

    setCellStyles(styles)
  }

  function getCellKey(row, col) {
    return `${row}-${col}`
  }

  function getCellValue(row, col) {
    const key = getCellKey(row, col)
    if (cellValues[key] !== undefined) {
      return cellValues[key]
    }
    if (sheetData[row] && sheetData[row][col] !== undefined) {
      return sheetData[row][col]
    }
    return ''
  }

  function getCellStyle(row, col) {
    const key = getCellKey(row, col)
    return cellStyles[key] || {}
  }

  function isSectionHeader(row) {
    if (!sheetData[row] || !sheetData[row][0]) return false
    const firstCell = String(sheetData[row][0] || '').trim()
    return firstCell.length > 0 && (
      firstCell.includes('Details') ||
      firstCell.includes('Section') ||
      firstCell.includes('Information') ||
      firstCell.includes('Fields') ||
      firstCell.includes('Summary') ||
      firstCell.includes('FORM')
    )
  }

  function isFieldTitle(row, col) {
    if (col !== 0) return false
    if (isSectionHeader(row)) return false
    const value = getCellValue(row, col)
    return value && value.trim() !== ''
  }

  function handleCellClick(row, col) {
    setSelectedCell({ row, col })
    // Don't start editing on click - wait for typing or double-click
  }

  function handleCellDoubleClick(row, col) {
    setEditingCell({ row, col, value: getCellValue(row, col) })
  }

  function handleCellChange(value) {
    if (editingCell === null) return
    
    const { row, col } = editingCell
    const key = getCellKey(row, col)
    
    // Update cell value
    setCellValues(prev => ({ ...prev, [key]: value }))
    
    // Update sheet data
    setSheetData(prev => {
      const newData = [...prev]
      if (!newData[row]) newData[row] = Array(COLUMNS.length).fill('')
      newData[row][col] = value
      return newData
    })
    
    setEditingCell(null)
  }

  function handleKeyDown(e, row, col) {
    // If typing a character and not already editing, start editing
    if (!editingCell && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      setEditingCell({ row, col, value: getCellValue(row, col) })
      return
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (editingCell) {
        handleCellChange(editingCell.value)
      }
      // Move to next cell
      if (e.key === 'Enter') {
        setSelectedCell({ row: Math.min(ROWS - 1, row + 1), col })
      } else if (e.key === 'Tab') {
        e.preventDefault()
        setSelectedCell({ row, col: Math.min(COLUMNS.length - 1, col + 1) })
      }
    } else if (e.key === 'Escape') {
      if (editingCell) {
        setEditingCell(null)
      }
    } else if (e.key.startsWith('Arrow')) {
      if (editingCell) {
        handleCellChange(editingCell.value)
      }
      e.preventDefault()
      let newRow = row
      let newCol = col
      if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1)
      if (e.key === 'ArrowDown') newRow = Math.min(ROWS - 1, row + 1)
      if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1)
      if (e.key === 'ArrowRight') newCol = Math.min(COLUMNS.length - 1, col + 1)
      setSelectedCell({ row: newRow, col: newCol })
    } else if (e.key === 'F2') {
      // F2 to edit (Excel shortcut)
      e.preventDefault()
      setEditingCell({ row, col, value: getCellValue(row, col) })
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        
        // Pad data
        while (jsonData.length < ROWS) {
          jsonData.push(Array(COLUMNS.length).fill(''))
        }
        
        // Ensure all rows have correct column count
        jsonData.forEach((row, idx) => {
          if (!row || row.length < COLUMNS.length) {
            const padded = Array(COLUMNS.length).fill('')
            if (row) {
              row.forEach((val, colIdx) => {
                if (colIdx < COLUMNS.length) padded[colIdx] = val
              })
            }
            jsonData[idx] = padded
          }
        })
        
        setSheetData(jsonData)
        setWorkbook(wb)
        toast.success('Excel file loaded successfully!')
      } catch (error) {
        console.error('Error reading file:', error)
        toast.error('Failed to read Excel file')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function handleExport() {
    try {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(sheetData)
      
      // Apply styles (basic - ExcelJS would be better for full styling)
      XLSX.utils.book_append_sheet(wb, ws, 'Customer PO Entry')
      XLSX.writeFile(wb, 'Customer_PO_Entry.xlsx')
      toast.success('Excel file exported successfully!')
    } catch (error) {
      console.error('Error exporting file:', error)
      toast.error('Failed to export Excel file')
    }
  }

  async function handleSave() {
    try {
      const api = createApiClient(token)
      // Convert sheet data to form data format for backend
      const formData = parseSheetDataToFormData(sheetData)
      await api.post('/customers/po-entry/export', formData, {
        responseType: 'blob'
      })
      toast.success('PO Entry saved successfully!')
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save PO entry')
    }
  }

  function parseSheetDataToFormData(data) {
    const formData = {}
    const fieldMap = {
      'Customer Name': 'customerName',
      'Customer Address': 'customerAddress',
      'State': 'state',
      'Country': 'country',
      'GST No': 'gstNo',
      'Business Type': 'businessType',
      'Segment': 'segment',
      'Zone': 'zone',
      'Contract Agreement No': 'contractAgreementNo',
      'CA Date': 'caDate',
      'PO No': 'poNo',
      'PO Date': 'poDate',
      'Letter of Intent No': 'letterOfIntentNo',
      'LOI Date': 'loiDate',
      'Letter of Award No': 'letterOfAwardNo',
      'LOA Date': 'loaDate',
      'Tender Reference No': 'tenderReferenceNo',
      'Tender Date': 'tenderDate',
      'Description': 'description',
      'Payment Type': 'paymentType',
      'Payment Terms': 'paymentTerms',
      'Insurance Types': 'insuranceTypes',
      'Advance Bank Guarantee No': 'advanceBankGuaranteeNo',
      'ABG Date': 'abgDate',
      'Performance Bank Guarantee No': 'performanceBankGuaranteeNo',
      'PBG Date': 'pbgDate',
      'Sales Manager': 'salesManager',
      'Sales Head': 'salesHead',
      'Agent Name': 'agentName',
      'Agent Commission': 'agentCommission',
      'Delivery Schedule': 'deliverySchedule',
      'Liquidated Damages': 'liquidatedDamages',
      'PO Signed Concern Name': 'poSignedConcernName',
      'BOQ as per PO': 'boqAsPerPO',
      'Total Ex Works': 'totalExWorks',
      'Freight Amount': 'freightAmount',
      'GST': 'gst',
      'Total PO Value': 'totalPOValue'
    }

    data.forEach((row, rowIndex) => {
      if (row && row.length >= 2) {
        const fieldName = String(row[0] || '').trim()
        const value = String(row[1] || '').trim()
        if (fieldMap[fieldName] && value) {
          formData[fieldMap[fieldName]] = value
        }
      }
    })

    return formData
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-secondary-900">Purchase Order Entry</h1>
            <p className="text-sm text-secondary-600 mt-1">Manage customer PO entries in Excel format</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Excel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Excel Spreadsheet */}
        <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-250px)]" style={{ overflowX: 'auto', overflowY: 'auto' }}>
            <table ref={tableRef} className="min-w-full border-collapse" style={{ tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th className="w-16 h-8 bg-secondary-100 border border-secondary-300 text-xs font-medium text-secondary-600 sticky top-0 z-10"></th>
                  {COLUMNS.map(col => (
                    <th
                      key={col}
                      className="w-32 h-8 bg-secondary-100 border border-secondary-300 text-xs font-medium text-secondary-600 sticky top-0 z-10 text-center"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: ROWS }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="w-16 h-8 bg-secondary-50 border border-secondary-300 text-xs text-center text-secondary-600 sticky left-0 z-10">
                      {rowIndex + 1}
                    </td>
                    {COLUMNS.map((_, colIndex) => {
                      const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex
                      const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
                      const cellValue = getCellValue(rowIndex, colIndex)
                      const cellStyle = getCellStyle(rowIndex, colIndex)
                      const isHeader = isSectionHeader(rowIndex)
                      const isField = isFieldTitle(rowIndex, colIndex)

                      const cellBgColor = cellStyle.bgColor || (isHeader ? '#4472C4' : isField ? '#F2F2F2' : 'white')
                      const cellTextColor = cellStyle.textColor || (isHeader ? '#FFFFFF' : '#1F2937')
                      const cellFontWeight = cellStyle.bold || isHeader || isField ? 'bold' : 'normal'

                      return (
                        <td
                          key={colIndex}
                          className={`h-8 border border-secondary-300 relative overflow-visible ${
                            isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                          }`}
                          style={{
                            backgroundColor: cellBgColor,
                            color: cellTextColor,
                            fontWeight: cellFontWeight,
                            padding: 0,
                            position: 'relative',
                            overflow: isEditing ? 'visible' : 'hidden'
                          }}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                          tabIndex={0}
                        >
                          {isEditing ? (
                            <input
                              ref={(input) => {
                                if (input) {
                                  input.focus()
                                  input.select()
                                  // Expand input width to show full text
                                  const cellWidth = input.parentElement?.offsetWidth || 128
                                  const textWidth = input.scrollWidth || cellWidth
                                  input.style.minWidth = `${Math.max(cellWidth, textWidth + 20)}px`
                                }
                              }}
                              value={editingCell.value}
                              onChange={(e) => {
                                setEditingCell({ ...editingCell, value: e.target.value })
                                // Auto-expand input width as user types
                                const input = e.target
                                const cellWidth = input.parentElement?.offsetWidth || 128
                                const textWidth = input.scrollWidth || cellWidth
                                input.style.minWidth = `${Math.max(cellWidth, textWidth + 20)}px`
                              }}
                              onBlur={() => handleCellChange(editingCell.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                  e.preventDefault()
                                  handleCellChange(editingCell.value)
                                  if (e.key === 'Enter') {
                                    setSelectedCell({ row: Math.min(ROWS - 1, rowIndex + 1), col: colIndex })
                                  } else {
                                    setSelectedCell({ row: rowIndex, col: Math.min(COLUMNS.length - 1, colIndex + 1) })
                                  }
                                } else if (e.key === 'Escape') {
                                  setEditingCell(null)
                                }
                              }}
                              className="absolute left-0 top-0 h-full border-none outline-none px-2 py-1 text-sm"
                              style={{
                                backgroundColor: cellBgColor,
                                color: cellTextColor,
                                fontWeight: cellFontWeight,
                                fontSize: '14px',
                                lineHeight: '1.5',
                                margin: 0,
                                padding: '2px 8px',
                                boxSizing: 'border-box',
                                minWidth: '128px',
                                zIndex: 20,
                                whiteSpace: 'nowrap',
                                overflow: 'visible'
                              }}
                            />
                          ) : (
                            <div className="px-2 py-1 text-sm h-full flex items-center overflow-hidden">
                              <span className="truncate w-full" title={cellValue}>{cellValue || '\u00A0'}</span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


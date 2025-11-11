import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import ErrorBoundary from '../../components/ui/ErrorBoundary.jsx'
import { Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

// Memoized column letter calculation - supports unlimited columns (AA, AB, AC, etc.)
const getColumnLetter = (colIndex) => {
  let result = ''
  let index = colIndex
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result
    index = Math.floor(index / 26) - 1
  }
  return result
}

// Default column width
const DEFAULT_COLUMN_WIDTH = 100
const MIN_COLUMN_WIDTH = 50
const MAX_COLUMN_WIDTH = 500
const DEFAULT_ROW_HEIGHT = 25
const MIN_ROW_HEIGHT = 20
const MAX_ROW_HEIGHT = 200
const INITIAL_VISIBLE_ROWS = 100
const INITIAL_VISIBLE_COLUMNS = 50

export default function POEntry() {
  const [excelData, setExcelData] = useState([])
  const [workbook, setWorkbook] = useState(null)
  const [activeSheet, setActiveSheet] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingCell, setEditingCell] = useState(null) // { row, col }
  const [columnWidths, setColumnWidths] = useState({}) // Store custom column widths { colIndex: width }
  const [rowHeights, setRowHeights] = useState({}) // Store custom row heights { rowIndex: height }
  const [resizingColumn, setResizingColumn] = useState(null) // Track which column is being resized
  const [resizingRow, setResizingRow] = useState(null) // Track which row is being resized
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(0)
  const [resizeStartHeight, setResizeStartHeight] = useState(0)
  const fileInputRef = useRef(null)
  const tableRef = useRef(null)

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('File read result is empty')
        }

        const data = new Uint8Array(event.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        
        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          throw new Error('No sheets found in the Excel file')
        }
        
        setWorkbook(wb)
        const sheetName = wb.SheetNames[0]
        setActiveSheet(sheetName)
        
        const sheetData = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { 
          header: 1, 
          defval: '',
          raw: false 
        })
        
        setExcelData(sheetData)
        toast.success(`Excel file loaded! ${sheetData.length} rows`)
      } catch (error) {
        console.error('Error reading file:', error)
        toast.error(`Failed to read Excel file: ${error.message || 'Unknown error'}`)
        setWorkbook(null)
        setExcelData([])
      } finally {
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      toast.error('Error reading file. Please try again.')
      setIsLoading(false)
      setWorkbook(null)
      setExcelData([])
    }

    reader.readAsArrayBuffer(file)
  }, [])

  const handleSheetChange = useCallback((e) => {
    const sheetName = e.target.value
    setActiveSheet(sheetName)
    
    if (workbook?.Sheets[sheetName]) {
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' })
      setExcelData(sheetData)
    }
  }, [workbook])

  // Update cell value in both state and workbook
  const updateCellValue = useCallback((rowIndex, colIndex, value) => {
    // Update state
    setExcelData(prev => {
      const newData = [...prev]
      if (!newData[rowIndex]) {
        newData[rowIndex] = []
      }
      newData[rowIndex] = [...newData[rowIndex]]
      newData[rowIndex][colIndex] = value
      return newData
    })

    // Update workbook
    if (workbook && activeSheet) {
      const ws = workbook.Sheets[activeSheet]
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
      
      if (value === '' || value === null) {
        // Remove cell if empty
        delete ws[cellAddress]
      } else {
        // Update or create cell
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: 's', v: value }
        } else {
          ws[cellAddress].v = value
          ws[cellAddress].t = 's' // String type
        }
      }

      // Update workbook reference
      setWorkbook({ ...workbook })
    }
  }, [workbook, activeSheet])

  const handleCellBlur = useCallback((rowIndex, colIndex, value) => {
    updateCellValue(rowIndex, colIndex, value)
    setEditingCell(null)
  }, [updateCellValue])

  // Memoized cell value getter
  const getCellValue = useCallback((rowIndex, colIndex) => {
    const row = excelData[rowIndex]
    if (!row || row[colIndex] === undefined || row[colIndex] === null) {
      return ''
    }
    return String(row[colIndex])
  }, [excelData])

  // Get column width for a specific column
  const getColumnWidth = useCallback((colIndex) => {
    return columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH
  }, [columnWidths])

  // Get row height for a specific row
  const getRowHeight = useCallback((rowIndex) => {
    return rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT
  }, [rowHeights])

  // Memoized calculations - Truly unlimited columns and rows
  // Dynamically expand based on data and user interaction
  const maxColumns = useMemo(() => {
    if (excelData.length === 0) return INITIAL_VISIBLE_COLUMNS
    const maxDataColumns = Math.max(...excelData.map(row => row?.length || 0), 0)
    // Always show at least INITIAL_VISIBLE_COLUMNS, but expand if data requires more
    // Also check if user is editing beyond current max
    const editingCol = editingCell?.col ?? -1
    return Math.max(maxDataColumns, INITIAL_VISIBLE_COLUMNS, editingCol + 1)
  }, [excelData, editingCell])

  const maxRows = useMemo(() => {
    const dataRows = excelData.length
    const editingRow = editingCell?.row ?? -1
    // Always show at least INITIAL_VISIBLE_ROWS, but expand if data requires more
    return Math.max(dataRows, INITIAL_VISIBLE_ROWS, editingRow + 1)
  }, [excelData.length, editingCell])

  // Column resizing handlers
  const handleColumnResizeStart = useCallback((e, colIndex) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingColumn(colIndex)
    setResizeStartX(e.clientX)
    setResizeStartWidth(getColumnWidth(colIndex))
  }, [getColumnWidth])

  const handleRowResizeStart = useCallback((e, rowIndex) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingRow(rowIndex)
    setResizeStartY(e.clientY)
    setResizeStartHeight(getRowHeight(rowIndex))
  }, [getRowHeight])

  // Global mouse move handler for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (resizingColumn !== null) {
        const diff = e.clientX - resizeStartX
        const newWidth = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, resizeStartWidth + diff))
        setColumnWidths(prev => ({ ...prev, [resizingColumn]: newWidth }))
      }
      if (resizingRow !== null) {
        const diff = e.clientY - resizeStartY
        const newHeight = Math.max(MIN_ROW_HEIGHT, Math.min(MAX_ROW_HEIGHT, resizeStartHeight + diff))
        setRowHeights(prev => ({ ...prev, [resizingRow]: newHeight }))
      }
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
      setResizingRow(null)
    }

    if (resizingColumn !== null || resizingRow !== null) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizingColumn, resizingRow, resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight])

  const handleCellKeyDown = useCallback((e, rowIndex, colIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = e.target.textContent || ''
      updateCellValue(rowIndex, colIndex, value)
      setEditingCell(null)
      
      // Move to next row - unlimited, will expand dynamically
      setTimeout(() => {
        setEditingCell({ row: rowIndex + 1, col: colIndex })
      }, 10)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const value = e.target.textContent || ''
      updateCellValue(rowIndex, colIndex, value)
      setEditingCell(null)
      
      // Move to next column - unlimited, will expand dynamically
      setTimeout(() => {
        const nextCol = colIndex + 1
        setEditingCell({ row: rowIndex, col: nextCol })
      }, 10)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditingCell(null)
      // Restore original value
      const originalValue = getCellValue(rowIndex, colIndex)
      if (e.target) {
        e.target.textContent = originalValue
      }
    } else if (e.key === 'ArrowRight') {
      const selection = window.getSelection()
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
      const isAtEnd = range && range.endOffset === e.target.textContent.length
      
      if (isAtEnd) {
        e.preventDefault()
        const value = e.target.textContent || ''
        updateCellValue(rowIndex, colIndex, value)
        // Unlimited columns - will expand dynamically
        setEditingCell({ row: rowIndex, col: colIndex + 1 })
      }
    } else if (e.key === 'ArrowLeft') {
      const selection = window.getSelection()
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
      const isAtStart = range && range.startOffset === 0
      
      if (isAtStart && colIndex > 0) {
        e.preventDefault()
        const value = e.target.textContent || ''
        updateCellValue(rowIndex, colIndex, value)
        setEditingCell({ row: rowIndex, col: colIndex - 1 })
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const value = e.target.textContent || ''
      updateCellValue(rowIndex, colIndex, value)
      // Unlimited rows - will expand dynamically
      setEditingCell({ row: rowIndex + 1, col: colIndex })
    } else if (e.key === 'ArrowUp') {
      if (rowIndex > 0) {
        e.preventDefault()
        const value = e.target.textContent || ''
        updateCellValue(rowIndex, colIndex, value)
        setEditingCell({ row: rowIndex - 1, col: colIndex })
      }
    }
  }, [updateCellValue, getCellValue])

  const handleCellClick = useCallback((rowIndex, colIndex) => {
    // Allow clicking anywhere - will expand dynamically
    setEditingCell({ row: rowIndex, col: colIndex })
  }, [])

  const handleCellFocus = useCallback((e) => {
    // Select all text when cell is focused
    if (e.target) {
      const range = document.createRange()
      range.selectNodeContents(e.target)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }, [])

  const handleExport = useCallback(() => {
    try {
      let wb = workbook
      
      if (!wb) {
        // Create new workbook if none exists
        wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet(excelData)
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      } else {
        // Update workbook with current data
        const ws = XLSX.utils.aoa_to_sheet(excelData)
        wb.Sheets[activeSheet || wb.SheetNames[0]] = ws
      }
      
      const fileName = `PO_Entry_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)
      toast.success('Excel file exported successfully!')
    } catch (error) {
      console.error('Error exporting file:', error)
      toast.error('Failed to export Excel file')
    }
  }, [workbook, excelData, activeSheet])

  // Memoized column letters array
  const columnLetters = useMemo(() => {
    return Array.from({ length: maxColumns }, (_, i) => getColumnLetter(i))
  }, [maxColumns])

  const hasMultipleSheets = workbook && workbook.SheetNames.length > 1
  const rowCount = excelData.length

  return (
    <ErrorBoundary message="An error occurred while loading the Purchase Order Entry page. Please try refreshing.">
      <DashboardLayout>
        <div className="flex flex-col h-full w-full">
          {/* Minimal Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">
                Purchase Order Entry
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {workbook && hasMultipleSheets && (
                <select
                  value={activeSheet}
                  onChange={handleSheetChange}
                  className="px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {workbook.SheetNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 hover:bg-secondary-50 dark:hover:bg-[#243045] transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load Excel'
                )}
              </button>
            </div>
          </div>

          {/* Full Page Excel Spreadsheet */}
          <div className="flex-1 bg-white dark:bg-[#1E293B] rounded-lg border border-secondary-200 dark:border-secondary-800 shadow-sm overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="inline-block min-w-full">
                <table className="border-collapse select-none" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th 
                        className="sticky top-0 left-0 z-20 bg-[#f8f9fa] dark:bg-[#1f2937] border border-[#dadce0] dark:border-[#374151] px-2 py-1.5 text-center text-xs font-semibold text-[#5f6368] dark:text-gray-400"
                        style={{ minWidth: '50px', width: '50px' }}
                      >
                      </th>
                      {columnLetters.map((letter, colIndex) => {
                        const colWidth = getColumnWidth(colIndex)
                        return (
                          <th
                            key={colIndex}
                            className="sticky top-0 z-10 bg-[#f8f9fa] dark:bg-[#1f2937] border border-[#dadce0] dark:border-[#374151] px-0 py-1.5 text-center text-xs font-semibold text-[#5f6368] dark:text-gray-400 relative group"
                            style={{ minWidth: `${colWidth}px`, width: `${colWidth}px` }}
                          >
                            <div className="px-2">{letter}</div>
                            {/* Column resize handle */}
                            <div
                              onMouseDown={(e) => handleColumnResizeStart(e, colIndex)}
                              className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors ${
                                resizingColumn === colIndex ? 'bg-blue-500' : 'hover:bg-blue-400/50'
                              }`}
                              style={{ zIndex: 15 }}
                            />
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: maxRows }, (_, rowIndex) => {
                      const isEmptyRow = rowIndex >= rowCount
                      const rowHeight = getRowHeight(rowIndex)
                      return (
                        <tr 
                          key={rowIndex} 
                          className="hover:bg-[#f8f9fa] dark:hover:bg-[#1e293b] relative group"
                          style={{ height: `${rowHeight}px` }}
                        >
                          <td 
                            className="sticky left-0 z-10 bg-white dark:bg-[#111827] border border-[#dadce0] dark:border-[#374151] px-2 py-1.5 text-center text-xs font-medium text-[#5f6368] dark:text-gray-400 relative"
                            style={{ minWidth: '50px', width: '50px' }}
                          >
                            {rowIndex + 1}
                            {/* Row resize handle */}
                            <div
                              onMouseDown={(e) => handleRowResizeStart(e, rowIndex)}
                              className={`absolute bottom-0 left-0 w-full h-1 cursor-row-resize transition-colors ${
                                resizingRow === rowIndex ? 'bg-blue-500' : 'hover:bg-blue-400/50'
                              }`}
                              style={{ zIndex: 15 }}
                            />
                          </td>
                          {Array.from({ length: maxColumns }, (_, colIndex) => {
                            const cellValue = isEmptyRow ? '' : getCellValue(rowIndex, colIndex)
                            const isEmpty = !cellValue && isEmptyRow
                            const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
                            const colWidth = getColumnWidth(colIndex)
                            
                            return (
                              <td
                                key={colIndex}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                className={`border border-[#dadce0] dark:border-[#374151] px-2 py-1.5 text-left text-[#202124] dark:text-gray-200 cursor-cell ${
                                  isEmpty 
                                    ? 'bg-[#f8f9fa] dark:bg-[#0f172a]' 
                                    : 'bg-white dark:bg-[#111827] hover:bg-[#f1f3f4] dark:hover:bg-[#1e293b]'
                                } ${isEditing ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                style={{ minWidth: `${colWidth}px`, width: `${colWidth}px`, height: `${rowHeight}px` }}
                              >
                                {isEditing ? (
                                  <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleCellBlur(rowIndex, colIndex, e.target.textContent || '')}
                                    onKeyDown={(e) => handleCellKeyDown(e, rowIndex, colIndex)}
                                    onFocus={handleCellFocus}
                                    className="outline-none min-h-[20px]"
                                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                                  >
                                    {cellValue}
                                  </div>
                                ) : (
                                  <span className="block truncate" title={cellValue}>
                                    {cellValue || '\u00A0'}
                                  </span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  )
}

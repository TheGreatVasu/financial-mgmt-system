import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import ErrorBoundary from '../../components/ui/ErrorBoundary.jsx'
import { Download, Loader2, Settings, X } from 'lucide-react'
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
  const [manualSheetRows, setManualSheetRows] = useState(null) // null = auto, number = manual
  const [manualSheetColumns, setManualSheetColumns] = useState(null) // null = auto, number = manual
  const [showSheetSizeModal, setShowSheetSizeModal] = useState(false)
  const [tempRows, setTempRows] = useState(INITIAL_VISIBLE_ROWS)
  const [tempColumns, setTempColumns] = useState(INITIAL_VISIBLE_COLUMNS)
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
  // Dynamically expand based on data and user interaction, or use manual size if set
  const maxColumns = useMemo(() => {
    // If manual size is set, use it
    if (manualSheetColumns !== null) {
      return Math.max(manualSheetColumns, 1) // At least 1 column
    }
    
    // Otherwise, auto-expand based on data and editing
    if (excelData.length === 0) return INITIAL_VISIBLE_COLUMNS
    const maxDataColumns = Math.max(...excelData.map(row => row?.length || 0), 0)
    // Always show at least INITIAL_VISIBLE_COLUMNS, but expand if data requires more
    // Also check if user is editing beyond current max
    const editingCol = editingCell?.col ?? -1
    return Math.max(maxDataColumns, INITIAL_VISIBLE_COLUMNS, editingCol + 1)
  }, [excelData, editingCell, manualSheetColumns])

  const maxRows = useMemo(() => {
    // If manual size is set, use it
    if (manualSheetRows !== null) {
      return Math.max(manualSheetRows, 1) // At least 1 row
    }
    
    // Otherwise, auto-expand based on data and editing
    const dataRows = excelData.length
    const editingRow = editingCell?.row ?? -1
    // Always show at least INITIAL_VISIBLE_ROWS, but expand if data requires more
    return Math.max(dataRows, INITIAL_VISIBLE_ROWS, editingRow + 1)
  }, [excelData.length, editingCell, manualSheetRows])

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

  // Sheet size modal handlers
  const handleOpenSheetSizeModal = useCallback(() => {
    setTempRows(manualSheetRows ?? maxRows)
    setTempColumns(manualSheetColumns ?? maxColumns)
    setShowSheetSizeModal(true)
  }, [manualSheetRows, manualSheetColumns, maxRows, maxColumns])

  const handleCloseSheetSizeModal = useCallback(() => {
    setShowSheetSizeModal(false)
  }, [])

  const handleApplySheetSize = useCallback(() => {
    const rows = parseInt(tempRows, 10)
    const cols = parseInt(tempColumns, 10)
    
    if (isNaN(rows) || rows < 1 || rows > 1000000) {
      toast.error('Please enter a valid number of rows (1-1,000,000)')
      return
    }
    
    if (isNaN(cols) || cols < 1 || cols > 16384) {
      toast.error('Please enter a valid number of columns (1-16,384)')
      return
    }
    
    setManualSheetRows(rows)
    setManualSheetColumns(cols)
    setShowSheetSizeModal(false)
    toast.success(`Sheet size set to ${rows} rows × ${cols} columns`)
  }, [tempRows, tempColumns])

  const handleResetSheetSize = useCallback(() => {
    setManualSheetRows(null)
    setManualSheetColumns(null)
    setShowSheetSizeModal(false)
    toast.success('Sheet size reset to auto-expand mode')
  }, [])

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
                onClick={handleOpenSheetSizeModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 hover:bg-secondary-50 dark:hover:bg-[#243045] transition-colors"
                title="Set sheet size (rows × columns)"
              >
                <Settings className="h-4 w-4" />
                Sheet Size
                {(manualSheetRows !== null || manualSheetColumns !== null) && (
                  <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                    ({maxRows}×{maxColumns})
                  </span>
                )}
              </button>
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

        {/* Sheet Size Modal */}
        {showSheetSizeModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCloseSheetSizeModal}
          >
            <div 
              className="bg-white dark:bg-[#1E293B] rounded-lg shadow-xl max-w-md w-full mx-4 border border-secondary-200 dark:border-secondary-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-800">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-gray-100">
                  Set Sheet Size
                </h2>
                <button
                  onClick={handleCloseSheetSizeModal}
                  className="text-secondary-500 hover:text-secondary-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                      Number of Rows
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000000"
                      value={tempRows}
                      onChange={(e) => setTempRows(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter number of rows (1-1,000,000)"
                    />
                    <p className="mt-1 text-xs text-secondary-500 dark:text-gray-400">
                      Excel supports up to 1,048,576 rows
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                      Number of Columns
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="16384"
                      value={tempColumns}
                      onChange={(e) => setTempColumns(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter number of columns (1-16,384)"
                    />
                    <p className="mt-1 text-xs text-secondary-500 dark:text-gray-400">
                      Excel supports up to 16,384 columns (XFD)
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Current Size:</strong> {maxRows} rows × {maxColumns} columns
                    {manualSheetRows !== null || manualSheetColumns !== null ? (
                      <span className="block mt-1 text-xs">Manual size is active</span>
                    ) : (
                      <span className="block mt-1 text-xs">Auto-expand mode (expands as you work)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 border-t border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-[#0f172a]">
                <button
                  onClick={handleResetSheetSize}
                  className="px-4 py-2 text-sm font-medium text-secondary-700 dark:text-gray-300 hover:text-secondary-900 dark:hover:text-gray-100 transition-colors"
                >
                  Reset to Auto
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCloseSheetSizeModal}
                    className="px-4 py-2 text-sm font-medium text-secondary-700 dark:text-gray-300 hover:bg-secondary-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplySheetSize}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ErrorBoundary>
  )
}

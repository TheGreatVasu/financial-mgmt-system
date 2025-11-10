import { useState, useRef, useMemo, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import ErrorBoundary from '../../components/ui/ErrorBoundary.jsx'
import { Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

// Memoized column letter calculation
const getColumnLetter = (colIndex) => {
  let result = ''
  let index = colIndex
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result
    index = Math.floor(index / 26) - 1
  }
  return result
}

export default function POEntry() {
  const [excelData, setExcelData] = useState([])
  const [workbook, setWorkbook] = useState(null)
  const [activeSheet, setActiveSheet] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingCell, setEditingCell] = useState(null) // { row, col }
  const fileInputRef = useRef(null)

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

  // Memoized calculations - Unlimited columns and rows
  const maxColumns = useMemo(() => {
    if (excelData.length === 0) return 50 // Default 50 columns for empty sheet
    return Math.max(...excelData.map(row => row?.length || 0), 50)
  }, [excelData])

  const maxRows = useMemo(() => {
    return Math.max(excelData.length, 100) // Default 100 rows for empty sheet
  }, [excelData.length])

  const handleCellKeyDown = useCallback((e, rowIndex, colIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = e.target.textContent || ''
      updateCellValue(rowIndex, colIndex, value)
      setEditingCell(null)
      
      // Move to next row
      setTimeout(() => {
        const nextRow = rowIndex + 1
        if (nextRow < maxRows) {
          setEditingCell({ row: nextRow, col: colIndex })
        }
      }, 10)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const value = e.target.textContent || ''
      updateCellValue(rowIndex, colIndex, value)
      setEditingCell(null)
      
      // Move to next column
      setTimeout(() => {
        const nextCol = colIndex + 1
        if (nextCol < maxColumns) {
          setEditingCell({ row: rowIndex, col: nextCol })
        } else if (rowIndex + 1 < maxRows) {
          // Move to next row, first column
          setEditingCell({ row: rowIndex + 1, col: 0 })
        }
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
      
      if (isAtEnd && colIndex + 1 < maxColumns) {
        e.preventDefault()
        const value = e.target.textContent || ''
        updateCellValue(rowIndex, colIndex, value)
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
      if (rowIndex + 1 < maxRows) {
        e.preventDefault()
        const value = e.target.textContent || ''
        updateCellValue(rowIndex, colIndex, value)
        setEditingCell({ row: rowIndex + 1, col: colIndex })
      }
    } else if (e.key === 'ArrowUp') {
      if (rowIndex > 0) {
        e.preventDefault()
        const value = e.target.textContent || ''
        updateCellValue(rowIndex, colIndex, value)
        setEditingCell({ row: rowIndex - 1, col: colIndex })
      }
    }
  }, [maxRows, maxColumns, updateCellValue, getCellValue])

  const handleCellClick = useCallback((rowIndex, colIndex) => {
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
                      <th className="sticky top-0 left-0 z-20 bg-[#f8f9fa] dark:bg-[#1f2937] border border-[#dadce0] dark:border-[#374151] px-2 py-1.5 text-center text-xs font-semibold text-[#5f6368] dark:text-gray-400 min-w-[50px] w-[50px]">
                      </th>
                      {columnLetters.map((letter, colIndex) => (
                        <th
                          key={colIndex}
                          className="sticky top-0 z-10 bg-[#f8f9fa] dark:bg-[#1f2937] border border-[#dadce0] dark:border-[#374151] px-2 py-1.5 text-center text-xs font-semibold text-[#5f6368] dark:text-gray-400 min-w-[100px] w-[100px]"
                        >
                          {letter}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: maxRows }, (_, rowIndex) => {
                      const isEmptyRow = rowIndex >= rowCount
                      return (
                        <tr key={rowIndex} className="hover:bg-[#f8f9fa] dark:hover:bg-[#1e293b]">
                          <td className="sticky left-0 z-10 bg-white dark:bg-[#111827] border border-[#dadce0] dark:border-[#374151] px-2 py-1.5 text-center text-xs font-medium text-[#5f6368] dark:text-gray-400 min-w-[50px] w-[50px]">
                            {rowIndex + 1}
                          </td>
                          {Array.from({ length: maxColumns }, (_, colIndex) => {
                            const cellValue = isEmptyRow ? '' : getCellValue(rowIndex, colIndex)
                            const isEmpty = !cellValue && isEmptyRow
                            const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
                            
                            return (
                              <td
                                key={colIndex}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                className={`border border-[#dadce0] dark:border-[#374151] px-2 py-1.5 text-left text-[#202124] dark:text-gray-200 min-w-[100px] w-[100px] cursor-cell ${
                                  isEmpty 
                                    ? 'bg-[#f8f9fa] dark:bg-[#0f172a]' 
                                    : 'bg-white dark:bg-[#111827] hover:bg-[#f1f3f4] dark:hover:bg-[#1e293b]'
                                } ${isEditing ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
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

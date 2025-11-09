import { useState, useRef, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { Upload, Download, FileSpreadsheet, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExcelViewer({ onDataChange, initialData = null }) {
  const [workbook, setWorkbook] = useState(null)
  const [activeSheet, setActiveSheet] = useState('')
  const [sheetData, setSheetData] = useState([])
  const [headers, setHeaders] = useState([])
  const [editingCell, setEditingCell] = useState(null)
  const fileInputRef = useRef(null)
  const prevDataRef = useRef(null)

  // Memoize data key for comparison
  const dataKey = useMemo(() => {
    return initialData ? JSON.stringify(initialData) : null
  }, [initialData])

  useEffect(() => {
    if (initialData && dataKey !== prevDataRef.current) {
      prevDataRef.current = dataKey
      loadWorkbookFromData(initialData)
    }
  }, [dataKey, initialData])

  function loadWorkbookFromData(data) {
    try {
      // Create a workbook from the data structure
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet([
        ['CUSTOMER PURCHASE ORDER ENTRY FORM', ''],
        [''],
        // Add sections and data
        ['Customer Details', ''],
        ['Customer Name', data.customerName || ''],
        ['Customer Address', data.customerAddress || ''],
        ['State', data.state || ''],
        ['Country', data.country || ''],
        ['GST No', data.gstNo || ''],
        ['Business Type', data.businessType || ''],
        ['Segment', data.segment || ''],
        ['Zone', data.zone || ''],
        [''],
        ['Contract and Purchase Order Details', ''],
        ['Contract Agreement No', data.contractAgreementNo || ''],
        ['CA Date', data.caDate || ''],
        ['PO No', data.poNo || ''],
        ['PO Date', data.poDate || ''],
        ['Letter of Intent No', data.letterOfIntentNo || ''],
        ['LOI Date', data.loiDate || ''],
        ['Letter of Award No', data.letterOfAwardNo || ''],
        ['LOA Date', data.loaDate || ''],
        ['Tender Reference No', data.tenderReferenceNo || ''],
        ['Tender Date', data.tenderDate || ''],
        ['Description', data.description || ''],
        [''],
        ['Payment and Guarantee Section', ''],
        ['Payment Type', data.paymentType || ''],
        ['Payment Terms', data.paymentTerms || ''],
        ['Insurance Types', data.insuranceTypes || ''],
        ['Advance Bank Guarantee No', data.advanceBankGuaranteeNo || ''],
        ['ABG Date', data.abgDate || ''],
        ['Performance Bank Guarantee No', data.performanceBankGuaranteeNo || ''],
        ['PBG Date', data.pbgDate || ''],
        [''],
        ['Sales-Related Information', ''],
        ['Sales Manager', data.salesManager || ''],
        ['Sales Head', data.salesHead || ''],
        ['Agent Name', data.agentName || ''],
        ['Agent Commission', data.agentCommission || ''],
        [''],
        ['Additional Fields', ''],
        ['Delivery Schedule', data.deliverySchedule || ''],
        ['Liquidated Damages', data.liquidatedDamages || ''],
        ['PO Signed Concern Name', data.poSignedConcernName || ''],
        ['BOQ as per PO', data.boqAsPerPO || ''],
        [''],
        ['Financial Summary', ''],
        ['Total Ex Works', data.totalExWorks || ''],
        ['Freight Amount', data.freightAmount || ''],
        ['GST', data.gst || ''],
        ['Total PO Value', data.totalPOValue || '']
      ])
      
      XLSX.utils.book_append_sheet(wb, ws, 'Customer PO Entry')
      setWorkbook(wb)
      setActiveSheet('Customer PO Entry')
      parseSheetData(ws)
    } catch (error) {
      console.error('Error loading workbook:', error)
      toast.error('Failed to load data')
    }
  }

  function parseSheetData(worksheet) {
    if (!worksheet) return
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
    if (jsonData.length > 0) {
      setSheetData(jsonData)
      // First row as headers if available
      if (jsonData[0] && Array.isArray(jsonData[0])) {
        setHeaders(jsonData[0])
      }
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
        setWorkbook(wb)
        
        // Set first sheet as active
        const firstSheetName = wb.SheetNames[0]
        setActiveSheet(firstSheetName)
        parseSheetData(wb.Sheets[firstSheetName])
        
        toast.success('Excel file loaded successfully!')
      } catch (error) {
        console.error('Error reading file:', error)
        toast.error('Failed to read Excel file')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleCellChange(rowIndex, colIndex, value) {
    if (!workbook || !activeSheet) return
    
    const ws = workbook.Sheets[activeSheet]
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
    
    // Update cell value
    if (!ws[cellAddress]) {
      ws[cellAddress] = { t: 's', v: value }
    } else {
      ws[cellAddress].v = value
    }
    
    // Update local state
    const newData = [...sheetData]
    if (!newData[rowIndex]) newData[rowIndex] = []
    newData[rowIndex][colIndex] = value
    setSheetData(newData)
    
    // Notify parent component
    if (onDataChange) {
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      onDataChange(jsonData)
    }
  }

  function handleExport() {
    if (!workbook) {
      toast.error('No data to export')
      return
    }

    try {
      XLSX.writeFile(workbook, 'Customer_PO_Entry.xlsx')
      toast.success('Excel file exported successfully!')
    } catch (error) {
      console.error('Error exporting file:', error)
      toast.error('Failed to export Excel file')
    }
  }

  function getCellValue(rowIndex, colIndex) {
    if (!sheetData[rowIndex] || !sheetData[rowIndex][colIndex]) return ''
    return sheetData[rowIndex][colIndex]
  }

  function isSectionHeader(row) {
    if (!row || row.length === 0) return false
    const firstCell = String(row[0] || '').trim()
    return firstCell.length > 0 && (
      firstCell.includes('Details') ||
      firstCell.includes('Section') ||
      firstCell.includes('Information') ||
      firstCell.includes('Fields') ||
      firstCell.includes('Summary') ||
      firstCell.includes('FORM')
    )
  }

  if (!workbook && !initialData) {
    return (
      <div className="rounded-xl border-2 border-dashed border-secondary-300 bg-secondary-50 p-12 text-center">
        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-secondary-400" />
        <h3 className="text-lg font-semibold text-secondary-700 mb-2">No Excel Data</h3>
        <p className="text-sm text-secondary-600 mb-4">Upload an Excel file or fill the form to view data</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Excel File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {workbook && workbook.SheetNames.length > 1 && (
            <select
              value={activeSheet}
              onChange={(e) => {
                setActiveSheet(e.target.value)
                parseSheetData(workbook.Sheets[e.target.value])
              }}
              className="px-3 py-2 rounded-lg border border-secondary-300 bg-white text-sm"
            >
              {workbook.SheetNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
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

      {/* Excel Table */}
      <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[600px]">
          <table className="min-w-full text-sm">
            <tbody>
              {sheetData.map((row, rowIndex) => {
                const isHeader = isSectionHeader(row)
                const isEmpty = !row || row.length === 0 || row.every(cell => !cell)
                
                if (isEmpty) {
                  return <tr key={rowIndex}><td colSpan={2} className="h-2" /></tr>
                }

                return (
                  <tr
                    key={rowIndex}
                    className={isHeader ? 'bg-blue-600 text-white' : 'hover:bg-secondary-50'}
                  >
                    {[0, 1].map((colIndex) => {
                      const cellValue = getCellValue(rowIndex, colIndex)
                      const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex
                      const isFieldTitle = colIndex === 0 && !isHeader
                      const isDataCell = colIndex === 1 && !isHeader

                      return (
                        <td
                          key={colIndex}
                          className={`px-4 py-3 border-b border-secondary-200 ${
                            isHeader
                              ? 'font-semibold text-white'
                              : isFieldTitle
                              ? 'font-medium text-secondary-700 bg-secondary-50'
                              : 'text-secondary-800'
                          } ${isDataCell ? 'cursor-pointer' : ''}`}
                          onDoubleClick={() => {
                            if (isDataCell) {
                              setEditingCell({ row: rowIndex, col: colIndex, value: cellValue })
                            }
                          }}
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              value={editingCell.value}
                              onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                              onBlur={() => {
                                handleCellChange(rowIndex, colIndex, editingCell.value)
                                setEditingCell(null)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                  e.preventDefault()
                                  handleCellChange(rowIndex, colIndex, editingCell.value)
                                  setEditingCell(null)
                                }
                                if (e.key === 'Escape') {
                                  setEditingCell(null)
                                }
                              }}
                              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="block truncate">{cellValue || '\u00A0'}</span>
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
  )
}


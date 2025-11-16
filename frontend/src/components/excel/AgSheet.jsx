import React from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

/**
 * AgSheet
 * - High-performance spreadsheet-like grid using AG Grid Community
 * - Infinite Row Model for virtualized 100k+ rows
 * - Editable cells, copy-paste, smooth scrolling
 * - Dynamic sheet sizing via button (rows, columns)
 */
export default function AgSheet() {
  const gridRef = React.useRef(null)

  // Rows/Cols visible size (virtualized)
  const [rowCount, setRowCount] = React.useState(100000)
  const [colCount, setColCount] = React.useState(10)

  // Track edits sparsely: key "r{row}c{col}" -> string value
  const editsRef = React.useRef(new Map())

  // Generate column definitions based on current colCount
  const columnDefs = React.useMemo(() => {
    const toLetters = (n) => {
      let s = ''
      let x = n
      while (x >= 0) {
        s = String.fromCharCode((x % 26) + 65) + s
        x = Math.floor(x / 26) - 1
      }
      return s
    }
    return Array.from({ length: colCount }, (_, i) => {
      const field = `col_${i}`
      return {
        headerName: toLetters(i),
        field,
        editable: true,
        resizable: true,
      }
    })
  }, [colCount])

  // Build a row object on the fly
  function buildRow(rowIndex) {
    const row = {}
    for (let c = 0; c < colCount; c++) {
      const key = `r${rowIndex}c${c}`
      row[`col_${c}`] = editsRef.current.get(key) ?? ''
    }
    return row
  }

  // Datasource for Infinite Row Model (virtualized)
  const datasource = React.useMemo(() => {
    return {
      getRows(params) {
        const { startRow, endRow } = params.request
        const lastRow = rowCount
        const rows = []
        for (let r = startRow; r < Math.min(endRow, lastRow); r++) {
          rows.push(buildRow(r))
        }
        // Simulate async to keep UI responsive
        setTimeout(() => params.successCallback(rows, lastRow), 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowCount, colCount])

  // Set datasource on grid ready and when deps change
  const onGridReady = React.useCallback((params) => {
    gridRef.current = params.api
    // Use setDatasource for broad version compatibility
    params.api.setDatasource?.(datasource)
  }, [datasource])

  React.useEffect(() => {
    if (gridRef.current) {
      gridRef.current.setDatasource?.(datasource)
      gridRef.current.refreshInfiniteCache?.()
    }
  }, [datasource])

  // Handle edits: store only changed values
  const onCellValueChanged = React.useCallback((event) => {
    const rowIndex = event.node.rowIndex
    const colKey = event.colDef.field // col_N
    const colIndex = parseInt(colKey.split('_')[1], 10)
    const key = `r${rowIndex}c${colIndex}`
    const value = event.newValue ?? ''
    if (!value) {
      editsRef.current.delete(key)
    } else {
      editsRef.current.set(key, String(value))
    }
  }, [])

  const setSize = React.useCallback(() => {
    const input = window.prompt('Enter rows,columns (e.g., 100000,20):', `${rowCount},${colCount}`)
    if (!input) return
    const [rowsStr, colsStr] = input.split(',')
    const rows = parseInt(rowsStr?.trim(), 10)
    const cols = parseInt(colsStr?.trim(), 10)
    if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows <= 0 || cols <= 0) {
      alert('Please enter positive integers for rows and columns.')
      return
    }
    setRowCount(rows)
    setColCount(cols)
    // Clear the cache so the grid re-queries the datasource with new bounds
    requestAnimationFrame(() => {
      gridRef.current?.refreshInfiniteCache?.()
      gridRef.current?.sizeColumnsToFit?.()
    })
  }, [rowCount, colCount])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={setSize}
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
          Rows: {rowCount.toLocaleString()} | Columns: {colCount.toLocaleString()}
        </div>
      </div>

      <div className="ag-theme-quartz" style={{ width: '100%', height: '80vh', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
        <AgGridReact
          // virtualization
          rowModelType="infinite"
          datasource={datasource}
          cacheBlockSize={1000}
          maxBlocksInCache={10}
          rowBuffer={200}
          suppressAggFuncInHeader
          // columns + editing
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: false,
            filter: false,
            resizable: true,
            editable: true,
          }}
          // clipboard and range selection
          enableCellTextSelection={true}
          suppressClipboardApi={false}
          // events
          onGridReady={onGridReady}
          onCellValueChanged={onCellValueChanged}
          onFirstDataRendered={() => gridRef.current?.sizeColumnsToFit?.()}
        />
      </div>
    </div>
  )
}



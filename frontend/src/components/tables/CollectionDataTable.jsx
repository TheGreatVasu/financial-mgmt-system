import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  Download, 
  Filter, 
  X,
  Search,
  Save,
  XCircle,
  ChevronDown
} from 'lucide-react'

// Default row data structure
const defaultRowData = {
    collectionIncharge: 'Default',
    customerName: 'Default',
    segment: 'Default',
    packageName: 'Default',
    totalOutstanding: 0,
    notDue: 0,
    overdue: 0,
    dueThisMonth: 0,
    totalDueForPlan: 0,
    planFinalised: 0,
    received: 0,
    statutoryDeductions: 0,
  balance: 0,
  targetAchieved: 0
}

const CollectionDataTable = ({ 
  data = [], 
  onAddRow, 
  onEditRow, 
  onDeleteRow, 
  onViewRow,
  loading = false 
}) => {
  const [gridApi, setGridApi] = useState(null)
  const [columnApi, setColumnApi] = useState(null)
  const [quickFilter, setQuickFilter] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [editingRow, setEditingRow] = useState(null)
  const [internalData, setInternalData] = useState(() => {
    // Initialize with data if provided, otherwise default row
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
    return [{ ...defaultRowData, id: Date.now() }]
  })
  const [error, setError] = useState(null)
  
  // Sync internal data with prop data
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      setInternalData(data)
      // Refresh grid when data changes
      if (gridApi) {
        gridApi.setRowData(data)
        gridApi.refreshCells()
      }
    } else if ((!data || !Array.isArray(data) || data.length === 0) && internalData.length === 0) {
      // Initialize with default row if no data
      const defaultRow = { ...defaultRowData, id: Date.now() }
      setInternalData([defaultRow])
      if (gridApi) {
        gridApi.setRowData([defaultRow])
        gridApi.refreshCells()
      }
    }
  }, [data, gridApi])

  // Column definitions with Excel-like styling
  const columnDefs = useMemo(() => [
    {
      headerName: '#',
      field: 'id',
      width: 60,
      pinned: 'left',
      cellRenderer: (params) => params.node.rowIndex + 1,
      cellStyle: { 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontWeight: '600',
        backgroundColor: '#f9fafb'
      },
      headerClass: 'bg-gray-50 font-semibold',
      suppressMovable: true,
      lockPosition: true
    },
    {
      headerName: 'Collection Incharge',
      field: 'collectionIncharge',
      width: 180,
      editable: true,
      filter: 'agTextColumnFilter',
      cellEditor: 'agTextCellEditor',
      cellStyle: { 
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb'
      },
      headerTooltip: 'Collection Incharge (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Customer Name',
      field: 'customerName',
      width: 200,
      editable: true,
      filter: 'agTextColumnFilter',
      cellStyle: { 
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb'
      },
      headerTooltip: 'Customer Name (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Segment',
      field: 'segment',
      width: 150,
      editable: true,
      filter: 'agTextColumnFilter',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Default', 'Domestic', 'Export', 'Government', 'Private']
      },
      cellStyle: { 
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb'
      },
      headerTooltip: 'Segment (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Package Name',
      field: 'packageName',
      width: 180,
      editable: true,
      filter: 'agTextColumnFilter',
      cellStyle: { 
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb'
      },
      headerTooltip: 'Package Name (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Total Outstanding',
      field: 'totalOutstanding',
      width: 160,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace'
      },
      type: 'numericColumn',
      headerTooltip: 'Total Outstanding (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Not Due',
      field: 'notDue',
      width: 140,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace'
      },
      type: 'numericColumn',
      headerTooltip: 'Not Due (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Overdue',
      field: 'overdue',
      width: 140,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace',
        color: '#dc2626'
      },
      type: 'numericColumn',
      headerTooltip: 'Overdue (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Due for this Month',
      field: 'dueThisMonth',
      width: 160,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace'
      },
      type: 'numericColumn',
      headerTooltip: 'Due for this Month (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Total Due for Plan',
      field: 'totalDueForPlan',
      width: 170,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace'
      },
      type: 'numericColumn',
      headerTooltip: 'Total Due for Plan (Default)',
      tooltipValueGetter: () => 'Default'
    },
    {
      headerName: 'Plan Finalised',
      field: 'planFinalised',
      width: 150,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace',
        backgroundColor: '#fef3c7'
      },
      type: 'numericColumn',
      tooltipValueGetter: () => 'Manual Entry'
    },
    {
      headerName: 'Received',
      field: 'received',
      width: 140,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace',
        backgroundColor: '#dbeafe'
      },
      type: 'numericColumn',
      tooltipValueGetter: () => 'Link with Payment Advice'
    },
    {
      headerName: 'Statutory Deductions',
      field: 'statutoryDeductions',
      width: 180,
      editable: true,
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace',
        backgroundColor: '#dbeafe'
      },
      type: 'numericColumn',
      tooltipValueGetter: () => 'Link with Payment Advice'
    },
    {
      headerName: 'Balance',
      field: 'balance',
      width: 140,
      editable: false,
      filter: 'agNumberColumnFilter',
      valueGetter: (params) => {
        const plan = params.data?.planFinalised || 0
        const received = params.data?.received || 0
        const deductions = params.data?.statutoryDeductions || 0
        return plan - received - deductions
      },
      valueFormatter: (params) => {
        if (params.value == null) return '₹0'
        return `₹${Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      cellStyle: { 
        textAlign: 'right',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        fontFamily: 'monospace',
        fontWeight: '600',
        backgroundColor: '#f3f4f6'
      },
      type: 'numericColumn',
      headerTooltip: 'Balance (Calculations: Plan - Received - Deductions)',
      tooltipValueGetter: () => 'Calculated: Plan – Received – Deductions'
    },
    {
      headerName: 'Target Achieved %',
      field: 'targetAchieved',
      width: 160,
      editable: false,
      filter: 'agNumberColumnFilter',
      valueGetter: (params) => {
        const plan = params.data?.planFinalised || 0
        const received = params.data?.received || 0
        const deductions = params.data?.statutoryDeductions || 0
        if (plan === 0) return 0
        return ((received + deductions) / plan) * 100
      },
      valueFormatter: (params) => {
        if (params.value == null) return '0.00%'
        return `${Number(params.value).toFixed(2)}%`
      },
      cellStyle: (params) => {
        const value = params.value || 0
        const color = value >= 100 ? '#10b981' : value >= 80 ? '#f59e0b' : '#ef4444'
        return {
          textAlign: 'right',
          borderRight: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
          fontFamily: 'monospace',
          fontWeight: '600',
          color: color,
          backgroundColor: '#f9fafb'
        }
      },
      type: 'numericColumn',
      headerTooltip: 'Target Achieved % (Calculations: (Received + Deductions) / Plan)',
      tooltipValueGetter: () => 'Calculated: (Received + Deductions) / Plan'
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 120,
      pinned: 'right',
      cellRenderer: (params) => {
        const isEditing = editingRow === params.node.id
        return (
          <div className="flex items-center gap-1 h-full">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleSaveRow(params)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Save"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCancelEdit(params)}
                  className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  title="Cancel"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleViewRow(params)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditRow(params)}
                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRow(params)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )
      },
      cellStyle: { 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      },
      headerClass: 'bg-gray-50 font-semibold',
      suppressMovable: true,
      lockPosition: true
    }
  ], [editingRow])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: showFilters,
    cellStyle: {
      borderRight: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      padding: '8px'
    },
    headerClass: 'bg-gray-50 font-semibold text-gray-700',
    cellClass: 'text-gray-900'
  }), [showFilters])

  const onGridReady = (params) => {
    try {
      console.log('Grid ready, columnDefs:', columnDefs?.length, 'columns')
      setGridApi(params.api)
      setColumnApi(params.columnApi)
      
      // Ensure columns are set explicitly
      if (columnDefs && columnDefs.length > 0) {
        console.log('Setting column definitions:', columnDefs.length)
        params.api.setColumnDefs(columnDefs)
        // Verify columns were set
        const allColumns = params.api.getAllColumns()
        console.log('Columns after set:', allColumns?.length)
      } else {
        console.warn('No column definitions found!')
      }
      
      // Set initial data - use internalData or data prop
      const initialData = internalData.length > 0 
        ? internalData 
        : (Array.isArray(data) && data.length > 0) 
          ? data 
          : [{ ...defaultRowData, id: Date.now() }]
      
      console.log('Setting row data:', initialData.length, 'rows')
      params.api.setRowData(initialData)
      
      // Force grid to refresh and show columns
      setTimeout(() => {
        try {
          params.api.refreshCells()
          // Verify columns are visible
          const visibleColumns = params.api.getDisplayedColumns()
          console.log('Visible columns:', visibleColumns?.length)
          if (visibleColumns?.length === 0) {
            console.error('No visible columns! Grid may not be rendering properly.')
          }
        } catch (e) {
          console.warn('Error refreshing grid:', e)
        }
      }, 100)
    } catch (err) {
      console.error('Error in onGridReady:', err)
      setError(err)
    }
  }

  const handleAddRow = () => {
    const newRow = { ...defaultRowData, id: Date.now() }
    if (onAddRow) {
      onAddRow(newRow)
      // Update internal data after parent updates
      setInternalData(prev => [...prev, newRow])
    } else {
      // Default behavior - add to grid
      setInternalData(prev => [...prev, newRow])
      gridApi?.applyTransaction({ add: [newRow] })
    }
  }

  const handleEditRow = (params) => {
    setEditingRow(params.node.id)
    // Enable editing mode for the row
    gridApi?.startEditingCell({
      rowIndex: params.node.rowIndex,
      colKey: 'collectionIncharge'
    })
  }

  const handleSaveRow = (params) => {
    gridApi?.stopEditing()
    setEditingRow(null)
    // Get updated data from the grid
    const updatedData = params.data
    if (onEditRow) {
      onEditRow(updatedData)
      // Update internal data after parent updates
      setInternalData(prev => prev.map(row => 
        row.id === updatedData.id ? updatedData : row
      ))
    } else {
      setInternalData(prev => prev.map(row => 
        row.id === updatedData.id ? updatedData : row
      ))
    }
  }

  const handleCancelEdit = (params) => {
    gridApi?.stopEditing(true) // Cancel editing and revert changes
    setEditingRow(null)
  }

  const handleDeleteRow = (params) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      if (onDeleteRow) {
        onDeleteRow(params.data)
        // Update internal data after parent updates
        setInternalData(prev => prev.filter(row => row.id !== params.data.id))
      } else {
        setInternalData(prev => prev.filter(row => row.id !== params.data.id))
        gridApi?.applyTransaction({ remove: [params.data] })
      }
    }
  }

  const handleViewRow = (params) => {
    if (onViewRow) {
      onViewRow(params.data)
    } else {
      alert(`Viewing row: ${JSON.stringify(params.data, null, 2)}`)
    }
  }

  const handleExport = () => {
    gridApi?.exportDataAsCsv({
      fileName: `collection-data-${new Date().toISOString().split('T')[0]}.csv`
    })
  }

  const handleExportExcel = () => {
    // Using CSV export as Excel export requires ag-grid-enterprise
    // For Excel export, we can use xlsx library if needed
    gridApi?.exportDataAsCsv({
      fileName: `collection-data-${new Date().toISOString().split('T')[0]}.csv`
    })
  }

  const onQuickFilterChange = (e) => {
    setQuickFilter(e.target.value)
    gridApi?.setQuickFilter(e.target.value)
  }

  const clearFilters = () => {
    gridApi?.setFilterModel(null)
    setQuickFilter('')
  }

  // Ensure we always have data to display
  const displayData = useMemo(() => {
    if (internalData.length > 0) return internalData
    if (Array.isArray(data) && data.length > 0) return data
    // Return default row if no data
    return [{ ...defaultRowData, id: Date.now() }]
  }, [internalData, data])
  
  // Ensure columns are set when grid is ready
  useEffect(() => {
    if (gridApi && columnDefs && columnDefs.length > 0) {
      gridApi.setColumnDefs(columnDefs)
      gridApi.refreshCells()
    }
  }, [gridApi, columnDefs])

  // Update internal data when prop data changes and refresh grid
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setInternalData(data)
      if (gridApi) {
        gridApi.setRowData(data)
        gridApi.refreshCells()
      }
    } else if (internalData.length === 0) {
      // Only set default if we truly have no data
      const defaultRow = { ...defaultRowData, id: Date.now() }
      setInternalData([defaultRow])
      if (gridApi) {
        gridApi.setRowData([defaultRow])
        gridApi.refreshCells()
      }
    }
  }, [data, gridApi])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collection data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 text-sm">Error loading table: {error.message}</p>
        <button 
          onClick={() => {
            setError(null)
            // Reset with default data
            const defaultRow = { ...defaultRowData, id: Date.now() }
            setInternalData([defaultRow])
          }}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col" style={{ minHeight: '600px' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search across all columns..."
              value={quickFilter}
              onChange={onQuickFilterChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${
              showFilters
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-1" />
            Filters
          </button>

          {/* Clear Filters */}
          {quickFilter && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4 inline mr-1" />
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Add Row */}
          <button
            onClick={handleAddRow}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExport}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                Export as CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
              >
                Export as CSV (Excel compatible)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid */}
      <div 
        className="ag-theme-alpine" 
        style={{ 
          height: '600px', 
          width: '100%',
          display: 'block',
          position: 'relative'
        }}
      >
        <AgGridReact
          key={`grid-${columnDefs.length}`}
          columnDefs={columnDefs}
          rowData={displayData.length > 0 ? displayData : [{ ...defaultRowData, id: Date.now() }]}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          animateRows={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          enableRangeSelection={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          suppressCellFocus={false}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100, 200]}
          suppressHorizontalScroll={false}
          alwaysShowHorizontalScroll={true}
          suppressColumnVirtualisation={false}
          tooltipShowDelay={500}
          tooltipHideDelay={1000}
          domLayout="normal"
          suppressColumnMoveAnimation={false}
          suppressMenuHide={true}
          suppressFieldDotNotation={false}
            onCellValueChanged={(params) => {
              try {
                // Auto-calculate balance and target achieved when values change
                if (['planFinalised', 'received', 'statutoryDeductions'].includes(params.column.colId)) {
                  const plan = parseFloat(params.data.planFinalised || 0)
                  const received = parseFloat(params.data.received || 0)
                  const deductions = parseFloat(params.data.statutoryDeductions || 0)
                  params.data.balance = plan - received - deductions
                  params.data.targetAchieved = plan > 0 ? ((received + deductions) / plan) * 100 : 0
                  
                  // Update the row data
                  gridApi?.refreshCells({
                    rowNodes: [params.node],
                    columns: ['balance', 'targetAchieved'],
                    force: true
                  })
                  
                  // Notify parent of changes
                  if (onEditRow) {
                    onEditRow(params.data)
                  }
                }
              } catch (err) {
                console.error('Error in onCellValueChanged:', err)
              }
            }}
            rowHeight={40}
            headerHeight={45}
            getRowStyle={(params) => {
              if (params.node.rowIndex % 2 === 0) {
                return { backgroundColor: '#ffffff' }
              }
              return { backgroundColor: '#f9fafb' }
            }}
          />
      </div>
    </div>
  )
}

export default CollectionDataTable


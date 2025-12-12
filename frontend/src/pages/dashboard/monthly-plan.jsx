import { useEffect, useState } from 'react'
import { Cell } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { fetchDashboard } from '../../services/dashboardService.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Calendar, TrendingUp, Target, DollarSign, Download, Search, RefreshCw } from 'lucide-react'
import CollectionDataTable from '../../components/tables/CollectionDataTable.jsx'
import SelectWithOther from '../../components/ui/SelectWithOther.jsx'

export default function MonthlyPlanPage() {
  const { token } = useAuthContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tableData, setTableData] = useState([])
  const [filters, setFilters] = useState({
    personWise: '',
    businessUnit: '',
    search: '',
  })
  
  const [filteredTableData, setFilteredTableData] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const d = await fetchDashboard(token, { range: '90d' })
        if (mounted) setData(d)
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load monthly plan data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  const monthlyPlan = data?.monthlyCollectionPlan || {}
  const target = monthlyPlan.target || []
  const actual = monthlyPlan.actual || []
  const labels = monthlyPlan.labels || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const chartData = labels.map((label, index) => ({
    month: label,
    target: target[index] || 0,
    actual: actual[index] || 0,
    variance: (actual[index] || 0) - (target[index] || 0),
  }))

  const totalTarget = target.reduce((sum, val) => sum + (val || 0), 0)
  const totalActual = actual.reduce((sum, val) => sum + (val || 0), 0)
  const achievementRate = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0
  const variance = totalActual - totalTarget

  // Define filter options before they're used
  const personWiseOptions = [
    'Sales Manager Name',
    'Sales Head Name',
    'Project Manager',
    'Project Head',
    'Collection Head',
    'Business Head',
    'Collection Agent',
    'Collection Incharge',
  ]
  
  const businessUnitOptions = [
    'BU-1',
    'BU-2',
    'BU-3',
    'BU-4',
    'BU-5',
  ]

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }
  
  // Apply filters to table data
  useEffect(() => {
    if (tableData.length === 0) {
      setFilteredTableData([])
      return
    }
    
    let filtered = [...tableData]
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(row => {
        return (
          (row.collectionIncharge || '').toLowerCase().includes(searchTerm) ||
          (row.customerName || '').toLowerCase().includes(searchTerm) ||
          (row.segment || '').toLowerCase().includes(searchTerm) ||
          (row.packageName || '').toLowerCase().includes(searchTerm)
        )
      })
    }
    
    // Person Wise filter
    if (filters.personWise) {
      const personValue = filters.personWise.toLowerCase()
      filtered = filtered.filter(row => {
        const incharge = (row.collectionIncharge || '').toLowerCase()
        const roleMatch = personWiseOptions.some(option => {
          const optionLower = option.toLowerCase().replace(' name', '').trim()
          return personValue.includes(optionLower) || optionLower.includes(personValue.replace(' name', ''))
        })
        return roleMatch || incharge.includes(personValue.replace(' name', ''))
      })
    }
    
    // Business Unit filter
    if (filters.businessUnit && filters.businessUnit !== '') {
      filtered = filtered.filter(row => {
        if (row.businessUnit) {
          return row.businessUnit === filters.businessUnit
        }
        return true
      })
    }
    
    setFilteredTableData(filtered)
  }, [tableData, filters, personWiseOptions])
  
  // CSV generation and download functions
  const generateCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    const headers = [
      'Collection Incharge', 'Customer Name', 'Segment', 'Package Name',
      'Total Outstanding', 'Not Due', 'Overdue', 'Due for this Month',
      'Total Due for Plan', 'Plan Finalised', 'Received', 'Statutory Deductions',
      'Balance', 'Target Achieved %'
    ]
    
    const rows = data.map(row => [
      row.collectionIncharge || '',
      row.customerName || '',
      row.segment || '',
      row.packageName || '',
      row.totalOutstanding || 0,
      row.notDue || 0,
      row.overdue || 0,
      row.dueThisMonth || 0,
      row.totalDueForPlan || 0,
      row.planFinalised || 0,
      row.received || 0,
      row.statutoryDeductions || 0,
      row.balance || 0,
      `${(row.targetAchieved || 0).toFixed(2)}%`
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    return csvContent
  }
  
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Get unique person names from table data for filtering
  const getPersonNamesFromData = () => {
    const names = new Set()
    tableData.forEach(row => {
      if (row.collectionIncharge) names.add(row.collectionIncharge)
      if (row.customerName) names.add(row.customerName)
    })
    return Array.from(names).sort()
  }

  const collectionDetail = {
    collectionIncharge: monthlyPlan.collectionIncharge || 'Default',
    customerName: monthlyPlan.customerName || 'Default',
    segment: monthlyPlan.segment || 'Default',
    packageName: monthlyPlan.packageName || 'Default',
    totalOutstanding: monthlyPlan.totalOutstanding ?? totalTarget ?? 0,
    notDue: monthlyPlan.notDue ?? 0,
    overdue: monthlyPlan.overdue ?? 0,
    dueThisMonth: monthlyPlan.dueThisMonth ?? 0,
    totalDueForPlan: monthlyPlan.totalDueForPlan ?? totalTarget ?? 0,
    planFinalised: monthlyPlan.planFinalised ?? totalTarget ?? 0,
    received: monthlyPlan.received ?? totalActual ?? 0,
    statutoryDeductions: monthlyPlan.statutoryDeductions ?? 0,
  }

  const balance = (collectionDetail.planFinalised || 0) - (collectionDetail.received || 0) - (collectionDetail.statutoryDeductions || 0)
  const targetAchieved = (collectionDetail.planFinalised || 0) > 0
    ? (((collectionDetail.received || 0) + (collectionDetail.statutoryDeductions || 0)) / (collectionDetail.planFinalised || 1)) * 100
    : 0

  // Initialize table data from collectionDetail - always show at least one row
  useEffect(() => {
    if (!loading) {
      const plan = data?.monthlyCollectionPlan || {}
      const detail = {
        collectionIncharge: plan.collectionIncharge || collectionDetail.collectionIncharge || 'Default',
        customerName: plan.customerName || collectionDetail.customerName || 'Default',
        segment: plan.segment || collectionDetail.segment || 'Default',
        packageName: plan.packageName || collectionDetail.packageName || 'Default',
        totalOutstanding: plan.totalOutstanding ?? collectionDetail.totalOutstanding ?? totalTarget ?? 0,
        notDue: plan.notDue ?? collectionDetail.notDue ?? 0,
        overdue: plan.overdue ?? collectionDetail.overdue ?? 0,
        dueThisMonth: plan.dueThisMonth ?? collectionDetail.dueThisMonth ?? 0,
        totalDueForPlan: plan.totalDueForPlan ?? collectionDetail.totalDueForPlan ?? totalTarget ?? 0,
        planFinalised: plan.planFinalised ?? collectionDetail.planFinalised ?? totalTarget ?? 0,
        received: plan.received ?? collectionDetail.received ?? totalActual ?? 0,
        statutoryDeductions: plan.statutoryDeductions ?? collectionDetail.statutoryDeductions ?? 0,
      }
      
      const calculatedBalance = (detail.planFinalised || 0) - (detail.received || 0) - (detail.statutoryDeductions || 0)
      const calculatedTargetAchieved = (detail.planFinalised || 0) > 0
        ? (((detail.received || 0) + (detail.statutoryDeductions || 0)) / (detail.planFinalised || 1)) * 100
        : 0
      
      const initialRow = {
        id: Date.now(),
        ...detail,
        balance: calculatedBalance,
        targetAchieved: calculatedTargetAchieved
      }
      
      // Always set at least one row, even if tableData is empty
      setTableData(prev => {
        if (prev.length === 0) {
          return [initialRow]
        }
        // Update first row if it exists, otherwise add new
        const updated = prev.map((row, idx) => 
          idx === 0 ? { ...row, ...initialRow, id: row.id } : row
        )
        return updated
      })
      
      // Initialize filtered data
      setFilteredTableData(prev => prev.length === 0 ? [initialRow] : prev)
    }
  }, [data, loading, totalTarget, totalActual])

  // Handlers for table operations
  const handleAddRow = (newRow) => {
    const rowWithId = { ...newRow, id: Date.now() }
    setTableData(prev => [...prev, rowWithId])
  }

  const handleEditRow = (editedRow) => {
    setTableData(prev => prev.map(row => 
      row.id === editedRow.id ? editedRow : row
    ))
  }

  const handleDeleteRow = (rowToDelete) => {
    setTableData(prev => {
      const updated = prev.filter(row => row.id !== rowToDelete.id)
      // Ensure at least one row remains
      if (updated.length === 0) {
        const defaultRow = {
          id: Date.now(),
          ...collectionDetail,
          balance: balance,
          targetAchieved: targetAchieved
        }
        return [defaultRow]
      }
      return updated
    })
  }

  const handleViewRow = (row) => {
    console.log('Viewing row:', row)
    // Show detailed view in alert (can be replaced with modal)
    const details = [
      `Customer Name: ${row.customerName || 'N/A'}`,
      `Collection Incharge: ${row.collectionIncharge || 'N/A'}`,
      `Segment: ${row.segment || 'N/A'}`,
      `Package Name: ${row.packageName || 'N/A'}`,
      `Total Outstanding: ${formatCurrency(row.totalOutstanding || 0)}`,
      `Not Due: ${formatCurrency(row.notDue || 0)}`,
      `Overdue: ${formatCurrency(row.overdue || 0)}`,
      `Due for this Month: ${formatCurrency(row.dueThisMonth || 0)}`,
      `Total Due for Plan: ${formatCurrency(row.totalDueForPlan || 0)}`,
      `Plan Finalised: ${formatCurrency(row.planFinalised || 0)} (Manual Entry)`,
      `Received: ${formatCurrency(row.received || 0)} (Link with Payment Advice)`,
      `Statutory Deductions: ${formatCurrency(row.statutoryDeductions || 0)} (Link with Payment Advice)`,
      `Balance: ${formatCurrency(row.balance || 0)} (Plan – Received – Deductions)`,
      `Target Achieved: ${(row.targetAchieved || 0).toFixed(2)}% ((Received + Deductions) / Plan)`
    ].join('\n')
    alert(`Collection Data Details:\n\n${details}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900">Monthly Collection Plan</h1>
            <p className="text-sm sm:text-base text-secondary-600 mt-1">
              Track your collection targets vs actual performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-secondary-200/80 bg-white px-3 py-2 shadow-inner hover:border-primary-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-semibold">Refresh</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-700"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm">{error}</div>
        ) : null}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Target</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-blue-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(totalTarget)}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Actual</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-emerald-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(totalActual)}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Achievement Rate</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-purple-600 transition-colors duration-300">
              {loading ? '—' : `${achievementRate}%`}
            </p>
          </div>

          <div className={`group rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
            variance >= 0 ? 'border-emerald-200/70 hover:border-emerald-200/50' : 'border-red-200/70 hover:border-red-200/50'
          }`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 ${
                variance >= 0 ? 'bg-gradient-to-br from-emerald-100 to-emerald-50' : 'bg-gradient-to-br from-red-100 to-red-50'
              }`}>
                <Calendar className={`w-5 h-5 sm:w-6 sm:h-6 ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Variance</h3>
            <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
              variance >= 0 ? 'text-emerald-600 group-hover:text-emerald-700' : 'text-red-600 group-hover:text-red-700'
            }`}>
              {loading ? '—' : `${variance >= 0 ? '+' : ''}${formatCurrency(variance)}`}
            </p>
          </div>
        </div>

        {/* Monthly Collection Plan Table - Invoice Master Table Style */}
        <div className="rounded-3xl border border-secondary-200/60 bg-white shadow-xl shadow-secondary-500/10 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-secondary-200 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">Monthly Collection Plan Table</h3>
                <p className="text-sm text-secondary-500 mt-1">
                  Showing {filteredTableData.length > 0 ? filteredTableData.length : tableData.length} of {tableData.length} collection record{(filteredTableData.length > 0 ? filteredTableData.length : tableData.length) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => {
                    const csvContent = generateCSV(filteredTableData.length > 0 ? filteredTableData : tableData)
                    downloadCSV(csvContent, 'monthly-collection-plan.csv')
                  }}
                  disabled={tableData.length === 0}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-secondary-300 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                {/* Search */}
                <div className="relative flex-1 sm:flex-initial sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search collection records..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>
              </div>
            </div>
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[200px]">
                <SelectWithOther
                  value={filters.personWise || 'all'}
                  onChange={(val) => handleFilterChange('personWise', val === 'all' ? '' : val)}
                  options={[
                    { value: 'all', label: 'All persons' },
                    ...personWiseOptions.map(opt => ({ value: opt, label: opt }))
                  ]}
                  placeholder="Select person"
                  otherLabel="Other"
                  otherInputPlaceholder="Enter person name"
                  className="px-3 py-1.5 border border-secondary-200 rounded-lg text-sm text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  inputClassName="px-3 py-1.5 border border-secondary-200 rounded-lg text-sm text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
              <div className="min-w-[200px]">
                <SelectWithOther
                  value={filters.businessUnit || 'all'}
                  onChange={(val) => handleFilterChange('businessUnit', val === 'all' ? '' : val)}
                  options={[
                    { value: 'all', label: 'All business units' },
                    ...businessUnitOptions.map(unit => ({ value: unit, label: unit }))
                  ]}
                  placeholder="Select business unit"
                  otherLabel="Other"
                  otherInputPlaceholder="Enter business unit"
                  className="px-3 py-1.5 border border-secondary-200 rounded-lg text-sm text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  inputClassName="px-3 py-1.5 border border-secondary-200 rounded-lg text-sm text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          {tableData.length > 0 || !loading ? (
            <CollectionDataTable
              data={filteredTableData.length > 0 ? filteredTableData : tableData}
              onAddRow={handleAddRow}
              onEditRow={handleEditRow}
              onDeleteRow={handleDeleteRow}
              onViewRow={handleViewRow}
              loading={loading}
            />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-secondary-500 text-lg">No collection records found</p>
                <p className="text-secondary-400 text-sm mt-2">Add a new record to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Target vs Actual Chart */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Target vs Actual Collections</div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Target"
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Variance Chart */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Monthly Variance Analysis</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="variance" 
                radius={[8, 8, 0, 0]}
                name="Variance"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.variance >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Monthly Breakdown</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-secondary-500 border-b border-secondary-200">
                  <th className="py-3 pr-4 font-semibold">Month</th>
                  <th className="py-3 pr-4 font-semibold text-right">Target</th>
                  <th className="py-3 pr-4 font-semibold text-right">Actual</th>
                  <th className="py-3 pr-4 font-semibold text-right">Variance</th>
                  <th className="py-3 pr-4 font-semibold text-right">Achievement %</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => {
                  const achievement = row.target > 0 ? ((row.actual / row.target) * 100).toFixed(1) : 0
                  return (
                    <tr key={index} className="border-b border-secondary-100/80 hover:bg-secondary-50/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-secondary-900">{row.month}</td>
                      <td className="py-3 pr-4 text-right text-secondary-700">{formatCurrency(row.target)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-secondary-900">{formatCurrency(row.actual)}</td>
                      <td className={`py-3 pr-4 text-right font-semibold ${
                        row.variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {row.variance >= 0 ? '+' : ''}{formatCurrency(row.variance)}
                      </td>
                      <td className={`py-3 pr-4 text-right font-semibold ${
                        achievement >= 100 ? 'text-emerald-600' : achievement >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {achievement}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-secondary-300 font-bold">
                  <td className="py-3 pr-4 text-secondary-900">Total</td>
                  <td className="py-3 pr-4 text-right text-secondary-900">{formatCurrency(totalTarget)}</td>
                  <td className="py-3 pr-4 text-right text-secondary-900">{formatCurrency(totalActual)}</td>
                  <td className={`py-3 pr-4 text-right ${
                    variance >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                  </td>
                  <td className={`py-3 pr-4 text-right ${
                    achievementRate >= 100 ? 'text-emerald-600' : achievementRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {achievementRate}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

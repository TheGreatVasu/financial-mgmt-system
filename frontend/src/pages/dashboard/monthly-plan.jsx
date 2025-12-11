import { useEffect, useState } from 'react'
import { Cell } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { fetchDashboard } from '../../services/dashboardService.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Calendar, TrendingUp, Target, DollarSign, Download, RefreshCw, ChevronDown, ChevronUp, Filter } from 'lucide-react'

export default function MonthlyPlanPage() {
  const { token } = useAuthContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDetailOpen, setIsDetailOpen] = useState(true)
  const [filters, setFilters] = useState({
    person: '',
    businessUnit: '',
    role: '',
  })

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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const roleOptions = [
    'Sales Manager',
    'Sales Head',
    'Project Manager',
    'Project Head',
    'Collection Head',
    'Business Head',
    'Collection Agent',
    'Collection Incharge',
  ]

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

        {/* View in System (Horizontal) */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-secondary-100 text-left"
            onClick={() => setIsDetailOpen((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-semibold text-secondary-900">View in System (Horizontal)</p>
                <p className="text-xs text-secondary-500">Collection detail & quick filters</p>
              </div>
            </div>
            {isDetailOpen ? <ChevronUp className="w-5 h-5 text-secondary-500" /> : <ChevronDown className="w-5 h-5 text-secondary-500" />}
          </button>

          {isDetailOpen && (
            <div className="space-y-4 sm:space-y-6 p-4 sm:p-5 md:p-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary-50 rounded-lg border border-secondary-100">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary-600">Person Wise Filter</label>
                  <input
                    className="w-full rounded-lg border border-secondary-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition"
                    placeholder="Search person..."
                    value={filters.person}
                    onChange={(e) => handleFilterChange('person', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary-600">Business Unit Filter</label>
                  <select
                    className="w-full rounded-lg border border-secondary-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition"
                    value={filters.businessUnit}
                    onChange={(e) => handleFilterChange('businessUnit', e.target.value)}
                  >
                    <option value="">Select Business Unit</option>
                    <option value="BU-1">BU-1</option>
                    <option value="BU-2">BU-2</option>
                    <option value="BU-3">BU-3</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-secondary-600">Role</label>
                  <select
                    className="w-full rounded-lg border border-secondary-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition"
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  >
                    <option value="">Select Role</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'Collection Incharge', value: `${collectionDetail.collectionIncharge} (Default)` },
                  { label: 'Customer Name', value: `${collectionDetail.customerName} (Default)` },
                  { label: 'Segment', value: `${collectionDetail.segment} (Default)` },
                  { label: 'Package Name', value: `${collectionDetail.packageName} (Default)` },
                  { label: 'Total Outstanding', value: `${formatCurrency(collectionDetail.totalOutstanding)} (Default)` },
                  { label: 'Not Due', value: `${formatCurrency(collectionDetail.notDue)} (Default)` },
                  { label: 'Overdue', value: `${formatCurrency(collectionDetail.overdue)} (Default)` },
                  { label: 'Due for this Month', value: `${formatCurrency(collectionDetail.dueThisMonth)} (Default)` },
                  { label: 'Total Due for Plan', value: `${formatCurrency(collectionDetail.totalDueForPlan)} (Default)` },
                  { label: 'Plan Finalised', value: `${formatCurrency(collectionDetail.planFinalised)} (Manual Entry)` },
                  { label: 'Received', value: `${formatCurrency(collectionDetail.received)} (Link with Payment Advice)` },
                  { label: 'Statutory Deductions', value: `${formatCurrency(collectionDetail.statutoryDeductions)} (Link with Payment Advice)` },
                  { label: 'Balance', value: `${formatCurrency(balance)} (Plan – Received – Deductions)` },
                  { label: 'Target Achieved %', value: `${targetAchieved.toFixed(2)}% ((Received + Deductions) / Plan)` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-secondary-200/70 bg-secondary-50 px-3 sm:px-4 py-3">
                    <p className="text-sm font-semibold text-secondary-700">{item.label}</p>
                    <p className="text-sm font-bold text-secondary-900 text-right">{item.value}</p>
                  </div>
                ))}
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

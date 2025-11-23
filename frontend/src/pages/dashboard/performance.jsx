import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { fetchDashboard } from '../../services/dashboardService.js'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Star, Target, TrendingUp, CheckCircle2, AlertTriangle, Download, RefreshCw, Award, Zap } from 'lucide-react'

export default function PerformancePage() {
  const { token } = useAuthContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
        if (mounted) setError(e?.message || 'Failed to load performance data')
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

  const performance = data?.performance || {}
  const kpis = data?.kpis || {}
  const actionItems = data?.actionItems || {}
  const topCustomers = data?.topCustomers || []

  const onTimeRate = performance.onTimeCollectionRate || 0
  const promiseToPay = performance.promiseToPay || 0
  const slaCompliance = performance.slaCompliance || 0

  const performanceData = [
    { name: 'On-Time Collection', value: onTimeRate, color: '#10b981' },
    { name: 'Promise to Pay', value: promiseToPay, color: '#3b82f6' },
    { name: 'SLA Compliance', value: slaCompliance, color: '#8b5cf6' },
  ]

  const actionItemsData = [
    { name: 'Due Today', value: actionItems.dueToday || 0, color: '#ef4444' },
    { name: 'Needs Attention', value: actionItems.needsAttention || 0, color: '#f59e0b' },
    { name: 'Broken Promises', value: actionItems.brokenPromises || 0, color: '#dc2626' },
    { name: 'Autopay Info', value: actionItems.autopayInfo || 0, color: '#3b82f6' },
    { name: 'Approvals Pending', value: actionItems.approvalsPending || 0, color: '#8b5cf6' },
  ]

  const getPerformanceGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'emerald', label: 'Excellent' }
    if (score >= 80) return { grade: 'A', color: 'blue', label: 'Very Good' }
    if (score >= 70) return { grade: 'B', color: 'yellow', label: 'Good' }
    if (score >= 60) return { grade: 'C', color: 'orange', label: 'Fair' }
    return { grade: 'D', color: 'red', label: 'Needs Improvement' }
  }

  const overallGrade = getPerformanceGrade((onTimeRate + promiseToPay + slaCompliance) / 3)

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900">Performance Dashboard</h1>
            <p className="text-sm sm:text-base text-secondary-600 mt-1">
              Track key performance indicators and collection effectiveness
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

        {/* Overall Performance Grade */}
        <div className={`rounded-xl sm:rounded-2xl border bg-white p-6 sm:p-8 shadow-lg ${
          overallGrade.color === 'emerald' ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white' :
          overallGrade.color === 'blue' ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white' :
          overallGrade.color === 'yellow' ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white' :
          overallGrade.color === 'orange' ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white' :
          'border-red-200 bg-gradient-to-br from-red-50 to-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary-600 mb-2">Overall Performance Grade</div>
              <div className="text-5xl font-bold text-secondary-900 mb-2">{overallGrade.grade}</div>
              <div className={`text-lg font-semibold ${
                overallGrade.color === 'emerald' ? 'text-emerald-700' :
                overallGrade.color === 'blue' ? 'text-blue-700' :
                overallGrade.color === 'yellow' ? 'text-yellow-700' :
                overallGrade.color === 'orange' ? 'text-orange-700' :
                'text-red-700'
              }`}>
                {overallGrade.label}
              </div>
            </div>
            <div className="text-right">
              <Award className={`w-16 h-16 ${
                overallGrade.color === 'emerald' ? 'text-emerald-600' :
                overallGrade.color === 'blue' ? 'text-blue-600' :
                overallGrade.color === 'yellow' ? 'text-yellow-600' :
                overallGrade.color === 'orange' ? 'text-orange-600' :
                'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div className={`text-2xl font-bold ${
                onTimeRate >= 90 ? 'text-emerald-600' :
                onTimeRate >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {onTimeRate >= 90 ? '✓' : onTimeRate >= 70 ? '⚠' : '✗'}
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">On-Time Collection Rate</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-emerald-600 transition-colors duration-300">
              {loading ? '—' : `${onTimeRate}%`}
            </p>
            <div className="mt-3 w-full bg-secondary-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  onTimeRate >= 90 ? 'bg-emerald-600' :
                  onTimeRate >= 70 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${Math.min(100, onTimeRate)}%` }}
              />
            </div>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className={`text-2xl font-bold ${
                promiseToPay >= 90 ? 'text-emerald-600' :
                promiseToPay >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {promiseToPay >= 90 ? '✓' : promiseToPay >= 70 ? '⚠' : '✗'}
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Promise to Pay</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-blue-600 transition-colors duration-300">
              {loading ? '—' : `${promiseToPay}%`}
            </p>
            <div className="mt-3 w-full bg-secondary-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  promiseToPay >= 90 ? 'bg-emerald-600' :
                  promiseToPay >= 70 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${Math.min(100, promiseToPay)}%` }}
              />
            </div>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className={`text-2xl font-bold ${
                slaCompliance >= 90 ? 'text-emerald-600' :
                slaCompliance >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {slaCompliance >= 90 ? '✓' : slaCompliance >= 70 ? '⚠' : '✗'}
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">SLA Compliance</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-purple-600 transition-colors duration-300">
              {loading ? '—' : `${slaCompliance}%`}
            </p>
            <div className="mt-3 w-full bg-secondary-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  slaCompliance >= 90 ? 'bg-emerald-600' :
                  slaCompliance >= 70 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${Math.min(100, slaCompliance)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Performance Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Performance Metrics</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Action Items Status</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={actionItemsData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {actionItemsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-sky-100 to-sky-50 rounded-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">DSO</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">
              {loading ? '—' : `${kpis.dso || 0} days`}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-violet-100 to-violet-50 rounded-lg">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">CEI</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">
              {loading ? '—' : `${kpis.cei || 0}%`}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Collection Rate</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">
              {loading ? '—' : `${((kpis.collectedThisMonth || 0) / Math.max(1, kpis.outstanding || 1) * 100).toFixed(1)}%`}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Overdue Rate</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">
              {loading ? '—' : `${((kpis.overdue || 0) / Math.max(1, kpis.invoices || 1) * 100).toFixed(1)}%`}
            </p>
          </div>
        </div>

        {/* Top Performers */}
        {topCustomers && topCustomers.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Top Performing Customers</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCustomers.slice(0, 6).map((customer, index) => (
                <div key={customer.customerId || index} className="p-4 rounded-lg border border-secondary-200/50 hover:bg-secondary-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="font-medium text-secondary-900">{customer.customer || '—'}</div>
                    </div>
                    {index < 3 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="text-sm text-secondary-600">Outstanding: {formatCurrency(customer.outstanding || 0)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

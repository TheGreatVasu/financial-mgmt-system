import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { fetchDashboard } from '../../services/dashboardService.js'
import PieChart from '../../components/ui/PieChart.jsx'
import AgingAnalysisChart from '../../components/charts/AgingAnalysisChart.jsx'
import { Users, DollarSign, AlertTriangle, TrendingUp, Download, RefreshCw, FileText } from 'lucide-react'

export default function DebtorsSummaryPage() {
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
        if (mounted) setError(e?.message || 'Failed to load debtors summary')
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

  const totalDebtors = data?.totalDebtors || {}
  const outstanding = totalDebtors.outstanding || 0
  const total = totalDebtors.total || 0
  const agingBuckets = totalDebtors.buckets || data?.series?.agingBuckets || data?.agingAnalysis || []
  const topCustomers = data?.topCustomers || []

  const totalAging = agingBuckets.reduce((sum, b) => sum + Number(b.value || b.amount || 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900">Total Debtors Summary</h1>
            <p className="text-sm sm:text-base text-secondary-600 mt-1">
              Comprehensive overview of all outstanding receivables and aging analysis
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
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-violet-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-violet-100 to-violet-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Outstanding</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-violet-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(outstanding)}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Receivables</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-blue-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(total)}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-red-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Aging Total</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-red-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(totalAging)}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Active Debtors</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-indigo-600 transition-colors duration-300">
              {loading ? '—' : (topCustomers.length || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Aging Analysis Chart */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Aging Analysis of Receivables</div>
          </div>
          <AgingAnalysisChart data={agingBuckets} />
        </div>

        {/* Aging Breakdown Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Aging Distribution</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <PieChart
                data={agingBuckets.map((b, i) => ({
                  label: b.label || b.period || `Bucket ${i + 1}`,
                  value: Number(b.value || b.amount || 0),
                }))}
                size={220}
              />
              <div className="space-y-3">
                {agingBuckets.map((b, i) => {
                  const amount = Number(b.value || b.amount || 0)
                  const percentage = totalAging > 0 ? ((amount / totalAging) * 100).toFixed(1) : 0
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8'][i % 5] }} 
                        />
                        <span className="text-secondary-700 font-medium">{b.label || b.period || `Bucket ${i + 1}`}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary-700">{formatCurrency(amount)}</div>
                        <div className="text-xs text-secondary-500">{percentage}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Top Debtors */}
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Top Debtors</div>
            </div>
            {topCustomers.length === 0 ? (
              <div className="text-center py-8 text-secondary-500 text-sm">No debtors found</div>
            ) : (
              <div className="space-y-3">
                {topCustomers.slice(0, 10).map((customer, index) => (
                  <div key={customer.customerId || index} className="flex items-center justify-between p-3 rounded-lg border border-secondary-200/50 hover:bg-secondary-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-secondary-900">{customer.customer || '—'}</div>
                        <div className="text-xs text-secondary-500">Customer ID: {customer.customerId || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-secondary-900">{formatCurrency(customer.outstanding || 0)}</div>
                      <div className="text-xs text-secondary-500">Outstanding</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Aging Table */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Aging Breakdown Details</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-secondary-500 border-b border-secondary-200">
                  <th className="py-3 pr-4 font-semibold">Aging Period</th>
                  <th className="py-3 pr-4 font-semibold text-right">Amount</th>
                  <th className="py-3 pr-4 font-semibold text-right">Percentage</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {agingBuckets.map((bucket, index) => {
                  const amount = Number(bucket.value || bucket.amount || 0)
                  const percentage = totalAging > 0 ? ((amount / totalAging) * 100).toFixed(2) : 0
                  const isCritical = index >= 2 // 61-90 and 90+ are critical
                  return (
                    <tr key={index} className="border-b border-secondary-100/80 hover:bg-secondary-50/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-secondary-900">
                        <div className="flex items-center gap-2">
                          <span 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8'][index % 5] }} 
                          />
                          {bucket.label || bucket.period || `Bucket ${index + 1}`} days
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-secondary-900">{formatCurrency(amount)}</td>
                      <td className="py-3 pr-4 text-right text-secondary-700">{percentage}%</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isCritical ? 'bg-red-100 text-red-700' : 
                          index === 1 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isCritical ? 'Critical' : index === 1 ? 'Warning' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-secondary-300 font-bold">
                  <td className="py-3 pr-4 text-secondary-900">Total</td>
                  <td className="py-3 pr-4 text-right text-secondary-900">{formatCurrency(totalAging)}</td>
                  <td className="py-3 pr-4 text-right text-secondary-900">100%</td>
                  <td className="py-3 pr-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

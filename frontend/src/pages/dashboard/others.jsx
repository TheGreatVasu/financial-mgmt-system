import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { fetchDashboard } from '../../services/dashboardService.js'
import { FileText, AlertCircle, DollarSign, Users, Download, RefreshCw, Settings, Bell, TrendingUp } from 'lucide-react'

export default function OthersPage() {
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
        if (mounted) setError(e?.message || 'Failed to load data')
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

  const others = data?.others || []
  const kpis = data?.kpis || {}
  const alerts = data?.alerts || []
  const actionItems = data?.actionItems || {}

  // Default others items if not provided
  const defaultOthers = [
    { title: 'Bank Reco Pending', value: 0, icon: DollarSign, color: 'blue' },
    { title: 'Credit Notes Awaiting', value: 0, icon: FileText, color: 'yellow' },
    { title: 'Disputes Open', value: 0, icon: AlertCircle, color: 'red' },
  ]

  const othersItems = others.length > 0 ? others : defaultOthers

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900">Other Reports & Insights</h1>
            <p className="text-sm sm:text-base text-secondary-600 mt-1">
              Miscellaneous reports, pending items, and additional insights
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

        {/* Others Items Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {othersItems.map((item, index) => {
            const Icon = item.icon || FileText
            const colorClasses = {
              blue: 'from-blue-100 to-blue-50 text-blue-600 border-blue-200/50',
              yellow: 'from-yellow-100 to-yellow-50 text-yellow-600 border-yellow-200/50',
              red: 'from-red-100 to-red-50 text-red-600 border-red-200/50',
              green: 'from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200/50',
              purple: 'from-purple-100 to-purple-50 text-purple-600 border-purple-200/50',
            }
            const colorClass = colorClasses[item.color] || colorClasses.blue

            return (
              <div 
                key={index}
                className={`group rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${colorClass.split(' ')[2]}`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2.5 sm:p-3 bg-gradient-to-br ${colorClass.split(' ').slice(0, 2).join(' ')} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass.split(' ')[2]}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse opacity-50" />
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">{item.title}</h3>
                <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors duration-300">
                  {loading ? '—' : typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Customers</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">
              {loading ? '—' : (kpis.customers || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Invoices</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">
              {loading ? '—' : (kpis.invoices || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Overdue Invoices</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">
              {loading ? '—' : (kpis.overdue || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Action Items</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900">
              {loading ? '—' : (actionItems.dueToday || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts && alerts.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">System Alerts & Notifications</div>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`rounded-lg px-4 py-3 border ${
                    alert.type === 'danger' ? 'bg-danger-50 border-danger-200 text-danger-700' :
                    alert.type === 'warning' ? 'bg-warning-50 border-warning-200 text-warning-700' :
                    alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{alert.message || alert.title || 'Alert'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items Summary */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Action Items Summary</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-xs text-red-600 font-medium mb-1">Due Today</div>
              <div className="text-2xl font-bold text-red-700">{actionItems.dueToday || 0}</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-xs text-yellow-600 font-medium mb-1">Needs Attention</div>
              <div className="text-2xl font-bold text-yellow-700">{actionItems.needsAttention || 0}</div>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-xs text-red-600 font-medium mb-1">Broken Promises</div>
              <div className="text-2xl font-bold text-red-700">{actionItems.brokenPromises || 0}</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-xs text-blue-600 font-medium mb-1">Autopay Info</div>
              <div className="text-2xl font-bold text-blue-700">{actionItems.autopayInfo || 0}</div>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-xs text-purple-600 font-medium mb-1">Approvals Pending</div>
              <div className="text-2xl font-bold text-purple-700">{actionItems.approvalsPending || 0}</div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Additional Information</div>
          </div>
          <div className="space-y-3 text-sm text-secondary-600">
            <div className="p-3 rounded-lg bg-secondary-50 border border-secondary-200">
              <div className="font-medium text-secondary-900 mb-1">Outstanding Receivables</div>
              <div className="text-lg font-semibold text-secondary-900">{formatCurrency(kpis.outstanding || 0)}</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary-50 border border-secondary-200">
              <div className="font-medium text-secondary-900 mb-1">Collected This Period</div>
              <div className="text-lg font-semibold text-emerald-600">{formatCurrency(kpis.collectedThisMonth || 0)}</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary-50 border border-secondary-200">
              <div className="font-medium text-secondary-900 mb-1">Days Sales Outstanding (DSO)</div>
              <div className="text-lg font-semibold text-secondary-900">{kpis.dso || 0} days</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary-50 border border-secondary-200">
              <div className="font-medium text-secondary-900 mb-1">Collection Effectiveness Index (CEI)</div>
              <div className="text-lg font-semibold text-secondary-900">{kpis.cei || 0}%</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

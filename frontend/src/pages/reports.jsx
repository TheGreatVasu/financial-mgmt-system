import { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { fetchDashboard } from '../services/dashboardService.js'
import MonthlySalesChart from '../components/tailadmin/ecommerce/MonthlySalesChart.jsx'
import PieChart from '../components/ui/PieChart.jsx'
import { 
  CalendarRange, Download, ChevronDown, TrendingUp, DollarSign, Clock, 
  AlertCircle, Users, Receipt, FileText, Target, BarChart3, PieChart as PieChartIcon,
  TrendingDown, CheckCircle2, XCircle
} from 'lucide-react'
import { downloadDashboardReport } from '../services/reportService.js'

export default function Reports() {
  const { token } = useAuthContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [range, setRange] = useState('30d')
  const [rangeMenuOpen, setRangeMenuOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [exportError, setExportError] = useState("")
  const filterRef = useRef(null)

  const rangeOptions = [
    { value: '15d', label: 'Last 15 days', hint: 'Fast-moving pulse' },
    { value: '30d', label: 'Last 30 days', hint: 'Monthly snapshot' },
    { value: '45d', label: 'Last 45 days', hint: 'Extended month' },
    { value: '60d', label: 'Last 60 days', hint: 'Quarter ramp-up' },
    { value: '90d', label: 'Last 90 days', hint: 'Quarterly view' },
  ]
  const activeRange = rangeOptions.find((opt) => opt.value === range) || rangeOptions[1]

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const d = await fetchDashboard(token, { range })
        console.log('📊 Reports data loaded:', { range, data: d, kpis: d?.kpis, series: d?.series })
        if (mounted) {
          setData(d)
          console.log('✅ Reports state updated:', { 
            hasKpis: !!d?.kpis, 
            outstanding: d?.kpis?.outstanding,
            collected: d?.kpis?.collectedThisMonth,
            dso: d?.kpis?.dso
          })
        }
      } catch (e) {
        console.error('❌ Reports load error:', e)
        if (mounted) setError(e?.message || 'Failed to load reports')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token, range])

  useEffect(() => {
    if (!rangeMenuOpen) return
    const handleClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setRangeMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [rangeMenuOpen])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  const handleDownloadReport = async () => {
    if (!token || !data) return
    setExportError("")
    setDownloading(true)
    try {
      const blob = await downloadDashboardReport(token, {
        ...data,
        filters: data?.appliedFilters || { range },
        generatedAt: new Date().toISOString(),
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const filename = `comprehensive-report-${(data?.appliedFilters?.range || range)}-${new Date().toISOString().slice(0, 10)}.pdf`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setExportError(err?.message || 'Failed to generate report')
    } finally {
      setDownloading(false)
    }
  }

  const kpis = data?.kpis || {}
  const series = data?.series || {}
  const recentInvoices = data?.recentInvoices || []
  const topCustomers = data?.topCustomers || []
  const agingAnalysis = data?.agingAnalysis || []
  const regionalBreakup = data?.regionalBreakup || []
  const monthlyTrends = data?.monthlyTrends || []
  const performance = data?.performance || {}
  const actionItems = data?.actionItems || {}
  const alerts = data?.alerts || []

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900">Financial Reports</h1>
            <p className="text-sm sm:text-base text-secondary-600 mt-1">
              Comprehensive overview and analytics · {activeRange?.label || 'Last 30 days'}
            </p>
            {data?.appliedFilters?.startDate && data?.appliedFilters?.endDate && (
              <p className="text-xs text-secondary-500 mt-1">
                Showing data from {formatDate(data.appliedFilters.startDate)} to {formatDate(data.appliedFilters.endDate)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setRangeMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-3 rounded-xl border border-secondary-200/80 bg-white px-3 py-2 shadow-inner hover:border-primary-200 transition-colors"
              >
                <CalendarRange className="h-4 w-4 text-primary-600" />
                <div className="text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary-400">Filter</p>
                  <p className="text-sm font-semibold text-secondary-800">{activeRange?.label || 'Last 30 days'}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-secondary-400 transition ${rangeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {rangeMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-60 rounded-2xl border border-secondary-200/70 bg-white p-2 shadow-2xl">
                  {rangeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setRange(opt.value)
                        setRangeMenuOpen(false)
                      }}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-secondary-100 ${
                        range === opt.value ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-secondary-700'
                      }`}
                    >
                      <span className="block font-semibold">{opt.label}</span>
                      <span className="block text-xs text-secondary-500">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleDownloadReport}
              disabled={!data || downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Generating…' : 'Download Report'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm">{error}</div>
        ) : null}
        {exportError ? (
          <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm">{exportError}</div>
        ) : null}

        {/* Primary KPIs - Core Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* DSO Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-sky-100 to-sky-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Days Sales Outstanding</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-sky-600 transition-colors duration-300">
              {loading ? '—' : `${kpis.dso || 0} days`}
            </p>
          </div>

          {/* Outstanding Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-violet-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-violet-100 to-violet-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Outstanding Receivables</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-violet-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(kpis.outstanding || 0)}
            </p>
          </div>

          {/* Collected Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Collected This Period</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-emerald-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(kpis.collectedThisMonth || 0)}
            </p>
          </div>

          {/* CEI Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Collection Effectiveness</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-blue-600 transition-colors duration-300">
              {loading ? '—' : `${kpis.cei || 0}%`}
            </p>
          </div>
        </div>

        {/* Secondary KPIs - Business Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Customers Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Customers</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-indigo-600 transition-colors duration-300">
              {loading ? '—' : (kpis.customers || 0).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Invoices Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Invoices</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-purple-600 transition-colors duration-300">
              {loading ? '—' : (kpis.invoices || 0).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Overdue Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-red-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Overdue Invoices</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-red-600 transition-colors duration-300">
              {loading ? '—' : (kpis.overdue || 0).toLocaleString('en-IN')}
            </p>
          </div>

          {/* Action Items Card */}
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-orange-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Action Items Due</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-orange-600 transition-colors duration-300">
              {loading ? '—' : (actionItems.dueToday || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Collections vs Invoices Chart */}
          <div className="xl:col-span-7 col-span-1 rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Collections vs Invoices</div>
            </div>
            <MonthlySalesChart 
              labels={series.labels || []}
              collections={(series.collections || []).map(Number)}
              invoices={(series.invoices || []).map(Number)}
            />
          </div>

          {/* Aging Breakdown Chart */}
          <div className="xl:col-span-5 col-span-1 rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Aging Breakdown</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <PieChart
                data={(series.agingBuckets || agingAnalysis || []).map((b, i) => ({
                  label: b.label || b.period || `Bucket ${i + 1}`,
                  value: Number(b.value || b.amount || 0),
                }))}
                size={220}
              />
              <div className="space-y-3">
                {(series.agingBuckets || agingAnalysis || []).map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8'][i % 5] }} 
                      />
                      <span className="text-secondary-700 font-medium">{b.label || b.period || `Bucket ${i + 1}`}</span>
                    </div>
                    <span className="font-semibold text-primary-700">{formatCurrency(b.value || b.amount || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {performance && Object.keys(performance).length > 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Performance Metrics</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xs text-blue-600 font-medium mb-1">On-Time Collection Rate</div>
                <div className="text-2xl font-bold text-blue-900">{performance.onTimeCollectionRate || 0}%</div>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="text-xs text-green-600 font-medium mb-1">Promise to Pay</div>
                <div className="text-2xl font-bold text-green-900">{performance.promiseToPay || 0}%</div>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="text-xs text-purple-600 font-medium mb-1">SLA Compliance</div>
                <div className="text-2xl font-bold text-purple-900">{performance.slaCompliance || 0}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Top Customers by Outstanding */}
        {topCustomers && topCustomers.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">Top Customers by Outstanding</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-secondary-500 border-b border-secondary-200">
                    <th className="py-3 pr-4 font-semibold">Rank</th>
                    <th className="py-3 pr-4 font-semibold">Customer</th>
                    <th className="py-3 pr-4 font-semibold text-right">Outstanding Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.slice(0, 10).map((customer, index) => (
                    <tr key={customer.customerId || index} className="border-b border-secondary-100/80 hover:bg-secondary-50/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-secondary-900">#{index + 1}</td>
                      <td className="py-3 pr-4 text-secondary-700">{customer.customer || '—'}</td>
                      <td className="py-3 pr-4 font-semibold text-secondary-900 text-right">{formatCurrency(customer.outstanding || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Invoices Table */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Recent Invoices</div>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-secondary-500 text-sm">No invoices found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-secondary-500 border-b border-secondary-200">
                    <th className="py-3 pr-4 font-semibold">Invoice</th>
                    <th className="py-3 pr-4 font-semibold">Customer</th>
                    <th className="py-3 pr-4 font-semibold">Amount</th>
                    <th className="py-3 pr-4 font-semibold">Status</th>
                    <th className="py-3 pr-4 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-secondary-100/80 hover:bg-secondary-50/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-secondary-900">{inv.invoiceNumber || inv.invoice_number || '—'}</td>
                      <td className="py-3 pr-4 text-secondary-700">{inv.customer || '—'}</td>
                      <td className="py-3 pr-4 font-semibold text-secondary-900">{formatCurrency(inv.totalAmount || inv.total_amount || 0)}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          inv.status === 'overdue' ? 'bg-danger-100 text-danger-700' :
                          inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          'bg-secondary-100 text-secondary-700'
                        }`}>
                          {inv.status || 'draft'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-secondary-600">
                        {inv.createdAt || inv.created_at ? new Date(inv.createdAt || inv.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alerts Section */}
        {alerts && alerts.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">System Alerts</div>
            </div>
            <div className="space-y-2">
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
                    {alert.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{alert.message || alert.title || 'Alert'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

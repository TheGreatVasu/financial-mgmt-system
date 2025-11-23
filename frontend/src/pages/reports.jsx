import { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { fetchDashboard } from '../services/dashboardService.js'
import MonthlySalesChart from '../components/tailadmin/ecommerce/MonthlySalesChart.jsx'
import PieChart from '../components/ui/PieChart.jsx'
import { CalendarRange, Download, ChevronDown } from 'lucide-react'
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
        if (mounted) setData(d)
      } catch (e) {
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
      const filename = `receivables-report-${(data?.appliedFilters?.range || range)}-${new Date().toISOString().slice(0, 10)}.pdf`
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-secondary-600 mt-1">
            Insights and analytics · {activeRange?.label || 'Last 30 days'}
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
              className="inline-flex items-center gap-3 rounded-xl border border-secondary-200/80 bg-white px-3 py-2 shadow-inner hover:border-primary-200"
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
            {downloading ? 'Preparing…' : 'Download report'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm mt-4">{error}</div>
      ) : null}
      {exportError ? (
        <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm mt-4">{exportError}</div>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
        <div className="rounded-xl border border-sky-200/70 bg-white p-4 shadow-soft">
          <div className="text-sm text-secondary-500">DSO</div>
          <div className="mt-1 text-2xl font-semibold text-sky-700">{loading ? '—' : `${data?.kpis?.dso || 0} days`}</div>
        </div>
        <div className="rounded-xl border border-violet-200/70 bg-white p-4 shadow-soft">
          <div className="text-sm text-secondary-500">Outstanding</div>
          <div className="mt-1 text-2xl font-semibold text-violet-700">{loading ? '—' : `₹${(data?.kpis?.outstanding || 0).toLocaleString('en-IN')}`}</div>
        </div>
        <div className="rounded-xl border border-emerald-200/70 bg-white p-4 shadow-soft">
          <div className="text-sm text-secondary-500">Collected this month</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-700">{loading ? '—' : `₹${(data?.kpis?.collectedThisMonth || 0).toLocaleString('en-IN')}`}</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-6 mt-4">
        <div className="xl:col-span-7 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft">
          <div className="text-sm font-medium text-secondary-700 mb-3">Collections vs Invoices</div>
          <MonthlySalesChart 
            labels={data?.series?.labels || []}
            collections={(data?.series?.collections || []).map(Number)}
            invoices={(data?.series?.invoices || []).map(Number)}
          />
        </div>
        <div className="xl:col-span-5 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft">
          <div className="text-sm font-medium text-secondary-700 mb-3">Aging Breakdown</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <PieChart
              data={(data?.series?.agingBuckets || []).map((b, i) => ({
                label: b.label || b?.name || `Bucket ${i + 1}`,
                value: Number(b.value || b?.amount || 0),
              }))}
              size={220}
            />
            <div className="space-y-2">
              {(data?.series?.agingBuckets || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full`} style={{ backgroundColor: ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8'][i % 5] }} />
                    <span className="text-secondary-700">{b.label || b?.name || `Bucket ${i + 1}`}</span>
                  </div>
                  <span className="font-medium text-primary-700">₹{Number(b.value || b?.amount || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft mt-4 table-scroll">
        <div className="text-sm font-medium text-secondary-700 mb-3">Recent Invoices</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-secondary-500">
              <th className="py-2 pr-3">Invoice</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Amount</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentInvoices || []).map((inv) => (
              <tr key={inv.id} className="border-t border-secondary-100/80">
                <td className="py-2 pr-3 font-medium">{inv.invoiceNumber}</td>
                <td className="py-2 pr-3">{inv.customer}</td>
                <td className="py-2 pr-3">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</td>
                <td className="py-2 pr-3 capitalize">{inv.status}</td>
                <td className="py-2 pr-3">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}


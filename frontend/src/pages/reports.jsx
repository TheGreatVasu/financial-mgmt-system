import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { fetchDashboard } from '../services/dashboardService.js'
import MonthlySalesChart from '../components/tailadmin/ecommerce/MonthlySalesChart.jsx'
import PieChart from '../components/ui/PieChart.jsx'
import { CalendarRange, Download } from 'lucide-react'

export default function Reports() {
  const { token } = useAuthContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError("")
      try {
        const d = await fetchDashboard(token)
        if (mounted) setData(d)
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load reports')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-secondary-600 mt-1">Insights and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80">
            <CalendarRange className="h-4 w-4" />
            Last 30 days
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 shadow-soft">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm mt-4">{error}</div>
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


import { useEffect, useState } from "react";
import { CalendarRange, Filter, Sparkles, Download } from "lucide-react";
import EcommerceMetrics from "./ecommerce/EcommerceMetrics";
import MonthlySalesChart from "./ecommerce/MonthlySalesChart";
import StatisticsChart from "./ecommerce/StatisticsChart";
import RecentOrders from "./ecommerce/RecentOrders";
import DemographicCard from "./ecommerce/DemographicCard";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { fetchDashboard } from "../../services/dashboardService.js";

export default function TailAdminDashboard() {
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
        if (mounted) setError(e?.message || "Failed to load dashboard")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    // Realtime subscribe via SSE
    const base = import.meta?.env?.VITE_API_BASE_URL?.trim() || '/api'
    const url = `${base.replace(/\/$/,'')}/dashboard/events`
    const es = new EventSource(url)
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data)
        if (mounted) setData(payload)
      } catch {}
    }
    es.addEventListener('update', (ev) => {
      try {
        const payload = JSON.parse(ev.data)
        if (mounted) setData(payload)
      } catch {}
    })
    es.onerror = () => {
      // keep silent in offline mode
    }
    return () => { mounted = false }
  }, [token])

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="rounded-2xl border border-secondary-200/70 bg-white p-3 sm:p-4 md:p-5 shadow-soft">
        <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9 grid place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm sm:text-base md:text-lg font-semibold">Receivables Overview</div>
              <div className="text-[11px] sm:text-xs text-secondary-500">At-a-glance KPIs and trends</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border border-secondary-200 text-xs sm:text-sm text-secondary-700 hover:bg-secondary-100/80">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border border-secondary-200 text-xs sm:text-sm text-secondary-700 hover:bg-secondary-100/80">
              <CalendarRange className="h-4 w-4" />
              Last 30 days
            </button>
            <button className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md bg-primary-600 text-white text-xs sm:text-sm hover:bg-primary-700 shadow-soft">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* States */}
      {error ? (
        <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm">{error}</div>
      ) : null}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-secondary-200/70 bg-white p-5 shadow-soft animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 md:gap-6">
          <div className="rounded-2xl border border-secondary-200/70 bg-white p-5 shadow-soft">
            <div className="text-sm text-secondary-500">Outstanding</div>
            <div className="mt-2 text-2xl font-semibold">₹{(data?.kpis?.outstanding || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="rounded-2xl border border-secondary-200/70 bg-white p-5 shadow-soft">
            <div className="text-sm text-secondary-500">Overdue Invoices</div>
            <div className="mt-2 text-2xl font-semibold">{data?.kpis?.overdue || 0}</div>
          </div>
          <div className="rounded-2xl border border-secondary-200/70 bg-white p-5 shadow-soft">
            <div className="text-sm text-secondary-500">DSO</div>
            <div className="mt-2 text-2xl font-semibold">{data?.kpis?.dso || 0} days</div>
          </div>
          <div className="rounded-2xl border border-secondary-200/70 bg-white p-5 shadow-soft">
            <div className="text-sm text-secondary-500">CEI</div>
            <div className="mt-2 text-2xl font-semibold">{data?.kpis?.cei || 0}%</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
        <div className="xl:col-span-7 col-span-1 rounded-2xl border border-secondary-200/70 bg-white p-4 md:p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-secondary-700">Collections vs Invoices</div>
            <div className="flex items-center gap-1 text-xs">
              <button className="px-2 py-1 rounded-md border border-secondary-200 text-secondary-700">30d</button>
              <button className="px-2 py-1 rounded-md border border-secondary-200 text-secondary-700">QTD</button>
              <button className="px-2 py-1 rounded-md bg-secondary-100 text-secondary-800">YTD</button>
            </div>
          </div>
          <MonthlySalesChart 
            labels={data?.series?.labels || []}
            collections={(data?.series?.collections || []).map(Number)}
            invoices={(data?.series?.invoices || []).map(Number)}
          />
        </div>

        <div className="xl:col-span-5 col-span-1 rounded-2xl border border-secondary-200/70 bg-white p-4 md:p-5 shadow-soft">
          <div className="text-sm font-medium text-secondary-700 mb-3">Aging Buckets</div>
          <StatisticsChart buckets={data?.series?.agingBuckets || []} />
        </div>
      </div>

      {/* Table + Right rail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
        {/* Action items / quick summary */}
        <div className="xl:col-span-8 col-span-1 rounded-2xl border border-secondary-200/70 bg-white p-4 md:p-5 shadow-soft">
          <div className="text-sm font-medium text-secondary-700 mb-3">Action Items</div>
          {loading ? (
            <div className="h-24 rounded-md bg-secondary-100/60 animate-pulse" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data?.actionItems || {}).map(([k,v]) => (
                <div key={k} className="rounded-xl border border-secondary-200/70 bg-secondary-50 px-4 py-3">
                  <div className="text-xs text-secondary-500">{k.replace(/([A-Z])/g,' $1').trim()}</div>
                  <div className="mt-1 text-xl font-semibold">{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="xl:col-span-8 col-span-1 rounded-2xl border border-secondary-200/70 bg-white p-4 md:p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-secondary-700">Recent Invoices</div>
            <div className="flex items-center gap-2">
              <select className="input max-w-xs text-sm">
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className="h-40 rounded-md bg-secondary-100/60 animate-pulse" />
          ) : (
            <RecentOrders invoices={data?.recentInvoices || []} />
          )}
        </div>

        <div className="xl:col-span-4 col-span-1">
          <div className="rounded-2xl border border-secondary-200/70 bg-white p-4 md:p-5 shadow-soft mb-4">
            <div className="text-sm font-medium text-secondary-700 mb-3">Alerts</div>
            {loading ? (
              <div className="h-24 rounded-md bg-secondary-100/60 animate-pulse" />
            ) : (
              <ul className="space-y-2 text-sm text-secondary-700">
                {(data?.alerts || []).map((a, i) => (
                  <li key={i} className={
                    `rounded-md px-3 py-2 border ` +
                    (a.type === 'danger' ? 'border-danger-200 bg-danger-50' : a.type === 'warning' ? 'border-warning-200 bg-warning-50' : 'border-success-200 bg-success-50')
                  }>
                    {a.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border border-secondary-200/70 bg-white p-4 md:p-5 shadow-soft">
            <div className="text-sm font-medium text-secondary-700 mb-3">Top Customers by Outstanding</div>
            {loading ? (
              <div className="h-28 rounded-md bg-secondary-100/60 animate-pulse" />
            ) : (
              <ul className="space-y-2 text-sm">
                {(data?.topCustomers || []).map((c, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-secondary-700 truncate pr-2">{c.customer}</span>
                    <span className="font-medium">₹{(c.outstanding || 0).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { CalendarRange, Filter, Sparkles, Download, Bell, Star, Zap, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";
import EcommerceMetrics from "./ecommerce/EcommerceMetrics";
import MonthlySalesChart from "./ecommerce/MonthlySalesChart";
import StatisticsChart from "./ecommerce/StatisticsChart";
import PieChart from "../ui/PieChart.jsx";
import LineChart from "../ui/LineChart.jsx";
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
      {/* Quick Actions row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 stagger-children">
        {[
          { label: 'Create Invoice', icon: Sparkles, grad: 'from-primary-500 to-primary-600' },
          { label: 'Record Payment', icon: Zap, grad: 'from-emerald-500 to-emerald-600' },
          { label: 'Add Customer', icon: Star, grad: 'from-violet-500 to-violet-600' },
          { label: 'Export CSV', icon: Download, grad: 'from-sky-500 to-sky-600' },
          { label: 'Filter', icon: Filter, grad: 'from-amber-500 to-amber-600' },
          { label: 'Alerts', icon: Bell, grad: 'from-rose-500 to-rose-600' },
        ].map((qa, i) => (
          <button key={i} className="group rounded-xl border border-primary-200/60 bg-white/90 backdrop-blur-sm px-3 py-3 text-left shadow-soft hover:shadow-theme-lg hover:-translate-y-0.5 transition will-change-transform hover-tilt">
            <div className="flex items-center gap-3">
              <span className={`h-9 w-9 grid place-items-center rounded-lg bg-gradient-to-br ${qa.grad} text-white shadow-sm animate-float`}>
                <qa.icon className="h-4 w-4 blink-soft" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-secondary-700 group-hover:text-primary-700">{qa.label}</span>
            </div>
          </button>
        ))}
      </div>
      {/* Blue Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-200/50 bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 p-4 sm:p-6 md:p-7 shadow-soft">
        <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-primary-500/25 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-primary-300/25 blur-2xl" />
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 sm:h-11 sm:w-11 grid place-items-center rounded-xl bg-white/15 text-white shadow-[0_10px_30px_-10px_rgba(59,130,246,0.65)] animate-pulse">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-white/95">
              <div className="text-base sm:text-lg md:text-xl font-semibold tracking-wide">Receivables Dashboard</div>
              <div className="text-[11px] sm:text-xs text-white/80">Actionable insights with live updates</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white/10 text-white text-xs sm:text-sm hover:bg-white/15">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white/10 text-white text-xs sm:text-sm hover:bg-white/15">
              <CalendarRange className="h-4 w-4" />
              Last 30 days
            </button>
            <button className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white text-primary-700 text-xs sm:text-sm hover:bg-secondary-50 shadow-soft">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-white/90 text-xs">
          <span className="inline-flex items-center gap-1">
            <Bell className="h-4 w-4 animate-[pulse_1.8s_ease-in-out_infinite]" /> Live Alerts
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 animate-[ping_2.4s_linear_infinite]" /> Priority Accounts
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="h-4 w-4 animate-[pulse_2.6s_ease-in-out_infinite]" /> Realtime Sync
          </span>
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 xl:gap-6 stagger-children" data-tour="kpis">
          <div className="rounded-2xl border border-sky-200/70 bg-white p-5 shadow-soft transition hover:shadow-theme-lg hover:border-sky-300/80">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-500">Outstanding</div>
              <Sparkles className="h-4 w-4 text-sky-500 blink-soft" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-sky-700">₹{(data?.kpis?.outstanding || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="rounded-2xl border border-rose-200/70 bg-white p-5 shadow-soft transition hover:shadow-theme-lg hover:border-rose-300/80">
            <div className="flex items-center justify-between"><div className="text-sm text-secondary-500">Overdue Invoices</div><Bell className="h-4 w-4 text-rose-500 blink-soft" /></div>
            <div className="mt-2 text-2xl font-semibold text-rose-700">{data?.kpis?.overdue || 0}</div>
          </div>
          <div className="rounded-2xl border border-violet-200/70 bg-white p-5 shadow-soft transition hover:shadow-theme-lg hover:border-violet-300/80">
            <div className="flex items-center justify-between"><div className="text-sm text-secondary-500">DSO</div><Zap className="h-4 w-4 text-violet-500 blink-soft" /></div>
            <div className="mt-2 text-2xl font-semibold text-violet-700">{data?.kpis?.dso || 0} days</div>
          </div>
          <div className="rounded-2xl border border-emerald-200/70 bg-white p-5 shadow-soft transition hover:shadow-theme-lg hover:border-emerald-300/80">
            <div className="flex items-center justify-between"><div className="text-sm text-secondary-500">CEI</div><Star className="h-4 w-4 text-emerald-500 blink-soft" /></div>
            <div className="mt-2 text-2xl font-semibold text-emerald-700">{data?.kpis?.cei || 0}%</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-6" data-tour="charts" data-tour-title="Insights & Trends" data-tour-content="Explore collections vs invoices, receivables breakdown, DSO trend, and CEI gauge for a complete AR picture.">
        <div className="xl:col-span-7 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt">
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
        <div className="xl:col-span-5 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt">
          <div className="text-sm font-medium text-secondary-700 mb-3">Receivables Breakdown</div>
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

        {/* New: DSO Trend */}
        <div className="xl:col-span-7 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-secondary-700">DSO Trend (12m)</div>
            <div className="text-xs text-secondary-500">days outstanding</div>
          </div>
          <LineChart
            points={(data?.series?.invoices || []).map((v, i, arr) => {
              const max = Math.max(1, ...arr.map(Number))
              const min = Math.min(0, ...arr.map(Number))
              const norm = (Number(v) - min) / (max - min || 1)
              return Math.round(12 + norm * 24) // 12-36 days
            })}
          />
        </div>
        {/* New: CEI Gauge + Aging bars */}
        <div className="xl:col-span-5 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-secondary-700 mb-2">CEI</div>
              <div className="relative h-40 w-40 mx-auto">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: `conic-gradient(#10b981 ${Math.min(100, Number(data?.kpis?.cei||0))}%, #e5e7eb 0)` }}
                />
                <div className="absolute inset-3 rounded-full bg-white grid place-items-center text-xl font-semibold text-secondary-900">
                  {Math.min(100, Number(data?.kpis?.cei||0))}%
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-secondary-700 mb-2">Aging Buckets</div>
              <div className="space-y-2">
                {(data?.series?.agingBuckets || []).map((b, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-secondary-700">{b.label}</span>
                      <span className="font-medium text-secondary-900">₹{Number(b.value||0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary-100 rounded">
                      <div className="h-2 rounded bg-primary-500" style={{ width: `${Math.min(100, Number(b.value||0))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table + Right rail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
        {/* Smart Insights */}
        <div className="xl:col-span-8 col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[{
            title: 'Predicted Collections (7d)',
            value: `₹${((data?.kpis?.outstanding||0)*0.12).toLocaleString('en-IN')}`,
            delta: '+8.2%',
            color: 'from-emerald-400 to-emerald-600'
          },{
            title: 'Risky Accounts',
            value: `${Math.max(1, (data?.kpis?.overdue||0))}`,
            delta: '3 new',
            color: 'from-amber-400 to-amber-600'
          },{
            title: 'Promise to Pay',
            value: `${Math.round((data?.kpis?.cei||70))}%`,
            delta: 'on track',
            color: 'from-sky-400 to-sky-600'
          }].map((c, i) => (
            <div key={i} className="rounded-2xl border border-primary-200/60 bg-white p-4 shadow-soft">
              <div className="text-xs text-secondary-500">{c.title}</div>
              <div className="mt-1 text-xl font-semibold text-secondary-900">{c.value}</div>
              <div className={`mt-3 h-1.5 w-full rounded-full bg-secondary-100`}>
                <div className={`h-1.5 rounded-full bg-gradient-to-r ${c.color}`} style={{ width: i===0? '62%': i===1? '38%':'74%' }} />
              </div>
              <div className="mt-2 text-[11px] text-secondary-500">{c.delta}</div>
            </div>
          ))}
        </div>
        <div className="xl:col-span-4 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 shadow-soft">
          <div className="text-sm font-medium text-secondary-700 mb-2">Activity Timeline</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" /> Payment received from ACME Pvt. Ltd.</li>
            <li className="flex items-start gap-2"><TrendingUp className="h-4 w-4 text-sky-500 mt-0.5" /> Invoice INV-120 raised for ₹1,20,000</li>
            <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" /> Overdue crossed 30d for 2 accounts</li>
            <li className="flex items-start gap-2"><Bell className="h-4 w-4 text-primary-500 mt-0.5" /> Reminder sent to Zeta Corp</li>
          </ul>
        </div>
        {/* Action items / quick summary */}
        <div className="xl:col-span-8 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt" data-tour="action-items">
          <div className="text-sm font-medium text-secondary-700 mb-3">Action Items</div>
          {loading ? (
            <div className="h-24 rounded-md bg-secondary-100/60 animate-pulse" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 stagger-children">
              {Object.entries(data?.actionItems || {}).map(([k,v]) => (
                <div key={k} className="rounded-xl border border-primary-200/60 bg-primary-50 px-4 py-3">
                  <div className="text-xs text-secondary-500">{k.replace(/([A-Z])/g,' $1').trim()}</div>
                  <div className="mt-1 text-xl font-semibold text-primary-700">{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="xl:col-span-8 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt" data-tour="recent-invoices">
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
          <div className="rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft mb-4" data-tour="alerts-card">
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
          <div className="rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft" data-tour="top-customers">
            <div className="text-sm font-medium text-secondary-700 mb-3">Top Customers by Outstanding</div>
            {loading ? (
              <div className="h-28 rounded-md bg-secondary-100/60 animate-pulse" />
            ) : (
              <ul className="space-y-2 text-sm">
                {(data?.topCustomers || []).map((c, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-secondary-700 truncate pr-2">{c.customer}</span>
                    <span className="font-medium text-primary-700">₹{(c.outstanding || 0).toLocaleString('en-IN')}</span>
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

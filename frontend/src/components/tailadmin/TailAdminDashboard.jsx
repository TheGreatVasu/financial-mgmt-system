import { useEffect, useMemo, useState } from "react";
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
import Modal from "../ui/Modal.jsx";
import { createInvoiceService } from "../../services/invoiceService.js";
import { createPaymentService } from "../../services/paymentService.js";
import { createCustomerService } from "../../services/customerService.js";
import { listAlerts, markRead } from "../../services/alertsService.js";

export default function TailAdminDashboard() {
  const { token } = useAuthContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modal, setModal] = useState(null) // 'Create Invoice'|'Record Payment'|'Add Customer'|'Filter'|'Alerts'|null
  const [form, setForm] = useState({})
  const [filters, setFilters] = useState({})
  const [alerts, setAlerts] = useState([])
  const invApi = useMemo(() => createInvoiceService(token), [token])
  const payApi = useMemo(() => createPaymentService(token), [token])
  const custApi = useMemo(() => createCustomerService(token), [token])

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

  async function refresh() {
    const d = await fetchDashboard(token, filters)
    setData(d)
  }

  function normalizeInvoice(v) {
    return {
      invoiceNumber: v.invoiceNumber,
      customerId: v.customerId,
      poRef: v.poRef,
      items: v.items || [],
      taxRate: Number(v.taxRate || 0),
      paymentTerms: v.paymentTerms,
      dueDate: v.dueDate,
    }
  }
  function normalizePayment(v) {
    return {
      invoiceNumber: v.invoiceNumber,
      amount: Number(v.amount || 0),
      paymentDate: v.paymentDate || new Date(),
      method: v.method || 'upi',
      reference: v.reference || 'dash',
    }
  }
  function normalizeCustomer(v) {
    return {
      name: v.name,
      companyName: v.companyName,
      email: v.email,
      phone: v.phone,
      gstNumber: v.gstNumber,
    }
  }

  async function handleQuickAction(label) {
    if (label === 'Alerts') {
      await loadAlerts()
    }
    setForm({})
    setModal(label)
  }

  async function loadAlerts() {
    const list = await listAlerts(token)
    setAlerts(list)
  }

  async function exportCsv() {
    const base = import.meta?.env?.VITE_API_BASE_URL?.trim() || '/api'
    const api = base.replace(/\/$/,'')
    const endpoints = ['/invoices', '/payments', '/customers']
    const rows = []
    for (const ep of endpoints) {
      try {
        const res = await fetch(`${api}${ep}`)
        const json = await res.json().catch(() => ({}))
        const data = json?.data || []
        rows.push(...data.map((d) => ({ endpoint: ep.slice(1), ...d })))
      } catch {}
    }
    if (rows.length === 0) return
    const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))))
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-export-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024))
  useEffect(() => {
    function onResize(){ setVw(window.innerWidth) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
          <button key={i} onClick={() => handleQuickAction(qa.label)} className="group rounded-xl border border-primary-200/60 bg-white/90 backdrop-blur-sm px-3 py-3 text-left shadow-soft hover:shadow-theme-lg hover:-translate-y-0.5 transition will-change-transform hover-tilt">
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
            <button onClick={() => handleQuickAction('Filter')} className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white/10 text-white text-xs sm:text-sm hover:bg-white/15">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white/10 text-white text-xs sm:text-sm hover:bg-white/15">
              <CalendarRange className="h-4 w-4" />
              Last 30 days
            </button>
            <button onClick={exportCsv} className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md bg-white text-primary-700 text-xs sm:text-sm hover:bg-secondary-50 shadow-soft">
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

      <Modal open={modal === 'Create Invoice'} onClose={() => setModal(null)} title="Create Invoice" variant="dialog" size="lg" footer={(
        <>
          <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={async () => { await invApi.create(normalizeInvoice(form)); setModal(null); refresh(); }}>Save</button>
        </>
      )}>
        <InvoiceForm form={form} setForm={setForm} />
      </Modal>

      <Modal open={modal === 'Record Payment'} onClose={() => setModal(null)} title="Record Payment" variant="dialog" size="md" footer={(
        <>
          <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={async () => { await payApi.create(normalizePayment(form)); setModal(null); refresh(); }}>Save</button>
        </>
      )}>
        <PaymentForm form={form} setForm={setForm} />
      </Modal>

      <Modal open={modal === 'Add Customer'} onClose={() => setModal(null)} title="Add Customer" variant="dialog" size="md" footer={(
        <>
          <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={async () => { await custApi.create(normalizeCustomer(form)); setModal(null); refresh(); }}>Save</button>
        </>
      )}>
        <CustomerForm form={form} setForm={setForm} />
      </Modal>

      <Modal open={modal === 'Filter'} onClose={() => setModal(null)} title="Filters" variant="dialog" size="md" footer={(
        <>
          <button className="btn btn-outline" onClick={() => { setFilters({}); setModal(null); refresh(); }}>Reset</button>
          <button className="btn btn-primary" onClick={() => { setModal(null); refresh(); }}>Apply</button>
        </>
      )}>
        <FilterForm filters={filters} setFilters={setFilters} />
      </Modal>

      <Modal open={modal === 'Alerts'} onClose={() => setModal(null)} title="Alerts" variant="dialog" size="md" footer={(
        <>
          <button className="btn btn-outline" onClick={() => setModal(null)}>Close</button>
          <button className="btn btn-primary" onClick={async () => { await markRead(token, alerts.map(a => a.id)); setModal(null); }}>Mark all read</button>
        </>
      )}>
        <AlertsPanel alerts={alerts} reload={loadAlerts} />
      </Modal>

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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-6" data-tour="charts" data-tour-title="Insights & Trends" data-tour-content="Explore collections plans, debtors summary, BOQ vs Actual, and performance.">
        {/* Monthly Collection Plan */}
        <div id="monthly-plan" className="xl:col-span-7 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-secondary-700">Monthly Collection Plan</div>
          </div>
          <MonthlySalesChart 
            labels={data?.monthlyCollectionPlan?.labels || []}
            collections={(data?.monthlyCollectionPlan?.actual || []).map(Number)}
            invoices={(data?.monthlyCollectionPlan?.target || []).map(Number)}
          />
        </div>
        {/* Total Debtors Summary */}
        <div id="debtors-summary" className="xl:col-span-5 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt">
          <div className="text-sm font-medium text-secondary-700 mb-3">Total Debtors Summary</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <PieChart
              data={(data?.totalDebtors?.buckets || []).map((b, i) => ({
                label: b.label || b?.name || `Bucket ${i + 1}`,
                value: Number(b.value || b?.amount || 0),
              }))}
              size={vw < 400 ? 160 : vw < 640 ? 180 : 220}
            />
            <div className="space-y-2">
              {(data?.totalDebtors?.buckets || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full`} style={{ backgroundColor: ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8'][i % 5] }} />
                    <span className="text-secondary-700">{b.label || b?.name || `Bucket ${i + 1}`}</span>
                  </div>
                  <span className="font-medium text-primary-700">₹{Number(b.value || b?.amount || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="mt-3 text-xs text-secondary-600">Outstanding: <span className="font-semibold text-secondary-900">₹{Number(data?.totalDebtors?.outstanding||0).toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>

        {/* BOQ Vs Actual Supplies */}
        <div id="boq-actual" className="xl:col-span-7 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-secondary-700">BOQ Vs Actual Supplies</div>
          </div>
          <LineChart points={(data?.boqVsActual?.boq || []).map(Number)} />
          <div className="mt-3"><LineChart points={(data?.boqVsActual?.actual || []).map(Number)} /></div>
        </div>
        {/* Performance + Others */}
        <div id="performance" className="xl:col-span-5 col-span-1 rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft hover-tilt">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-secondary-700 mb-2">Performance</div>
              <div className="relative h-40 w-40 mx-auto">
                <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#10b981 ${Math.min(100, Number(data?.performance?.onTimeCollectionRate||0))}%, #e5e7eb 0)` }} />
                <div className="absolute inset-3 rounded-full bg-white grid place-items-center text-xl font-semibold text-secondary-900">{Math.min(100, Number(data?.performance?.onTimeCollectionRate||0))}%</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-secondary-700 mb-2">Others</div>
              <ul id="others" className="space-y-2 text-sm">
                {(data?.others || []).map((o, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-secondary-700 truncate pr-2">{o.title}</span>
                    <span className="font-medium text-primary-700">{o.value}</span>
                  </li>
                ))}
              </ul>
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

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function FilterForm({ filters, setFilters }) {
  const on = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Date From"><input type="date" className="input" value={filters.from||''} onChange={on('from')} /></Field>
      <Field label="Date To"><input type="date" className="input" value={filters.to||''} onChange={on('to')} /></Field>
      <Field label="Customer"><input className="input" value={filters.customer||''} onChange={on('customer')} /></Field>
      <Field label="Status"><select className="input" value={filters.status||''} onChange={on('status')}><option value="">Any</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option></select></Field>
      <Field label="Payment Type"><select className="input" value={filters.paymentType||''} onChange={on('paymentType')}><option value="">Any</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option></select></Field>
    </div>
  )
}

function AlertsPanel({ alerts, reload }) {
  return (
    <div className="space-y-2">
      {(alerts||[]).length === 0 ? <div className="text-sm text-secondary-600">No alerts</div> : null}
      {alerts.map(a => (
        <div key={a.id} className={`rounded-md px-3 py-2 border text-sm ${a.type==='danger'?'border-danger-200 bg-danger-50':a.type==='warning'?'border-warning-200 bg-warning-50':a.type==='success'?'border-success-200 bg-success-50':'border-secondary-200 bg-secondary-50'}`}> 
          <div className="font-medium">{a.title || a.message}</div>
          {a.detail ? <div className="text-secondary-600 text-xs">{a.detail}</div> : null}
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={reload}>Refresh Alerts</button>
    </div>
  )
}

function InvoiceForm({ form, setForm }) {
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Invoice Number"><input className="input" value={form.invoiceNumber||''} onChange={on('invoiceNumber')} /></Field>
      <Field label="Customer ID"><input className="input" value={form.customerId||''} onChange={on('customerId')} /></Field>
      <Field label="PO Reference"><input className="input" value={form.poRef||''} onChange={on('poRef')} /></Field>
      <Field label="Tax Rate %"><input type="number" className="input" value={form.taxRate||0} onChange={on('taxRate')} /></Field>
      <Field label="Payment Terms"><input className="input" value={form.paymentTerms||''} onChange={on('paymentTerms')} /></Field>
      <Field label="Due Date"><input type="date" className="input" value={form.dueDate||''} onChange={on('dueDate')} /></Field>
    </div>
  )
}

function PaymentForm({ form, setForm }) {
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Invoice Number"><input className="input" value={form.invoiceNumber||''} onChange={on('invoiceNumber')} /></Field>
      <Field label="Amount Received"><input type="number" className="input" value={form.amount||0} onChange={on('amount')} /></Field>
      <Field label="Payment Date"><input type="date" className="input" value={form.paymentDate||''} onChange={on('paymentDate')} /></Field>
      <Field label="Payment Mode"><select className="input" value={form.method||'upi'} onChange={on('method')}><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option></select></Field>
      <Field label="Reference"><input className="input" value={form.reference||''} onChange={on('reference')} /></Field>
    </div>
  )
}

function CustomerForm({ form, setForm }) {
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Name"><input className="input" value={form.name||''} onChange={on('name')} /></Field>
      <Field label="Company Name"><input className="input" value={form.companyName||''} onChange={on('companyName')} /></Field>
      <Field label="Email"><input className="input" value={form.email||''} onChange={on('email')} /></Field>
      <Field label="Phone"><input className="input" value={form.phone||''} onChange={on('phone')} /></Field>
      <Field label="GST Number"><input className="input" value={form.gstNumber||''} onChange={on('gstNumber')} /></Field>
    </div>
  )
}

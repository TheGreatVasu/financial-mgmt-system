import { useEffect, useMemo, useState, useRef } from "react";
import { CalendarRange, Filter, Sparkles, Download, Bell, Star, Zap, TrendingUp, AlertTriangle, RefreshCw, FileText, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { useRealtimeDashboard } from "../../hooks/useRealtimeDashboard.js";
import Modal from "../ui/Modal.jsx";
import { createInvoiceService } from "../../services/invoiceService.js";
import { createPaymentService } from "../../services/paymentService.js";
import { createCustomerService } from "../../services/customerService.js";
import { listAlerts, markRead } from "../../services/alertsService.js";
import SalesInvoiceDashboard from "./SalesInvoiceDashboard.jsx";
import { getSalesInvoiceDashboard } from "../../services/salesInvoiceService.js";
import toast from "react-hot-toast";

export default function TailAdminDashboard() {
  const { token } = useAuthContext()
  const { data, loading, error: dashboardError, isLive, connectionStatus, refresh } = useRealtimeDashboard(token)
  const [error, setError] = useState("")
  const [modal, setModal] = useState(null) // 'Create Invoice'|'Record Payment'|'Add Customer'|'Filter'|'Alerts'|null
  const [form, setForm] = useState({})
  const [filters, setFilters] = useState({})
  const [alerts, setAlerts] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const invApi = useMemo(() => createInvoiceService(token), [token])
  const payApi = useMemo(() => createPaymentService(token), [token])
  const custApi = useMemo(() => createCustomerService(token), [token])

  // Use dashboard error if available
  useEffect(() => {
    if (dashboardError) {
      setError(dashboardError)
    }
  }, [dashboardError])

  // Handle refresh with loading state
  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      await refresh()
      // Small delay to show the refresh animation
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    } catch (err) {
      setIsRefreshing(false)
      setError(err?.message || 'Failed to refresh dashboard')
    }
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

  // Import functionality is now handled globally in DashboardLayout

  async function exportCsv() {
    const base = import.meta?.env?.VITE_API_BASE_URL?.trim() || '/api'
    const api = base.replace(/\/$/,'')
    const endpoints = ['/invoices', '/payments', '/customers']
    const rows = []
    for (const ep of endpoints) {
      try {
        const res = await fetch(`${api}${ep}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
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

  async function exportPdf() {
    try {
      const { createApiClient } = await import('../../services/apiClient')
      const api = createApiClient(token)
      
      // Create PDF report data
      const reportData = {
        type: 'dashboard',
        generatedAt: new Date().toISOString(),
        kpis: data?.kpis || {},
        agingAnalysis: data?.agingAnalysis || [],
        regionalBreakup: data?.regionalBreakup || [],
        monthlyTrends: data?.monthlyTrends || [],
        topCustomersOverdue: data?.topCustomersOverdue || [],
        filters: filters
      }

      const response = await api.post('/reports/pdf', reportData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dashboard-report-${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export PDF:', err)
      // Fallback: Show error or use client-side PDF generation
      alert('PDF export is not available. Please use CSV export instead.')
    }
  }

  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024))
  useEffect(() => {
    function onResize(){ setVw(window.innerWidth) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Always show the new Sales Invoice Dashboard
  // It will handle empty states and errors gracefully
  return <SalesInvoiceDashboard />;
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
  const { token } = useAuthContext()
  const [customers, setCustomers] = useState([])
  const [regions] = useState(['North', 'South', 'East', 'West', 'Central'])

  useEffect(() => {
    // Load customers for dropdown
    if (!token) return
    
    async function loadCustomers() {
      try {
        const { createApiClient } = await import('../../services/apiClient')
        const api = createApiClient(token)
        const { data } = await api.get('/customers?limit=100')
        setCustomers(data?.data || [])
      } catch (err) {
        console.error('Failed to load customers:', err)
      }
    }
    loadCustomers()
  }, [token])

  const on = (k) => (e) => setFilters({ ...filters, [k]: e.target.value })
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Date Range From">
        <input 
          type="date" 
          className="input" 
          value={filters.from||''} 
          onChange={on('from')}
          max={filters.to || undefined}
        />
      </Field>
      <Field label="Date Range To">
        <input 
          type="date" 
          className="input" 
          value={filters.to||''} 
          onChange={on('to')}
          min={filters.from || undefined}
        />
      </Field>
      <Field label="Customer">
        <select 
          className="input" 
          value={filters.customer||''} 
          onChange={on('customer')}
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c.id || c._id} value={c.id || c._id}>
              {c.companyName || c.company_name || c.name || 'Unknown'}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Region">
        <select 
          className="input" 
          value={filters.region||''} 
          onChange={on('region')}
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select 
          className="input" 
          value={filters.status||''} 
          onChange={on('status')}
        >
          <option value="">Any Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
      </Field>
      <Field label="Payment Type">
        <select 
          className="input" 
          value={filters.paymentType||''} 
          onChange={on('paymentType')}
        >
          <option value="">Any Payment Type</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
        </select>
      </Field>
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

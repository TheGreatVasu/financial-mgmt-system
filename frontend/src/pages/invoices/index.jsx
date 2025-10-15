import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Plus, Filter as FilterIcon } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createApiClient } from '../../services/apiClient'

export default function InvoicesList() {
  const { token } = useAuthContext()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const api = useMemo(() => createApiClient(token), [token])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { data } = await api.get('/invoices')
        const rows = data?.data || []
        if (mounted) setInvoices(rows)
      } catch {
        // offline/mock fallback
        const fallback = [
          { id: '1', invoiceNumber: 'INV-0001', customer: 'Acme Corp', totalAmount: 56000, status: 'sent', createdAt: new Date() },
          { id: '2', invoiceNumber: 'INV-0002', customer: 'Globex', totalAmount: 120000, status: 'overdue', createdAt: new Date() },
          { id: '3', invoiceNumber: 'INV-0003', customer: 'Initech', totalAmount: 48000, status: 'paid', createdAt: new Date() },
        ]
        if (mounted) setInvoices(fallback)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [api])

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = status === 'all' ? true : inv.status === status
      const matchQuery = q.trim().length === 0 ? true : (
        inv.invoiceNumber?.toLowerCase().includes(q.toLowerCase()) ||
        inv.customer?.toLowerCase().includes(q.toLowerCase())
      )
      return matchStatus && matchQuery
    })
  }, [invoices, status, q])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-secondary-600 mt-1">Track and manage invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 mb-4">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input max-w-xs">
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="overdue">Overdue</option>
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input flex-1" placeholder="Search invoices..." />
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80">
            <FilterIcon className="h-4 w-4" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="h-32 rounded-md bg-secondary-100/60 animate-pulse" />
        ) : filtered.length === 0 ? (
          <div className="text-secondary-500 text-sm">No invoices match. Try adjusting filters or <Link to="/customers" className="underline">adding a customer</Link>.</div>
        ) : (
          <div className="table-scroll">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-secondary-500">
                  <th className="py-2 pr-3">Invoice</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Created</th>
                  <th className="py-2 pr-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-t border-secondary-100/80 hover:bg-secondary-50/70">
                    <td className="py-2 pr-3 font-medium">
                      <Link to={`/invoices/${inv.id}`} className="text-primary-700 hover:underline">{inv.invoiceNumber}</Link>
                    </td>
                    <td className="py-2 pr-3">{inv.customer}</td>
                    <td className="py-2 pr-3">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-3 capitalize">{inv.status}</td>
                    <td className="py-2 pr-3">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-2 pr-3">
                      <Link to={`/invoices/${inv.id}`} className="text-xs text-primary-700 hover:underline">View</Link>
                    </td>
                  </tr>)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


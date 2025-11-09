import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, Plus, Filter as FilterIcon, Edit, Trash2, Eye } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createInvoiceService } from '../../services/invoiceService.js'
import InvoiceForm from '../../components/invoices/InvoiceForm.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { motion } from 'framer-motion'

export default function InvoicesList() {
  const { token } = useAuthContext()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [deletingInvoice, setDeletingInvoice] = useState(null)
  const [error, setError] = useState('')
  
  const invoiceService = useMemo(() => createInvoiceService(token), [token])

  useEffect(() => {
    loadInvoices()
  }, [invoiceService])

  async function loadInvoices() {
    setLoading(true)
    setError('')
    try {
      const response = await invoiceService.list({ limit: 100 })
      const rows = response?.data || []
      setInvoices(rows)
    } catch (err) {
      setError(err?.message || 'Failed to load invoices')
      console.error('Failed to load invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(payload) {
    try {
      await invoiceService.create(payload)
      setShowCreateModal(false)
      await loadInvoices()
    } catch (err) {
      setError(err?.message || 'Failed to create invoice')
      throw err
    }
  }

  async function handleUpdate(payload) {
    try {
      await invoiceService.update(editingInvoice.id, payload)
      // Close modal first
      setEditingInvoice(null)
      // Then reload invoices to get updated data
      await loadInvoices()
    } catch (err) {
      setError(err?.message || 'Failed to update invoice')
      // Don't close modal on error - let user see the error and retry
      throw err
    }
  }

  async function handleDelete() {
    if (!deletingInvoice) return
    try {
      await invoiceService.remove(deletingInvoice.id)
      setDeletingInvoice(null)
      await loadInvoices()
    } catch (err) {
      setError(err?.message || 'Failed to delete invoice')
    }
  }

  async function handleExport() {
    try {
      const csv = [
        ['Invoice Number', 'Customer', 'Amount', 'Status', 'Created Date'].join(','),
        ...filtered.map(inv => [
          inv.invoiceNumber || inv.invoice_number || '',
          inv.customer || inv.customer_name || '',
          inv.totalAmount || inv.total_amount || 0,
          inv.status || '',
          inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : ''
        ].join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoices-export-${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export invoices')
    }
  }

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = status === 'all' ? true : inv.status === status
      const matchQuery = q.trim().length === 0 ? true : (
        (inv.invoiceNumber || inv.invoice_number || '')?.toLowerCase().includes(q.toLowerCase()) ||
        inv.customer?.toLowerCase().includes(q.toLowerCase()) ||
        inv.customer_name?.toLowerCase().includes(q.toLowerCase())
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
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors shadow-sm"
          >
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
                      <Link to={`/invoices/${inv.id}`} className="text-primary-700 hover:underline">
                        {inv.invoiceNumber || inv.invoice_number || 'N/A'}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{inv.customer || inv.customer_name || 'N/A'}</td>
                    <td className="py-2 pr-3">₹{(inv.totalAmount || inv.total_amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-3 capitalize">{inv.status}</td>
                    <td className="py-2 pr-3">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded transition-colors"
                          title="View invoice"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                        <button
                          onClick={() => setEditingInvoice(inv)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 rounded transition-colors"
                          title="Edit invoice"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingInvoice(inv)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-danger-700 hover:text-danger-900 hover:bg-danger-50 rounded transition-colors"
                          title="Delete invoice"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>)
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Invoice"
        variant="dialog"
        size="lg"
        footer={null}
      >
        <InvoiceForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        open={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        title="Edit Invoice"
        variant="dialog"
        size="lg"
        footer={null}
      >
        {editingInvoice && (
          <InvoiceForm
            invoice={editingInvoice}
            onSubmit={handleUpdate}
            onCancel={() => setEditingInvoice(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingInvoice}
        onClose={() => setDeletingInvoice(null)}
        title="Delete Invoice"
        variant="dialog"
        size="sm"
        footer={(
          <>
            <button
              className="btn btn-outline"
              onClick={() => setDeletingInvoice(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        )}
      >
        {deletingInvoice && (
          <div className="space-y-3">
            <p className="text-sm text-secondary-700">
              Are you sure you want to delete invoice <strong>{deletingInvoice.invoiceNumber}</strong>?
            </p>
            <p className="text-xs text-secondary-500">
              This action cannot be undone. All invoice data will be permanently deleted.
            </p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}


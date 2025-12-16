import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, Plus, Edit, Trash2, Eye, Search, Loader2, AlertCircle, X, FileText, Calendar, DollarSign } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createInvoiceService } from '../../services/invoiceService.js'
import SmartDropdown from '../../components/ui/SmartDropdown.jsx'
import InvoiceForm from '../../components/invoices/InvoiceForm.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function InvoicesList() {
  const { token } = useAuthContext()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [deletingInvoice, setDeletingInvoice] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  
  const invoiceService = useMemo(() => createInvoiceService(token), [token])

  useEffect(() => {
    if (token) {
      loadInvoices()
    }
  }, [token, invoiceService])

  async function loadInvoices() {
    setLoading(true)
    setError('')
    try {
      const response = await invoiceService.list({ limit: 100 })
      const rows = response?.data || []
      setInvoices(rows)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load invoices'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Failed to load invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(payload) {
    try {
      await invoiceService.update(editingInvoice.id, payload)
      toast.success('Invoice updated successfully!')
      setEditingInvoice(null)
      await loadInvoices()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update invoice'
      toast.error(errorMsg)
      throw err
    }
  }

  async function handleDelete() {
    if (!deletingInvoice) return
    setIsDeleting(true)
    try {
      await invoiceService.remove(deletingInvoice.id)
      toast.success('Invoice deleted successfully!')
      setDeletingInvoice(null)
      await loadInvoices()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete invoice'
      toast.error(errorMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleExport() {
    try {
      if (filtered.length === 0) {
        toast.error('No invoices to export')
        return
      }
      
      const csv = [
        ['Invoice Number', 'Customer', 'Amount', 'Status', 'Issue Date', 'Due Date', 'Created Date'].join(','),
        ...filtered.map(inv => [
          `"${inv.invoiceNumber || inv.invoice_number || ''}"`,
          `"${inv.customer || inv.customer_name || ''}"`,
          inv.totalAmount || inv.total_amount || 0,
          inv.status || '',
          inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('en-IN') : inv.issue_date ? new Date(inv.issue_date).toLocaleDateString('en-IN') : '',
          inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '',
          inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : ''
        ].join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`Exported ${filtered.length} invoice(s) successfully!`)
    } catch (err) {
      toast.error('Failed to export invoices')
      console.error('Export error:', err)
    }
  }

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = status === 'all' ? true : inv.status === status
      const matchQuery = q.trim().length === 0 ? true : (
        (inv.invoiceNumber || inv.invoice_number || '')?.toLowerCase().includes(q.toLowerCase()) ||
        (inv.customer || inv.customer_name || '')?.toLowerCase().includes(q.toLowerCase())
      )
      return matchStatus && matchQuery
    })
  }, [invoices, status, q])

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: 'bg-success-100 text-success-700 border-success-200',
      pending: 'bg-warning-100 text-warning-700 border-warning-200',
      sent: 'bg-primary-100 text-primary-700 border-primary-200',
      overdue: 'bg-danger-100 text-danger-700 border-danger-200',
      draft: 'bg-secondary-100 text-secondary-700 border-secondary-200',
      partial: 'bg-amber-100 text-amber-700 border-amber-200'
    }
    return statusMap[status] || statusMap.draft
  }

  const formatAmount = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const InvoiceCard = ({ invoice }) => {
    const issueDate = invoice.issueDate || invoice.issue_date
    const dueDate = invoice.dueDate || invoice.due_date
    const amount = invoice.totalAmount || invoice.total_amount || 0

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-secondary-200 bg-white shadow-sm p-5 flex flex-col gap-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary-500">Invoice</p>
            <p className="text-lg font-semibold text-secondary-900">
              {invoice.invoiceNumber || invoice.invoice_number || 'N/A'}
            </p>
            <p className="text-sm text-secondary-600">
              {invoice.customer || invoice.customer_name || 'Unknown Customer'}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(invoice.status || 'draft')}`}
          >
            {(invoice.status || 'draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-secondary-700">
            <DollarSign className="h-4 w-4 text-secondary-400" />
            <span>{formatAmount(amount)}</span>
          </div>
          <div className="flex items-center gap-2 text-secondary-700">
            <Calendar className="h-4 w-4 text-secondary-400" />
            <span>
              Issue: {issueDate ? new Date(issueDate).toLocaleDateString('en-IN') : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-secondary-700">
            <Calendar className="h-4 w-4 text-secondary-400" />
            <span>
              Due: {dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-secondary-700">
            <FileText className="h-4 w-4 text-secondary-400" />
            <span>{invoice.paymentTerms || invoice.payment_terms || 'Payment terms not set'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
          <div className="text-xs text-secondary-500">
            Updated: {invoice.updatedAt ? new Date(invoice.updatedAt).toLocaleString() : '—'}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/invoices/${invoice.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Link>
            <button
              type="button"
              onClick={() => setEditingInvoice(invoice)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-100 hover:border-primary-300 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setDeletingInvoice(invoice)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-1.5 text-sm font-semibold text-danger-600 hover:bg-danger-100 hover:border-danger-300 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">Invoices</h1>
            <p className="text-sm text-secondary-600 mt-1.5">Track and manage all your invoices</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              disabled={loading || filtered.length === 0}
              className="btn btn-outline btn-md inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => navigate('/invoices/new')}
              className="btn btn-primary btn-md inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Invoice</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-danger-800">Error</p>
                <p className="text-sm text-danger-700 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-danger-600 hover:text-danger-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <div className="card">
          <div className="card-content">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <SmartDropdown
                  value={q}
                  onChange={(val) => setQ(val)}
                  fieldName="invoiceNumber"
                  placeholder="Search by invoice number or customer..."
                  inputClassName="input pl-10 w-full"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input w-full lg:w-auto lg:min-w-[180px]"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card view aligned with PO/Master style */}
        <div className="card">
          <div className="card-content">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="rounded-full bg-secondary-100 p-4 mb-4">
                  <FileText className="h-8 w-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">No invoices found</h3>
                <p className="text-sm text-secondary-600 mb-6 max-w-sm">
                  {invoices.length === 0
                    ? 'Get started by creating your first invoice.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
                {invoices.length === 0 && (
                  <button
                    onClick={() => navigate('/invoices/new')}
                    className="btn btn-primary btn-md inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Invoice
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((inv) => (
                  <InvoiceCard key={inv.id} invoice={inv} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
        onClose={() => !isDeleting && setDeletingInvoice(null)}
        title="Delete Invoice"
        variant="dialog"
        size="sm"
        footer={(
          <>
            <button
              className="btn btn-outline"
              onClick={() => setDeletingInvoice(null)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary bg-danger-600 hover:bg-danger-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </>
        )}
      >
        {deletingInvoice && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-danger-100">
                  <AlertCircle className="h-5 w-5 text-danger-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-secondary-900 mb-1">
                  Are you sure you want to delete this invoice?
                </h3>
                <p className="text-sm text-secondary-700 mb-2">
                  Invoice <strong>{deletingInvoice.invoiceNumber || deletingInvoice.invoice_number || 'N/A'}</strong> will be permanently deleted.
                </p>
                <p className="text-xs text-secondary-500">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}


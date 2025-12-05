import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, Plus, Filter as FilterIcon, Edit, Trash2, Eye, Search, Loader2, AlertCircle, X, FileText } from 'lucide-react'
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

        {/* Table Card */}
        <div className="card">
          <div className="card-content p-0">
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {filtered.map((inv) => (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-secondary-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/invoices/${inv.id}`}
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {inv.invoiceNumber || inv.invoice_number || 'N/A'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {inv.customer || inv.customer_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-secondary-900">
                            ₹{(inv.totalAmount || inv.total_amount || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(inv.status || 'draft')}`}>
                            {(inv.status || 'draft').charAt(0).toUpperCase() + (inv.status || 'draft').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-600">
                            {inv.dueDate
                              ? new Date(inv.dueDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : inv.due_date
                              ? new Date(inv.due_date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/invoices/${inv.id}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                              title="View invoice"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">View</span>
                            </Link>
                            <button
                              onClick={() => setEditingInvoice(inv)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100 rounded-md transition-colors"
                              title="Edit invoice"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => setDeletingInvoice(inv)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-danger-700 hover:text-danger-900 hover:bg-danger-50 rounded-md transition-colors"
                              title="Delete invoice"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
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


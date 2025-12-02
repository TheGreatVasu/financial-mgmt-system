import DashboardLayout from '../components/layout/DashboardLayout'
import React, { useState, useEffect, useMemo } from 'react'
import Modal from '../components/ui/Modal.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { createPaymentService } from '../services/paymentService'
import { getSalesInvoiceDashboard } from '../services/salesInvoiceService'
import { Plus, Search, Calendar, DollarSign, Loader2, AlertCircle, X, Edit, Trash2, CheckCircle2, Clock, AlertTriangle, FileText, Building2, Package, CreditCard, Banknote } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function PaymentsPage() {
  const { token } = useAuthContext()
  const paymentApi = useMemo(() => createPaymentService(token), [token])
  
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [payments, setPayments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 })
  const [filters, setFilters] = useState({ q: '', customer: '', from: '', to: '' })
  const [form, setForm] = useState(defaultForm())
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const debounced = useDebounce(filters, 400)

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const paidCount = payments.filter(p => p.status === 'completed').length
    const pendingCount = payments.filter(p => p.status === 'pending').length
    
    return {
      totalAmount,
      paidCount,
      pendingCount,
      totalCount: payments.length
    }
  }, [payments])

  async function loadInvoices() {
    if (!token) return
    setInvoicesLoading(true)
    try {
      const dashboardData = await getSalesInvoiceDashboard(token)
      const invoicesList = dashboardData?.data?.invoices || []
      setInvoices(invoicesList)
    } catch (err) {
      console.error('Failed to load invoices:', err)
      toast.error('Failed to load invoices')
    } finally {
      setInvoicesLoading(false)
    }
  }

  async function loadPayments(page = meta.page) {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const response = await paymentApi.list({ ...debounced, page, limit: meta.limit })
      setPayments(response?.data || [])
      if (response?.meta) setMeta(response.meta)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load payments'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadPayments(1)
      loadInvoices()
    }
  }, [token, debounced.q, debounced.customer, debounced.from, debounced.to])

  async function submitPayment(e) {
    e?.preventDefault?.()
    try {
      const payload = {
        paymentReceiptDate: form.paymentReceiptDate,
        invoiceId: form.invoiceId,
        customerName: form.customerName,
        projectName: form.projectName,
        packageName: form.packageName,
        paymentAmount: Number(form.paymentAmount),
        paymentType: form.paymentType,
        bankName: form.bankName,
        bankCreditDate: form.bankCreditDate,
      }
      
      if (editingId) {
        await paymentApi.update(editingId, payload)
        toast.success('Payment updated successfully!')
      } else {
        await paymentApi.create(payload)
        toast.success('Payment created successfully!')
      }
      closeModal()
      loadPayments()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save payment'
      toast.error(errorMsg)
      throw err
    }
  }

  function closeModal() {
    setPaymentOpen(false)
    setEditingId(null)
    setForm(defaultForm())
  }

  function onEdit(p) {
    setEditingId(p.id)
    setForm({
      paymentReceiptDate: p.payment_receipt_date ? new Date(p.payment_receipt_date).toISOString().slice(0,10) : '',
      invoiceId: p.invoice_id || '',
      customerName: p.customer_name || '',
      projectName: p.project_name || '',
      packageName: p.package_name || '',
      paymentAmount: p.amount || 0,
      paymentType: p.payment_type || '1st Due',
      bankName: p.bank_name || '',
      bankCreditDate: p.bank_credit_date ? new Date(p.bank_credit_date).toISOString().slice(0,10) : '',
    })
    setPaymentOpen(true)
  }

  function onInvoiceSelect(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId || inv.gst_tax_invoice_no === invoiceId)
    if (invoice) {
      setForm(prev => ({
        ...prev,
        invoiceId: invoice.id || invoice.gst_tax_invoice_no,
        customerName: invoice.customer_name || '',
        projectName: invoice.business_unit || invoice.sales_order_no || '',
        packageName: invoice.material_description || '',
      }))
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) return
    try {
      await paymentApi.remove(id)
      toast.success('Payment deleted successfully!')
      loadPayments()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete payment'
      toast.error(errorMsg)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        border: 'border-green-200', 
        icon: CheckCircle2,
        dot: 'bg-green-500'
      },
      pending: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-700', 
        border: 'border-amber-200', 
        icon: Clock,
        dot: 'bg-amber-500'
      },
      failed: { 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        border: 'border-red-200', 
        icon: AlertTriangle,
        dot: 'bg-red-500'
      },
      cancelled: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-700', 
        border: 'border-gray-200', 
        icon: X,
        dot: 'bg-gray-500'
      }
    }
    return statusMap[status] || statusMap.pending
  }

  // Get unique customers from invoices
  const uniqueCustomers = useMemo(() => {
    const customers = [...new Set(invoices.map(inv => inv.customer_name).filter(Boolean))].sort()
    return customers
  }, [invoices])

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Payments
            </h1>
            <p className="text-sm text-gray-600 mt-2">Track and manage payment records</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Create Payment Entry
          </motion.button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-5 py-4 flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Amount</p>
            <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-blue-100 text-xs mt-2">{stats.totalCount} payments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/25"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">Completed</p>
            <p className="text-2xl font-bold">{stats.paidCount}</p>
            <p className="text-green-100 text-xs mt-2">Payments received</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/25"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-amber-100 text-sm font-medium mb-1">Pending</p>
            <p className="text-2xl font-bold">{stats.pendingCount}</p>
            <p className="text-amber-100 text-xs mt-2">Awaiting processing</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/25"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">Invoices</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
            <p className="text-purple-100 text-xs mt-2">Available for payment</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search payments by invoice number, customer, or reference..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full lg:w-auto lg:min-w-[200px]"
              value={filters.customer}
              onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
            >
              <option value="">All Customers</option>
              {uniqueCustomers.map(customer => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>
            <input
              type="date"
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full lg:w-auto"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              placeholder="From Date"
            />
            <input
              type="date"
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full lg:w-auto"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              placeholder="To Date"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">Payment Entries</h2>
            <p className="text-sm text-gray-600 mt-1">Following format to be displayed for entry</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-6 mb-6">
                  <CreditCard className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Payments found</h3>
                <p className="text-sm text-gray-600 mb-8 max-w-sm">
                  Get started by creating your first payment entry.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPaymentOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Create First Payment
                </motion.button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Receipt Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Credit Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((p) => {
                    const statusBadge = getStatusBadge(p.status)
                    const StatusIcon = statusBadge.icon
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p.payment_receipt_date ? new Date(p.payment_receipt_date).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.customer_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.project_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.package_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{Number(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.payment_type || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.bank_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p.bank_credit_date ? new Date(p.bank_credit_date).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                            <StatusIcon className="h-3 w-3" />
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEdit(p)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDelete(p.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            
            {/* Pagination */}
            {payments.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page <span className="font-semibold text-gray-900">{meta.page}</span> of{' '}
                  <span className="font-semibold text-gray-900">{Math.max(1, Math.ceil((meta.total || 0) / meta.limit))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={meta.page <= 1 || loading}
                    onClick={() => loadPayments(Math.max(1, meta.page - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={meta.page >= Math.ceil((meta.total || 0) / meta.limit) || loading}
                    onClick={() => loadPayments(meta.page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Payment Modal */}
      <Modal
        open={paymentOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Payment Entry' : 'Create Payment Entry'}
        variant="dialog"
        size="lg"
        footer={(
          <div className="flex items-center justify-end gap-2 w-full">
            <button 
              className="btn btn-outline btn-md"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary btn-md"
              onClick={submitPayment} 
              disabled={!form.paymentReceiptDate || !form.invoiceId || !form.paymentAmount}
            >
              {editingId ? 'Update Payment' : 'Create Payment'}
            </button>
          </div>
        )}
      >
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitPayment}>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Payment Receipt Date *</label>
            <input
              type="date"
              className="input"
              value={form.paymentReceiptDate}
              onChange={(e) => setForm({ ...form, paymentReceiptDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Invoice Number *</label>
            <select
              className="input"
              value={form.invoiceId}
              onChange={(e) => {
                setForm({ ...form, invoiceId: e.target.value })
                onInvoiceSelect(e.target.value)
              }}
              required
            >
              <option value="">Select Invoice</option>
              {invoices.map(inv => (
                <option key={inv.id || inv.gst_tax_invoice_no} value={inv.id || inv.gst_tax_invoice_no}>
                  {inv.gst_tax_invoice_no || inv.internal_invoice_no} - {inv.customer_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Customer Name</label>
            <input
              className="input"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Auto-filled from invoice"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Project Name</label>
            <input
              className="input"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              placeholder="Auto-filled from invoice"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Package Name</label>
            <input
              className="input"
              value={form.packageName}
              onChange={(e) => setForm({ ...form, packageName: e.target.value })}
              placeholder="Auto-filled from invoice"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Payment Amount *</label>
            <input
              type="number"
              className="input"
              value={form.paymentAmount}
              onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Payment Type</label>
            <select
              className="input"
              value={form.paymentType}
              onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
            >
              <option value="1st Due">1st Due</option>
              <option value="2nd Due">2nd Due</option>
              <option value="3rd Due">3rd Due</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Bank Name</label>
            <input
              className="input"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="Amount Credit Bank Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Bank Credit Date</label>
            <input
              type="date"
              className="input"
              value={form.bankCreditDate}
              onChange={(e) => setForm({ ...form, bankCreditDate: e.target.value })}
              placeholder="Payment Credit in Bank Date"
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

function defaultForm() {
  return {
    paymentReceiptDate: '',
    invoiceId: '',
    customerName: '',
    projectName: '',
    packageName: '',
    paymentAmount: 0,
    paymentType: '1st Due',
    bankName: '',
    bankCreditDate: '',
  }
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

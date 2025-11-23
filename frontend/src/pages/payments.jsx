import DashboardLayout from '../components/layout/DashboardLayout'
import React, { useState, useEffect, useMemo } from 'react'
import Modal from '../components/ui/Modal.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { createMOMService } from '../services/momService'
import { createPaymentService } from '../services/paymentService'
import { Plus, Search, Filter, Calendar, DollarSign, Loader2, AlertCircle, X, Edit, Trash2, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function PaymentsPage() {
  const { token } = useAuthContext()
  const momApi = useMemo(() => createMOMService(token), [token])
  const paymentApi = useMemo(() => createPaymentService(token), [token])
  
  const [momOpen, setMomOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [moms, setMoms] = useState([])
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0 })
  const [filters, setFilters] = useState({ q: '', status: '', from: '', to: '' })
  const [form, setForm] = useState(defaultForm())
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const smart = useMemo(() => {
    const amount = Number(form.paymentAmount || 0)
    const rate = Number(form.interestRate || 0)
    const due = form.dueDate ? new Date(form.dueDate) : null
    const today = new Date()
    let computedInterest = 0
    if (due && today > due && rate > 0) {
      const daysLate = Math.floor((today - due) / (24*60*60*1000))
      computedInterest = Math.round(((amount * (rate/100)) / 30) * daysLate * 100) / 100
    }
    return { totalPayable: amount + computedInterest, pendingDues: amount, computedInterest }
  }, [form.paymentAmount, form.interestRate, form.dueDate])

  const debounced = useDebounce(filters, 400)

  async function loadPayments() {
    if (!token) return
    setPaymentsLoading(true)
    try {
      const response = await paymentApi.list({ limit: 50 })
      setPayments(response?.data || [])
    } catch (err) {
      console.error('Failed to load payments:', err)
      // Don't show error toast for payments if it's not critical
    } finally {
      setPaymentsLoading(false)
    }
  }

  async function load(page = meta.page) {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const { data, meta: m } = await momApi.list({ ...debounced, page, limit: meta.limit })
      setMoms(data || [])
      if (m) setMeta(m)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load payment MOMs'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      load(1)
      loadPayments()
    }
  }, [token, debounced.q, debounced.status, debounced.from, debounced.to])

  async function submitMOM(e) {
    e?.preventDefault?.()
    try {
      const payload = {
        ...form,
        meetingDate: new Date(form.meetingDate),
        participants: form.participants.split(',').map(s => s.trim()).filter(Boolean),
        paymentAmount: Number(form.paymentAmount),
        interestRate: Number(form.interestRate),
        aiSummary: undefined,
      }
      if (editingId) {
        await momApi.update(editingId, payload)
        toast.success('Payment MOM updated successfully!')
      } else {
        await momApi.create(payload)
        toast.success('Payment MOM created successfully!')
      }
      closeModal()
      load()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save payment MOM'
      toast.error(errorMsg)
      throw err
    }
  }

  function closeModal() {
    setMomOpen(false)
    setEditingId(null)
    setForm(defaultForm())
  }

  function onEdit(m) {
    setEditingId(m._id)
    setForm({
      meetingTitle: m.meetingTitle || '',
      meetingDate: new Date(m.meetingDate).toISOString().slice(0,10),
      participants: (m.participants || []).join(', '),
      agenda: m.agenda || '',
      discussionNotes: m.discussionNotes || '',
      agreedPaymentTerms: m.agreedPaymentTerms || '',
      paymentAmount: m.paymentAmount ?? 0,
      dueDate: m.dueDate ? new Date(m.dueDate).toISOString().slice(0,10) : '',
      paymentType: m.paymentType || 'milestone',
      interestRate: m.interestRate ?? 0,
      status: m.status || 'planned'
    })
    setMomOpen(true)
  }

  async function onDelete(id) {
    if (!window.confirm('Are you sure you want to delete this payment MOM? This action cannot be undone.')) return
    try {
      await momApi.remove(id)
      toast.success('Payment MOM deleted successfully!')
      load()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete payment MOM'
      toast.error(errorMsg)
    }
  }

  async function quickStatus(id, status) {
    try {
      await momApi.update(id, { status })
      toast.success(`Status updated to ${status}`)
      load()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update status'
      toast.error(errorMsg)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      planned: { bg: 'bg-secondary-100', text: 'text-secondary-700', border: 'border-secondary-200', icon: Clock },
      due: { bg: 'bg-warning-100', text: 'text-warning-700', border: 'border-warning-200', icon: Clock },
      paid: { bg: 'bg-success-100', text: 'text-success-700', border: 'border-success-200', icon: CheckCircle2 },
      overdue: { bg: 'bg-danger-100', text: 'text-danger-700', border: 'border-danger-200', icon: AlertTriangle },
      cancelled: { bg: 'bg-secondary-100', text: 'text-secondary-700', border: 'border-secondary-200', icon: X }
    }
    return statusMap[status] || statusMap.planned
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">Payments</h1>
            <p className="text-sm text-secondary-600 mt-1.5">Track and manage payment records and MOMs</p>
          </div>
          <button
            onClick={() => setMomOpen(true)}
            className="btn btn-primary btn-md inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Payment MOM
          </button>
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

        {/* Filters */}
        <div className="card">
          <div className="card-content">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  className="input pl-10 w-full"
                  placeholder="Search MOMs..."
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                />
              </div>
              <select
                className="input w-full lg:w-auto lg:min-w-[180px]"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="planned">Planned</option>
                <option value="due">Due</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <input
                type="date"
                className="input w-full lg:w-auto"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                placeholder="From Date"
              />
              <input
                type="date"
                className="input w-full lg:w-auto"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                placeholder="To Date"
              />
            </div>
          </div>
        </div>

        {/* Payment MOMs Grid */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Payment MOMs</h2>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : moms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="rounded-full bg-secondary-100 p-4 mb-4">
                  <FileText className="h-8 w-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Payment MOMs found</h3>
                <p className="text-sm text-secondary-600 mb-6 max-w-sm">
                  Get started by creating your first payment MOM.
                </p>
                <button
                  onClick={() => setMomOpen(true)}
                  className="btn btn-primary btn-md inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First MOM
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moms.map(m => {
                  const statusBadge = getStatusBadge(m.status)
                  const StatusIcon = statusBadge.icon
                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-secondary-200 p-5 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-semibold text-secondary-900 line-clamp-1">{m.meetingTitle}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          <StatusIcon className="h-3 w-3" />
                          {m.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
  <div className="flex items-center gap-2 text-sm text-secondary-600">
    <Calendar className="h-4 w-4" />
    <span>
      {new Date(m.meetingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </span>
  </div>

  {m.dueDate && (
    <div className="flex items-center gap-2 text-sm text-secondary-600">
      <Clock className="h-4 w-4" />
      <span>
        Due:{" "}
        {new Date(m.dueDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    </div>
  )}

  <div className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
    <DollarSign className="h-4 w-4" />

    <span>
      ₹
      {((m.smart?.totalPayable ?? m.paymentAmount) || 0).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}
    </span>
  </div>
</div>


                      {m.aiSummary || m.agreedPaymentTerms ? (
                        <p className="text-sm text-secondary-600 line-clamp-2 mb-4">
                          {m.aiSummary || m.agreedPaymentTerms}
                        </p>
                      ) : null}

                      <div className="flex items-center gap-2 pt-4 border-t border-secondary-200">
                        <button
                          onClick={() => onEdit(m)}
                          className="btn btn-outline btn-sm flex-1"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(m._id)}
                          className="btn btn-outline btn-sm text-danger-700 hover:bg-danger-50 hover:border-danger-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() => quickStatus(m._id, 'paid')}
                            className="p-1.5 text-success-600 hover:bg-success-50 rounded transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => quickStatus(m._id, 'overdue')}
                            className="p-1.5 text-danger-600 hover:bg-danger-50 rounded transition-colors"
                            title="Mark as Overdue"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
            
            {/* Pagination */}
            {moms.length > 0 && (
              <div className="mt-6 flex items-center justify-between text-sm">
                <div className="text-secondary-600">
                  Page {meta.page} of {Math.max(1, Math.ceil((meta.total || 0) / meta.limit))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={meta.page <= 1 || loading}
                    onClick={() => load(Math.max(1, meta.page - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={meta.page >= Math.ceil((meta.total || 0) / meta.limit) || loading}
                    onClick={() => load(meta.page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit MOM Modal */}
      <Modal
        open={momOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Payment MOM' : 'Create Payment MOM'}
        variant="dialog"
        size="lg"
        footer={(
          <>
            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={submitMOM} disabled={!form.meetingTitle || !form.meetingDate}>
              {editingId ? 'Update MOM' : 'Create MOM'}
            </button>
          </>
        )}
      >
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitMOM}>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Meeting Title *</label>
            <input
              className="input"
              value={form.meetingTitle}
              onChange={(e) => setForm({ ...form, meetingTitle: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Date *</label>
            <input
              type="date"
              className="input"
              value={form.meetingDate}
              onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Participants</label>
            <input
              className="input"
              placeholder="Comma separated names"
              value={form.participants}
              onChange={(e) => setForm({ ...form, participants: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Agenda</label>
            <input
              className="input"
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Discussion Notes</label>
            <textarea
              className="input min-h-[80px]"
              value={form.discussionNotes}
              onChange={(e) => setForm({ ...form, discussionNotes: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Agreed Payment Terms</label>
            <textarea
              className="input min-h-[60px]"
              value={form.agreedPaymentTerms}
              onChange={(e) => setForm({ ...form, agreedPaymentTerms: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Payment Amount</label>
            <input
              type="number"
              className="input"
              value={form.paymentAmount}
              onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Due Date</label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Payment Type</label>
            <select
              className="input"
              value={form.paymentType}
              onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
            >
              <option value="advance">Advance</option>
              <option value="milestone">Milestone</option>
              <option value="final">Final</option>
              <option value="refund">Refund</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Interest Rate (%)</label>
            <input
              type="number"
              className="input"
              value={form.interestRate}
              onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="planned">Planned</option>
              <option value="due">Due</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-lg border border-secondary-200 p-4 bg-secondary-50">
              <div className="text-sm font-semibold mb-2 text-secondary-900">Smart Calculation</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-secondary-600">Total Payable:</span>
                  <span className="font-semibold text-secondary-900 ml-2">₹{smart.totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-secondary-600">Pending Dues:</span>
                  <span className="font-semibold text-secondary-900 ml-2">₹{smart.pendingDues.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-secondary-600">Interest:</span>
                  <span className="font-semibold text-secondary-900 ml-2">₹{smart.computedInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

function defaultForm() {
  return {
    meetingTitle: '',
    meetingDate: new Date().toISOString().slice(0,10),
    participants: '',
    agenda: '',
    discussionNotes: '',
    agreedPaymentTerms: '',
    paymentAmount: 0,
    dueDate: '',
    paymentType: 'milestone',
    interestRate: 0,
    status: 'planned'
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



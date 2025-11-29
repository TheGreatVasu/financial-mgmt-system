import DashboardLayout from '../components/layout/DashboardLayout'
import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Modal from '../components/ui/Modal.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { createMOMService } from '../services/momService'
import { createPaymentService } from '../services/paymentService'
import { Plus, Search, Filter, Calendar, DollarSign, Loader2, AlertCircle, X, Edit, Trash2, CheckCircle2, Clock, AlertTriangle, FileText, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function PaymentsPage() {
  const { token } = useAuthContext()
  const momApi = useMemo(() => createMOMService(token), [token])
  const paymentApi = useMemo(() => createPaymentService(token), [token])
  const [searchParams, setSearchParams] = useSearchParams()
  
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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAmount = moms.reduce((sum, m) => sum + ((m.smart?.totalPayable ?? m.paymentAmount) || 0), 0)
    const paidAmount = moms.filter(m => m.status === 'paid').reduce((sum, m) => sum + ((m.smart?.totalPayable ?? m.paymentAmount) || 0), 0)
    const pendingAmount = moms.filter(m => ['planned', 'due'].includes(m.status)).reduce((sum, m) => sum + ((m.smart?.totalPayable ?? m.paymentAmount) || 0), 0)
    const overdueAmount = moms.filter(m => m.status === 'overdue').reduce((sum, m) => sum + ((m.smart?.totalPayable ?? m.paymentAmount) || 0), 0)
    const overdueCount = moms.filter(m => m.status === 'overdue').length
    const dueCount = moms.filter(m => m.status === 'due').length
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      overdueCount,
      dueCount,
      totalCount: moms.length
    }
  }, [moms])

  const debounced = useDebounce(filters, 400)

  async function loadPayments() {
    if (!token) return
    setPaymentsLoading(true)
    try {
      const response = await paymentApi.list({ limit: 50 })
      setPayments(response?.data || [])
    } catch (err) {
      console.error('Failed to load payments:', err)
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

  useEffect(() => {
    if (searchParams.get('createMom')) {
      setMomOpen(true)
      const params = new URLSearchParams(searchParams)
      params.delete('createMom')
      setSearchParams(params, { replace: true })
    }
  }, [searchParams, setSearchParams])

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
      planned: { 
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100', 
        text: 'text-blue-700', 
        border: 'border-blue-200', 
        icon: Clock,
        dot: 'bg-blue-500'
      },
      due: { 
        bg: 'bg-gradient-to-r from-amber-50 to-amber-100', 
        text: 'text-amber-700', 
        border: 'border-amber-200', 
        icon: Clock,
        dot: 'bg-amber-500'
      },
      paid: { 
        bg: 'bg-gradient-to-r from-green-50 to-green-100', 
        text: 'text-green-700', 
        border: 'border-green-200', 
        icon: CheckCircle2,
        dot: 'bg-green-500'
      },
      overdue: { 
        bg: 'bg-gradient-to-r from-red-50 to-red-100', 
        text: 'text-red-700', 
        border: 'border-red-200', 
        icon: AlertTriangle,
        dot: 'bg-red-500'
      },
      cancelled: { 
        bg: 'bg-gradient-to-r from-gray-50 to-gray-100', 
        text: 'text-gray-700', 
        border: 'border-gray-200', 
        icon: X,
        dot: 'bg-gray-500'
      }
    }
    return statusMap[status] || statusMap.planned
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Payments
            </h1>
            <p className="text-sm text-gray-600 mt-2">Track and manage payment records and MOMs</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMomOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Create Payment MOM
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
                <Wallet className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Amount</p>
            <p className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-blue-100 text-xs mt-2">{stats.totalCount} MOMs</p>
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
              <TrendingUp className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">Paid</p>
            <p className="text-2xl font-bold">₹{stats.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-green-100 text-xs mt-2">Completed payments</p>
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
              <AlertCircle className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-amber-100 text-sm font-medium mb-1">Pending</p>
            <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-amber-100 text-xs mt-2">{stats.dueCount} due soon</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-red-500/25"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <TrendingDown className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-red-100 text-sm font-medium mb-1">Overdue</p>
            <p className="text-2xl font-bold">₹{stats.overdueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-red-100 text-xs mt-2">{stats.overdueCount} require attention</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search MOMs by title, participants, or notes..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full lg:w-auto lg:min-w-[200px]"
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

        {/* Payment MOMs Grid */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">Payment MOMs</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your payment minutes of meeting</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            ) : moms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-6 mb-6">
                  <FileText className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Payment MOMs found</h3>
                <p className="text-sm text-gray-600 mb-8 max-w-sm">
                  Get started by creating your first payment MOM to track payment discussions and agreements.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMomOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Create First MOM
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {moms.map((m, index) => {
                  const statusBadge = getStatusBadge(m.status)
                  const StatusIcon = statusBadge.icon
                  const amount = (m.smart?.totalPayable ?? m.paymentAmount) || 0
                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Status indicator bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${statusBadge.bg.replace('bg-gradient-to-r', 'bg')}`} />
                      
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 pr-2 flex-1">{m.meetingTitle}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} flex-shrink-0`}>
                          <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                          {m.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(m.meetingDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {m.dueDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              Due: {new Date(m.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="text-xl font-bold text-gray-900">
                              ₹{amount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {(m.aiSummary || m.agreedPaymentTerms) && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-5 bg-gray-50 rounded-lg p-3 border border-gray-100">
                          {m.aiSummary || m.agreedPaymentTerms}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => onEdit(m)}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(m._id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() => quickStatus(m._id, 'paid')}
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => quickStatus(m._id, 'overdue')}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing page <span className="font-semibold text-gray-900">{meta.page}</span> of{' '}
                  <span className="font-semibold text-gray-900">{Math.max(1, Math.ceil((meta.total || 0) / meta.limit))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={meta.page <= 1 || loading}
                    onClick={() => load(Math.max(1, meta.page - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex items-center justify-end gap-3 w-full">
            <button 
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 
                         border border-secondary-300 dark:border-secondary-700 
                         bg-white dark:bg-secondary-800 
                         text-secondary-700 dark:text-secondary-300 
                         hover:bg-secondary-50 dark:hover:bg-secondary-700 
                         hover:border-secondary-400 dark:hover:border-secondary-600
                         focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button 
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 
                         bg-gradient-to-r from-blue-600 to-blue-700 
                         text-white shadow-lg shadow-blue-500/30
                         hover:from-blue-700 hover:to-blue-800 
                         hover:shadow-xl hover:shadow-blue-500/40
                         active:scale-[0.98]
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         inline-flex items-center justify-center gap-2"
              onClick={submitMOM} 
              disabled={!form.meetingTitle || !form.meetingDate}
            >
              {editingId ? 'Update MOM' : 'Create MOM'}
            </button>
          </div>
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

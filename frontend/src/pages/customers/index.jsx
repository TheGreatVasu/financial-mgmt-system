import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Upload, Search, Loader2, AlertCircle, X, Edit, Trash2, Eye, FileText, Building2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import Modal from '../../components/ui/Modal.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function CustomersList() {
  const { token } = useAuthContext()
  const navigate = useNavigate()
  const api = useMemo(() => createCustomerService(token), [token])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('all')
  const [deletingCustomer, setDeletingCustomer] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      loadCustomers()
    }
  }, [token, api])

  async function loadCustomers() {
    setLoading(true)
    setError('')
    try {
      const response = await api.list({ limit: 100 })
      const rows = response?.data || []
      setCustomers(rows)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load customers'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Failed to load customers:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deletingCustomer) return
    setIsDeleting(true)
    try {
      await api.remove(deletingCustomer.id)
      toast.success('Customer deleted successfully!')
      setDeletingCustomer(null)
      await loadCustomers()
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete customer'
      toast.error(errorMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchQuery = q.trim().length === 0 ? true : (
        (c.name || '')?.toLowerCase().includes(q.toLowerCase()) ||
        (c.companyName || c.company_name || '')?.toLowerCase().includes(q.toLowerCase()) ||
        (c.email || '')?.toLowerCase().includes(q.toLowerCase()) ||
        (c.phone || '')?.toLowerCase().includes(q.toLowerCase())
      )
      const matchTier = tier === 'all' ? true : (c.tier || '') === tier
      return matchQuery && matchTier
    })
  }, [customers, q, tier])

  const getTierBadge = (tier) => {
    const tierMap = {
      enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
      business: 'bg-blue-100 text-blue-700 border-blue-200',
      startup: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
    return tierMap[tier] || 'bg-secondary-100 text-secondary-700 border-secondary-200'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">Customers</h1>
            <p className="text-sm text-secondary-600 mt-1.5">Manage your customer database</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="btn btn-outline btn-md inline-flex items-center gap-2"
              onClick={() => toast.info('Import feature coming soon!')}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <Link
              to="/customers/new"
              className="btn btn-primary btn-md inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </Link>
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

        {/* Filters */}
        <div className="card">
          <div className="card-content">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="Search by name, company, email, or phone..."
                />
              </div>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="input w-full lg:w-auto lg:min-w-[180px]"
              >
                <option value="all">All Tiers</option>
                <option value="enterprise">Enterprise</option>
                <option value="business">Business</option>
                <option value="startup">Startup</option>
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
                  <Building2 className="h-8 w-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">No customers found</h3>
                <p className="text-sm text-secondary-600 mb-6 max-w-sm">
                  {customers.length === 0
                    ? 'Get started by adding your first customer.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
                {customers.length === 0 && (
                  <Link
                    to="/customers/new"
                    className="btn btn-primary btn-md inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Customer
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Company / Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Outstanding
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-secondary-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {filtered.map((c) => (
                      <motion.tr
                        key={c.id || c._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-secondary-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/customers/${c.id || c._id}`}
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {c.companyName || c.company_name || c.name || 'N/A'}
                          </Link>
                          {c.name && (c.companyName || c.company_name) && (
                            <div className="text-xs text-secondary-500 mt-0.5">{c.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">{c.email || 'N/A'}</div>
                          {c.phone && (
                            <div className="text-xs text-secondary-500 mt-0.5">{c.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.tier ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierBadge(c.tier)}`}>
                              {c.tier.charAt(0).toUpperCase() + c.tier.slice(1)}
                            </span>
                          ) : (
                            <span className="text-sm text-secondary-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-secondary-900">
                            ₹{(c.outstanding || 0).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/customers/${c.id || c._id}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                              title="View customer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">View</span>
                            </Link>
                            <button
                              onClick={() => setDeletingCustomer(c)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-danger-700 hover:text-danger-900 hover:bg-danger-50 rounded-md transition-colors"
                              title="Delete customer"
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingCustomer}
        onClose={() => !isDeleting && setDeletingCustomer(null)}
        title="Delete Customer"
        variant="dialog"
        size="sm"
        footer={(
          <>
            <button
              className="btn btn-outline"
              onClick={() => setDeletingCustomer(null)}
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
        {deletingCustomer && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-danger-100">
                  <AlertCircle className="h-5 w-5 text-danger-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-secondary-900 mb-1">
                  Are you sure you want to delete this customer?
                </h3>
                <p className="text-sm text-secondary-700 mb-2">
                  Customer <strong>{deletingCustomer.companyName || deletingCustomer.company_name || deletingCustomer.name || 'N/A'}</strong> will be permanently deleted.
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

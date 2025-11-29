import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Upload, Search, Loader2, AlertCircle, X, Edit, Trash2, Eye, FileText, Building2, Mail, Phone, MapPin, Users, CreditCard, Calendar, ChevronRight } from 'lucide-react'
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
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'

  useEffect(() => {
    if (token) {
      loadCustomers()
    }
  }, [token, api])

  async function loadCustomers() {
    setLoading(true)
    setError('')
    try {
      // Load with master data included
      const response = await api.list({ limit: 100, includeMaster: true })
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
      await api.remove(deletingCustomer.id || deletingCustomer._id)
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
      const companyName = c.companyName || c.company_name || ''
      const name = c.name || ''
      const email = c.email || c.contact_email || ''
      const phone = c.phone || c.contact_phone || ''
      const searchText = `${companyName} ${name} ${email} ${phone}`.toLowerCase()
      
      const matchQuery = q.trim().length === 0 ? true : searchText.includes(q.toLowerCase())
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
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Master Data
            </h1>
            <p className="text-sm text-gray-600 mt-2">View and manage all your customer master data records</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-all duration-200 text-sm font-medium text-secondary-700 dark:text-secondary-300 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
              onClick={() => toast.info('Import feature coming soon!')}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <Link
              to="/customers/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 
                         bg-gradient-to-r from-blue-600 to-blue-700 
                         text-white shadow-lg shadow-blue-500/30
                         hover:from-blue-700 hover:to-blue-800 
                         hover:shadow-xl hover:shadow-blue-500/40
                         active:scale-[0.98]
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create New</span>
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

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search by name, company, email, or phone..."
              />
            </div>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full lg:w-auto lg:min-w-[180px]"
            >
              <option value="all">All Tiers</option>
              <option value="enterprise">Enterprise</option>
              <option value="business">Business</option>
              <option value="startup">Startup</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-6 mb-6">
              <Building2 className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No master data found</h3>
            <p className="text-sm text-gray-600 mb-8 max-w-sm">
              {customers.length === 0
                ? 'Get started by creating your first master data record.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {customers.length === 0 && (
              <Link
                to="/customers/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5" />
                Create First Master Data
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, index) => {
              const companyName = c.companyName || c.company_name || 'Unnamed Company'
              const name = c.name || 'N/A'
              const email = c.email || c.contact_email || 'N/A'
              const phone = c.phone || c.contact_phone || 'N/A'
              const metadata = c.metadata || {}
              const companyProfile = metadata.companyProfile || {}
              const customerProfile = metadata.customerProfile || {}
              const paymentTerms = metadata.paymentTerms || []
              const teamProfiles = metadata.teamProfiles || []
              const masterProfile = c.masterProfile || {}
              const siteOffices = c.siteOffices || []
              const plantAddresses = c.plantAddresses || []
              
              return (
                <motion.div
                  key={c.id || c._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                  
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 pr-2 flex-1">
                        {companyName}
                      </h3>
                      {c.tier && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getTierBadge(c.tier)} flex-shrink-0`}>
                          {c.tier.charAt(0).toUpperCase() + c.tier.slice(1)}
                        </span>
                      )}
                    </div>
                    {masterProfile.legal_entity_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Legal Entity:</span> {masterProfile.legal_entity_name}
                      </p>
                    )}
                    {name && name !== 'N/A' && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Contact:</span> {name}
                      </p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    {email !== 'N/A' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{email}</span>
                      </div>
                    )}
                    {phone !== 'N/A' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{phone}</span>
                      </div>
                    )}
                    {c.gst_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{c.gst_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Master Data Summary */}
                  <div className="space-y-3 mb-4">
                    {siteOffices.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>{siteOffices.length} Site Office{siteOffices.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {plantAddresses.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span>{plantAddresses.length} Plant Address{plantAddresses.length > 1 ? 'es' : ''}</span>
                      </div>
                    )}
                    {paymentTerms.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                        <span>{paymentTerms.length} Payment Term{paymentTerms.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {teamProfiles.filter(t => t.name).length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span>{teamProfiles.filter(t => t.name).length} Team Member{teamProfiles.filter(t => t.name).length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Link
                      to={`/customers/${c.id || c._id}`}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all inline-flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    <button
                      onClick={() => setDeletingCustomer(c)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && filtered.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Total Master Data Records</p>
                <p className="text-3xl font-bold text-blue-900">{filtered.length}</p>
              </div>
              <div className="p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingCustomer}
        onClose={() => !isDeleting && setDeletingCustomer(null)}
        title="Delete Master Data"
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
              className="btn btn-primary bg-red-600 hover:bg-red-700"
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
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Are you sure you want to delete this master data record?
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{deletingCustomer.companyName || deletingCustomer.company_name || deletingCustomer.name || 'N/A'}</strong> will be permanently deleted.
                </p>
                <p className="text-xs text-gray-500">
                  This action cannot be undone. All associated data including company profile, customer profile, payment terms, and team profiles will be permanently removed.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

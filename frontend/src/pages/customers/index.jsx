import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plus, Upload, Search, Loader2, AlertCircle, X, Edit, Trash2, Eye, FileText, Building2, Mail, Phone, MapPin, Users, CreditCard, Calendar, ChevronRight, RefreshCw, DollarSign } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import Modal from '../../components/ui/Modal.jsx'
import toast from 'react-hot-toast'

function Card({ entry, onDelete, onPreview }) {
  const companyName = entry.companyName || entry.company_name || 'Unnamed Company'
  const metadata = entry.metadata || {}
  const companyProfile = metadata.companyProfile || {}
  const customerProfile = metadata.customerProfile || {}
  const email = entry.email || entry.contact_email || customerProfile.emailId || companyProfile.emailId || 'N/A'
  const phone = entry.phone || entry.contact_phone || customerProfile.contactNumber || companyProfile.contactNumber || 'N/A'
  const segment = customerProfile.segment || entry.segment || 'Segment not set'
  const gstNumber = customerProfile.gstNumber || entry.gst_number || companyProfile.gstNumber || 'GST not set'
  const legalEntity = entry.legal_entity_name || customerProfile.legalEntityName || companyProfile.legalEntityName || 'N/A'
  const state = companyProfile.corporateState || customerProfile.corporateState || 'N/A'
  const country = companyProfile.corporateCountry || customerProfile.corporateCountry || 'N/A'
  const paymentTerms = metadata.paymentTerms || []
  const teamProfiles = metadata.teamProfiles || []

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="p-6 flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Company</p>
            </div>
            <h3 className="text-xl font-bold text-gray-900 truncate mb-1">{companyName}</h3>
            <p className="text-sm text-gray-600 truncate">{legalEntity}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-semibold text-blue-700 uppercase">{segment}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 gap-3">
          {email !== 'N/A' && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
              </div>
            </div>
          )}
          
          {phone !== 'N/A' && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Phone className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <p className="text-sm font-medium text-gray-900">{phone}</p>
              </div>
            </div>
          )}

          {gstNumber !== 'GST not set' && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">GST Number</p>
                <p className="text-sm font-medium text-gray-900 truncate">{gstNumber}</p>
              </div>
            </div>
          )}

          {(state !== 'N/A' || country !== 'N/A') && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Location</p>
                <p className="text-sm font-medium text-gray-900">{state !== 'N/A' && country !== 'N/A' ? `${state}, ${country}` : state !== 'N/A' ? state : country}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          {paymentTerms.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <CreditCard className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium">{paymentTerms.length} Payment Term{paymentTerms.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {teamProfiles.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium">{teamProfiles.length} Team Member{teamProfiles.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <Calendar className="h-3 w-3 inline mr-1" />
              {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              }) : '—'}
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/customers/new?id=${entry.id || entry._id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all duration-200"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => onPreview?.(entry)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-200"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(entry)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all duration-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomersList() {
  const { token } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const api = useMemo(() => createCustomerService(token), [token])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('all')
  const [deletingCustomer, setDeletingCustomer] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewCustomer, setPreviewCustomer] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      loadCustomers()
    }
  }, [token, api, location.key, location.state?.refresh])

  async function loadCustomers() {
    setLoading(true)
    setError('')
    try {
      // Load with master data included
      const response = await api.list({ limit: 100, includeMaster: 'true' })
      console.log('Customers API full response:', response)
      console.log('Response structure:', {
        success: response?.success,
        hasData: !!response?.data,
        dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
        dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A',
        meta: response?.meta
      })
      
      // Handle different response structures
      let rows = []
      if (Array.isArray(response)) {
        // Direct array response
        rows = response
      } else if (Array.isArray(response?.data)) {
        // Nested data array
        rows = response.data
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Double nested
        rows = response.data.data
      }
      
      console.log('Final rows extracted:', rows.length, rows)
      setCustomers(rows)
      
      if (rows.length === 0) {
        console.warn('No customers found. This could mean:')
        console.warn('1. No customers have been created yet')
        console.warn('2. Customers exist but created_by field is NULL')
        console.warn('3. Customers exist but belong to a different user')
        console.warn('4. API response structure might be different than expected')
      } else {
        console.log('Successfully loaded', rows.length, 'customer(s)')
        // Log first customer structure for debugging
        if (rows[0]) {
          console.log('Sample customer structure:', {
            id: rows[0].id || rows[0]._id,
            companyName: rows[0].companyName || rows[0].company_name,
            hasMetadata: !!rows[0].metadata,
            metadataKeys: rows[0].metadata ? Object.keys(rows[0].metadata) : []
          })
        }
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load customers'
      setError(errorMsg)
      toast.error(errorMsg)
      console.error('Failed to load customers:', err)
      console.error('Error details:', {
        response: err?.response,
        data: err?.response?.data,
        status: err?.response?.status
      })
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-secondary-600 mb-1">
                Structured Master Linked Form
              </div>
              <h1 className="text-2xl font-semibold text-secondary-900">Master Data Records</h1>
              <p className="text-sm text-secondary-600">Browse and manage all recorded master data.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  console.log('Manual refresh triggered')
                  loadCustomers()
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/customers/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Master Data
              </Link>
            </div>
          </div>

        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search and Filters */}
        {!loading && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  placeholder="Search by name, company, email, or phone..."
                />
              </div>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full lg:w-auto lg:min-w-[180px] bg-white"
              >
                <option value="all">All Tiers</option>
                <option value="enterprise">Enterprise</option>
                <option value="business">Business</option>
                <option value="startup">Startup</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-sm text-gray-600 font-medium">Loading master data records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No master data found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {q || tier !== 'all' 
                ? 'No records match your search criteria. Try adjusting your filters.'
                : 'Create your first master data entry to get started. Fill out the complete form to see it displayed here as a card.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {(q || tier !== 'all') && (
                <button
                  onClick={() => {
                    setQ('')
                    setTier('all')
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
              <Link
                to="/customers/new"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Master Data
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filtered.map((entry) => (
                <Card
                  key={entry._id || entry.id}
                  entry={entry}
                  onDelete={() => setDeletingCustomer(entry)}
                  onPreview={() => setPreviewCustomer(entry)}
                />
              ))}
            </div>
          </>
        )}

        {/* Stats Summary */}
        {!loading && filtered.length > 0 && (
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl border border-blue-800 shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100 mb-2 opacity-90">Total Master Data Records</p>
                <p className="text-4xl font-bold text-white mb-1">{filtered.length}</p>
                <p className="text-xs text-blue-200 opacity-75">
                  {filtered.length === 1 ? 'record' : 'records'} {q || tier !== 'all' ? 'found' : 'available'}
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        )}
      

      {/* Preview Modal */}
      <Modal
        open={!!previewCustomer}
        onClose={() => setPreviewCustomer(null)}
        title="Master Data Preview"
        variant="dialog"
        size="lg"
      >
        {previewCustomer && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Company Profile */}
            {previewCustomer.metadata?.companyProfile && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Company Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Company Name:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {previewCustomer.metadata.companyProfile.companyName || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Legal Entity:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {previewCustomer.metadata.companyProfile.legalEntityName || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">State:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {previewCustomer.metadata.companyProfile.corporateState || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Country:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {previewCustomer.metadata.companyProfile.corporateCountry || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Profile */}
            {previewCustomer.metadata?.customerProfile && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Customer Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Customer Name:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {previewCustomer.metadata.customerProfile.customerName || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Segment:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {previewCustomer.metadata.customerProfile.segment || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {previewCustomer.metadata.customerProfile.contactNumber || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {previewCustomer.metadata.customerProfile.emailId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Terms */}
            {previewCustomer.metadata?.paymentTerms && previewCustomer.metadata.paymentTerms.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  Payment Terms ({previewCustomer.metadata.paymentTerms.length})
                </h3>
                <div className="space-y-2 text-sm">
                  {previewCustomer.metadata.paymentTerms.map((term, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded">
                      <div className="font-medium text-gray-900">{term.paymentTermName || 'Payment Term ' + (idx + 1)}</div>
                      <div className="text-gray-600">Credit Period: {term.creditPeriod || 'N/A'} days</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Profiles */}
            {previewCustomer.metadata?.teamProfiles && previewCustomer.metadata.teamProfiles.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-600" />
                  Team Members ({previewCustomer.metadata.teamProfiles.length})
                </h3>
                <div className="space-y-2 text-sm">
                  {previewCustomer.metadata.teamProfiles.map((member, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded">
                      <div className="font-medium text-gray-900">{member.teamMemberName || 'Team Member ' + (idx + 1)}</div>
                      <div className="text-gray-600">Role: {member.role || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setPreviewCustomer(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <Link
                to={`/customers/new?id=${previewCustomer.id || previewCustomer._id}`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </div>
          </div>
        )}
      </Modal>

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
                    Are you sure you want to delete this master data entry?
                  </h3>
                  <p className="text-sm text-secondary-700 mb-2">
                    <strong>{deletingCustomer.companyName || deletingCustomer.company_name || deletingCustomer.id || 'N/A'}</strong> will be permanently deleted.
                  </p>
                  <p className="text-xs text-secondary-500">
                    This action cannot be undone and will remove the master data from your records.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}

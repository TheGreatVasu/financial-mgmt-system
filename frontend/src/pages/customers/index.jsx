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
  const customerProfile = metadata.customerProfile || {}
  const email = entry.email || entry.contact_email || customerProfile.emailId || 'N/A'
  const phone = entry.phone || entry.contact_phone || customerProfile.contactNumber || 'N/A'
  const segment = customerProfile.segment || entry.segment || 'Segment not set'
  const gstNumber = customerProfile.gstNumber || entry.gst_number || 'GST not set'
  const legalEntity = entry.legal_entity_name || customerProfile.legalEntityName || 'N/A'

  return (
    <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-secondary-500">Company Name</p>
          <p className="text-lg font-semibold text-secondary-900">{companyName}</p>
          <p className="text-sm text-secondary-600">{legalEntity}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-secondary-500">Created</p>
          <p className="text-sm font-medium text-secondary-800">
            {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-IN') : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-secondary-700">
          <Mail className="h-4 w-4 text-secondary-400" />
          <span className="truncate">{email !== 'N/A' ? email : 'Email not set'}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary-700">
          <Phone className="h-4 w-4 text-secondary-400" />
          <span>{phone !== 'N/A' ? phone : 'Phone not set'}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary-700">
          <FileText className="h-4 w-4 text-secondary-400" />
          <span>{segment}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary-700">
          <FileText className="h-4 w-4 text-secondary-400" />
          <span className="truncate">{gstNumber}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
        <div className="text-xs text-secondary-500">Last updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '—'}</div>
        <div className="flex items-center gap-2">
          <Link
            to={`/customers/new?id=${entry.id || entry._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-100 hover:border-primary-300 transition-colors"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onPreview?.(entry)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(entry)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-1.5 text-sm font-semibold text-danger-600 hover:bg-danger-100 hover:border-danger-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
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
      console.log('Customers API response:', response)
      const rows = response?.data || []
      console.log('Loaded customers:', rows.length, rows)
      setCustomers(rows)
      
      if (rows.length === 0) {
        console.warn('No customers found. This could mean:')
        console.warn('1. No customers have been created yet')
        console.warn('2. Customers exist but created_by field is NULL')
        console.warn('3. Customers exist but belong to a different user')
      }
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
                onClick={loadCustomers}
                className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
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

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                className="w-full rounded-lg border border-secondary-200 bg-white pl-10 pr-3 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Search by name, company, email, or phone..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-danger-700 text-sm">
            {error}
          </div>
        )}

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

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-secondary-200 bg-white p-8 text-center space-y-3 shadow-sm">
            <FileText className="h-10 w-10 text-secondary-400 mx-auto" />
            <p className="text-lg font-semibold text-secondary-900">No master data found</p>
            <p className="text-sm text-secondary-600">Create your first master data entry to get started.</p>
            <div className="flex items-center justify-center gap-2">
              <Link
                to="/customers/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Master Data
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((entry) => (
              <Card
                key={entry._id || entry.id}
                entry={entry}
                onDelete={() => setDeletingCustomer(entry)}
                onPreview={() => setPreviewCustomer(entry)}
              />
            ))}
          </div>
        )}
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
                <div
                  key={c.id || c._id}
                  className="rounded-2xl border border-secondary-200 bg-white shadow-sm p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-secondary-500">Company Name</p>
                      <p className="text-lg font-semibold text-secondary-900">{companyName}</p>
                      <p className="text-sm text-secondary-600">{masterProfile.legal_entity_name || customerProfile?.legalEntityName || companyProfile?.legalEntityName || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary-500">Created</p>
                      <p className="text-sm font-medium text-secondary-800">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {email !== 'N/A' && (
                      <div className="flex items-center gap-2 text-secondary-700">
                        <Mail className="h-4 w-4 text-secondary-400" />
                        <span className="truncate">{email}</span>
                      </div>
                    )}
                    {phone !== 'N/A' && (
                      <div className="flex items-center gap-2 text-secondary-700">
                        <Phone className="h-4 w-4 text-secondary-400" />
                        <span>{phone}</span>
                      </div>
                    )}
                    {customerProfile?.gstNumber && (
                      <div className="flex items-center gap-2 text-secondary-700">
                        <FileText className="h-4 w-4 text-secondary-400" />
                        <span className="truncate">{customerProfile.gstNumber}</span>
                      </div>
                    )}
                    {customerProfile?.segment && (
                      <div className="flex items-center gap-2 text-secondary-700">
                        <FileText className="h-4 w-4 text-secondary-400" />
                        <span>{customerProfile.segment}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
                    <div className="text-xs text-secondary-500">
                      Last updated: {c.updatedAt ? new Date(c.updatedAt).toLocaleString('en-IN') : '—'}
                    </div>
                    <div className="flex items-center gap-2">
                    <Link
                        to={`/customers/new?id=${c.id || c._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-100 hover:border-primary-300 transition-colors"
                    >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => setPreviewCustomer(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </button>
                      <button
                        type="button"
                      onClick={() => setDeletingCustomer(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-1.5 text-sm font-semibold text-danger-600 hover:bg-danger-100 hover:border-danger-300 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                    </div>
                  </div>
                </div>
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
    </DashboardLayout>
  )
}

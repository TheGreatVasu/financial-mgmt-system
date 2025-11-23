import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Save, X, Building2, Mail, Phone, FileText, DollarSign } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthContext()
  const svc = useMemo(() => createCustomerService(token), [token])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState(null)
  const [form, setForm] = useState({ name: '', companyName: '', email: '', phone: '', gstNumber: '' })

  useEffect(() => {
    if (token && id) {
      loadCustomer()
    }
  }, [id, token, svc])

  async function loadCustomer() {
    if (!token || !id) return
    setLoading(true)
    setError('')
    try {
      const res = await svc.get(id)
      const c = res?.data || res
      setCustomer(c)
      setForm({
        name: c?.name || '',
        companyName: c?.company_name || c?.companyName || '',
        email: c?.email || '',
        phone: c?.phone || '',
        gstNumber: c?.gst_number || c?.gstNumber || '',
      })
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load customer'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function onSave(e) {
    e.preventDefault()
    setError('')
    if (!form.companyName?.trim()) {
      setError('Company name is required')
      toast.error('Company name is required')
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: form.name || null,
        companyName: form.companyName || null,
        email: form.email || null,
        phone: form.phone || null,
        gstNumber: form.gstNumber || null,
      }
      const res = await svc.update(id, payload)
      const c = res?.data || res
      setCustomer(c)
      toast.success('Customer updated successfully!')
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update customer'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-danger-800">Customer not found</p>
              <p className="text-sm text-danger-700 mt-0.5">The customer you're looking for doesn't exist or has been deleted.</p>
            </div>
          </div>
          <Link
            to="/customers"
            className="btn btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/customers"
            className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">
              {form.companyName || customer.company_name || customer.companyName || 'Customer'}
            </h1>
            <p className="text-sm text-secondary-600 mt-1.5">Customer ID: {id}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">Customer Information</h2>
              </div>
              <div className="card-content">
                <form onSubmit={onSave} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Company Name <span className="text-danger-500">*</span>
                      </label>
                      <input
                        className="input"
                        value={form.companyName}
                        onChange={on('companyName')}
                        required
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Contact Person
                      </label>
                      <input
                        className="input"
                        value={form.name}
                        onChange={on('name')}
                        placeholder="Enter contact person name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                        <input
                          className="input pl-10"
                          type="email"
                          value={form.email}
                          onChange={on('email')}
                          placeholder="customer@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                        <input
                          className="input pl-10"
                          type="tel"
                          value={form.phone}
                          onChange={on('phone')}
                          placeholder="+91 99999 99999"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                        GST Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                        <input
                          className="input pl-10"
                          value={form.gstNumber}
                          onChange={on('gstNumber')}
                          placeholder="GSTIN number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200">
                    <Link
                      to="/customers"
                      className="btn btn-outline"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-primary inline-flex items-center gap-2"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar - Stats and Info */}
          <div className="space-y-6">
            {/* Outstanding Balance */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-secondary-900">Outstanding Balance</h3>
              </div>
              <div className="card-content">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary-100 p-3">
                    <DollarSign className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">
                      ₹{(customer?.outstanding || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-xs text-secondary-500 mt-0.5">Total outstanding</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-secondary-900">Quick Information</h3>
              </div>
              <div className="card-content space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-secondary-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-secondary-500">Company</p>
                    <p className="text-sm font-medium text-secondary-900">
                      {customer?.company_name || customer?.companyName || 'N/A'}
                    </p>
                  </div>
                </div>
                {customer?.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-secondary-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-secondary-500">Email</p>
                      <p className="text-sm font-medium text-secondary-900">{customer.email}</p>
                    </div>
                  </div>
                )}
                {customer?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-secondary-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-secondary-500">Phone</p>
                      <p className="text-sm font-medium text-secondary-900">{customer.phone}</p>
                    </div>
                  </div>
                )}
                {customer?.gst_number || customer?.gstNumber ? (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-secondary-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-secondary-500">GST Number</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {customer.gst_number || customer.gstNumber}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Section - Placeholder for future */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-secondary-900">Related Invoices</h2>
          </div>
          <div className="card-content">
            <div className="text-sm text-secondary-500 text-center py-8">
              Invoice history will be displayed here
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

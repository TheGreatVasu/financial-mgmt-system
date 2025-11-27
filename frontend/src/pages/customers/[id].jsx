import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Save, X, Building2, Mail, Phone, FileText, DollarSign, MapPin, Users, CreditCard, Plus, Trash2, Edit, Eye } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const MASTER_ROLES = [
  'Sales Manager',
  'Sales Head',
  'Business Head',
  'Collection Person Incharge',
  'Sales Agent',
  'Collection Agent'
]

const emptyContact = () => ({
  name: '',
  contactNumber: '',
  email: '',
  department: '',
  designation: '',
  jobRole: '',
  segment: ''
})

const emptyAddress = (label) => ({
  label,
  addressLine: '',
  city: '',
  state: '',
  pinCode: '',
  gstNumber: '',
  contactNumber: ''
})

const defaultPaymentTerm = () => ({
  title: '',
  type: 'Milestone Based',
  description: '',
  creditDays: 0,
  notes: '',
  applicableFor: ''
})

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthContext()
  const svc = useMemo(() => createCustomerService(token), [token])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Form state matching the creation form
  const [companyProfile, setCompanyProfile] = useState({
    companyName: '',
    legalEntityName: '',
    corporateOffice: emptyAddress('Corporate Office'),
    marketingOffice: emptyAddress('Marketing Office'),
    correspondenceAddress: '',
    gstNumbers: [''],
    siteOffices: [emptyAddress('Site Office 1')],
    plantAddresses: [emptyAddress('Plant Address 1')],
    primaryContact: emptyContact()
  })

  const [customerProfile, setCustomerProfile] = useState({
    department: '',
    designation: '',
    jobRole: '',
    segment: '',
    contactPersonName: '',
    contactPersonNumber: '',
    emailId: ''
  })

  const [paymentTerms, setPaymentTerms] = useState([defaultPaymentTerm()])
  const [teamProfiles, setTeamProfiles] = useState(
    MASTER_ROLES.map((role) => ({ role, ...emptyContact() }))
  )

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
      
      // Populate form from customer data
      const metadata = c.metadata || {}
      const cp = metadata.companyProfile || {}
      const custp = metadata.customerProfile || {}
      
      // Company Profile
      setCompanyProfile({
        companyName: c.company_name || c.companyName || cp.companyName || '',
        legalEntityName: c.masterProfile?.legal_entity_name || cp.legalEntityName || '',
        corporateOffice: {
          label: 'Corporate Office',
          addressLine: c.masterProfile?.corporate_office || cp.corporateOffice?.addressLine || '',
          city: cp.corporateOffice?.city || '',
          state: cp.corporateOffice?.state || '',
          pinCode: cp.corporateOffice?.pinCode || '',
          gstNumber: cp.corporateOffice?.gstNumber || '',
          contactNumber: cp.corporateOffice?.contactNumber || ''
        },
        marketingOffice: {
          label: 'Marketing Office',
          addressLine: c.masterProfile?.marketing_office || cp.marketingOffice?.addressLine || '',
          city: cp.marketingOffice?.city || '',
          state: cp.marketingOffice?.state || '',
          pinCode: cp.marketingOffice?.pinCode || '',
          gstNumber: cp.marketingOffice?.gstNumber || '',
          contactNumber: cp.marketingOffice?.contactNumber || ''
        },
        correspondenceAddress: c.masterProfile?.correspondence_address || cp.correspondenceAddress || '',
        gstNumbers: c.masterProfile?.gst_numbers ? (Array.isArray(c.masterProfile.gst_numbers) ? c.masterProfile.gst_numbers : JSON.parse(c.masterProfile.gst_numbers)) : (cp.gstNumbers || ['']),
        siteOffices: (c.siteOffices || []).length > 0 
          ? c.siteOffices.map((so, i) => ({
              label: so.label || `Site Office ${i + 1}`,
              addressLine: so.address_line || '',
              city: '',
              state: '',
              pinCode: '',
              gstNumber: so.gst_number || '',
              contactNumber: so.contact_number || ''
            }))
          : (cp.siteOffices || [emptyAddress('Site Office 1')]),
        plantAddresses: (c.plantAddresses || []).length > 0
          ? c.plantAddresses.map((pa, i) => ({
              label: pa.label || `Plant Address ${i + 1}`,
              addressLine: pa.address_line || '',
              city: '',
              state: '',
              pinCode: '',
              gstNumber: pa.gst_number || '',
              contactNumber: pa.contact_number || ''
            }))
          : (cp.plantAddresses || [emptyAddress('Plant Address 1')]),
        primaryContact: cp.primaryContact || emptyContact()
      })

      // Customer Profile
      setCustomerProfile({
        department: custp.department || '',
        designation: custp.designation || '',
        jobRole: custp.jobRole || '',
        segment: custp.segment || c.segment || '',
        contactPersonName: custp.contactPersonName || c.name || '',
        contactPersonNumber: custp.contactPersonNumber || c.phone || '',
        emailId: custp.emailId || c.email || ''
      })

      // Payment Terms
      setPaymentTerms(
        (metadata.paymentTerms || c.paymentTerms || []).length > 0
          ? metadata.paymentTerms || c.paymentTerms
          : [defaultPaymentTerm()]
      )

      // Team Profiles
      const teamData = metadata.teamProfiles || []
      if (teamData.length > 0) {
        setTeamProfiles(
          MASTER_ROLES.map(role => {
            const existing = teamData.find(t => t.role === role)
            return existing ? { role, ...existing } : { role, ...emptyContact() }
          })
        )
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load customer'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  function updateCompany(field, value) {
    setCompanyProfile((prev) => ({ ...prev, [field]: value }))
  }

  function updateNestedAddress(listKey, index, field, value) {
    setCompanyProfile((prev) => {
      const nextList = prev[listKey].map((item, i) => (i === index ? { ...item, [field]: value } : item))
      return { ...prev, [listKey]: nextList }
    })
  }

  function addAddress(listKey, labelPrefix) {
    setCompanyProfile((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], emptyAddress(`${labelPrefix} ${prev[listKey].length + 1}`)]
    }))
  }

  function removeAddress(listKey, index) {
    setCompanyProfile((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index)
    }))
  }

  function updateGst(index, value) {
    setCompanyProfile((prev) => {
      const next = [...prev.gstNumbers]
      next[index] = value
      return { ...prev, gstNumbers: next }
    })
  }

  function addGstField() {
    setCompanyProfile((prev) => ({ ...prev, gstNumbers: [...prev.gstNumbers, ''] }))
  }

  function updatePaymentTerm(index, field, value) {
    setPaymentTerms((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addPaymentTerm() {
    setPaymentTerms((prev) => [...prev, defaultPaymentTerm()])
  }

  function removePaymentTerm(index) {
    setPaymentTerms((prev) => prev.filter((_, i) => i !== index))
  }

  function updateTeamProfile(index, field, value) {
    setTeamProfiles((prev) => prev.map((member, i) => (i === index ? { ...member, [field]: value } : member)))
  }

  async function onSave(e) {
    e?.preventDefault()
    setError('')
    if (!companyProfile.companyName?.trim() && !companyProfile.legalEntityName?.trim()) {
      setError('Company / legal entity name is required')
      toast.error('Company / legal entity name is required')
      return
    }
    try {
      setSaving(true)
      const payload = {
        companyName: companyProfile.companyName || companyProfile.legalEntityName || null,
        name: customerProfile.contactPersonName || companyProfile.primaryContact.name || null,
        email: customerProfile.emailId || companyProfile.primaryContact.email || null,
        phone: customerProfile.contactPersonNumber || companyProfile.primaryContact.contactNumber || null,
        gstNumber:
          companyProfile.gstNumbers.find((gst) => gst?.trim()) ||
          companyProfile.corporateOffice.gstNumber ||
          null,
        metadata: {
          companyProfile,
          customerProfile,
          paymentTerms,
          teamProfiles
        }
      }
      const res = await svc.update(id, payload)
      const c = res?.data || res
      setCustomer(c)
      setIsEditing(false)
      toast.success('Master data updated successfully!')
      await loadCustomer() // Reload to get fresh data
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update master data'
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
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-5 py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Master data not found</p>
              <p className="text-sm text-red-700 mt-0.5">The record you're looking for doesn't exist or has been deleted.</p>
            </div>
          </div>
          <Link
            to="/customers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Master Data
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const companyName = customer.company_name || customer.companyName || 'Unnamed Company'

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/customers"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {companyName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Master Data ID: {id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    loadCustomer() // Reset form
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
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
              </>
            )}
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-5 py-4 flex items-start gap-3"
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

        {isEditing ? (
          // Edit Mode - Full Form
          <form onSubmit={onSave} className="space-y-6">
            {/* Company Profile */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-bold text-gray-900">Company Profile</h2>
                <p className="text-sm text-gray-600 mt-1">Legal entity details, offices, GST numbers, and corporate contacts</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
                    <input
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={companyProfile.companyName}
                      onChange={(e) => updateCompany('companyName', e.target.value)}
                      placeholder="Company trading name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Legal Entity Name *</label>
                    <input
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={companyProfile.legalEntityName}
                      onChange={(e) => updateCompany('legalEntityName', e.target.value)}
                      placeholder="Registered legal entity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Corporate Office Address</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[90px]"
                      value={companyProfile.corporateOffice.addressLine}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({
                          ...prev,
                          corporateOffice: { ...prev.corporateOffice, addressLine: e.target.value }
                        }))
                      }
                      placeholder="Full address, GST No, contact numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Marketing Office</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[90px]"
                      value={companyProfile.marketingOffice.addressLine}
                      onChange={(e) =>
                        setCompanyProfile((prev) => ({
                          ...prev,
                          marketingOffice: { ...prev.marketingOffice, addressLine: e.target.value }
                        }))
                      }
                      placeholder="Address and contact details"
                    />
                  </div>
                </div>

                {/* Site Offices */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Site Offices & GST</label>
                  <div className="space-y-4">
                    {companyProfile.siteOffices.map((site, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">{site.label}</span>
                          {companyProfile.siteOffices.length > 1 && (
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-700 text-xs"
                              onClick={() => removeAddress('siteOffices', index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <textarea
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                          value={site.addressLine}
                          onChange={(e) => updateNestedAddress('siteOffices', index, 'addressLine', e.target.value)}
                          placeholder="Address with GST"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="GST Number"
                            value={site.gstNumber}
                            onChange={(e) => updateNestedAddress('siteOffices', index, 'gstNumber', e.target.value)}
                          />
                          <input
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Contact Number"
                            value={site.contactNumber || ''}
                            onChange={(e) => updateNestedAddress('siteOffices', index, 'contactNumber', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => addAddress('siteOffices', 'Site Office')}
                    >
                      <Plus className="h-4 w-4" />
                      Add Site Office
                    </button>
                  </div>
                </div>

                {/* Plant Addresses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Plant Addresses</label>
                  <div className="space-y-4">
                    {companyProfile.plantAddresses.map((plant, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">{plant.label}</span>
                          {companyProfile.plantAddresses.length > 1 && (
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-700 text-xs"
                              onClick={() => removeAddress('plantAddresses', index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <textarea
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                          value={plant.addressLine}
                          onChange={(e) => updateNestedAddress('plantAddresses', index, 'addressLine', e.target.value)}
                          placeholder="Address and GST"
                        />
                        <input
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="GST Number"
                          value={plant.gstNumber}
                          onChange={(e) => updateNestedAddress('plantAddresses', index, 'gstNumber', e.target.value)}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => addAddress('plantAddresses', 'Plant Address')}
                    >
                      <Plus className="h-4 w-4" />
                      Add Plant Address
                    </button>
                  </div>
                </div>

                {/* GST Numbers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">GST Numbers</label>
                  <div className="grid gap-3">
                    {companyProfile.gstNumbers.map((gst, index) => (
                      <input
                        key={index}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`GST No ${index + 1}`}
                        value={gst}
                        onChange={(e) => updateGst(index, e.target.value)}
                      />
                    ))}
                    <button type="button" className="w-fit px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm" onClick={addGstField}>
                      Add GST No
                    </button>
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Contact Person</label>
                    <input
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      placeholder="Name"
                      value={companyProfile.primaryContact.name}
                      onChange={(e) =>
                        updateCompany('primaryContact', {
                          ...companyProfile.primaryContact,
                          name: e.target.value
                        })
                      }
                    />
                    <input
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      placeholder="Contact Number"
                      value={companyProfile.primaryContact.contactNumber}
                      onChange={(e) =>
                        updateCompany('primaryContact', {
                          ...companyProfile.primaryContact,
                          contactNumber: e.target.value
                        })
                      }
                    />
                    <input
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email ID"
                      value={companyProfile.primaryContact.email}
                      onChange={(e) =>
                        updateCompany('primaryContact', {
                          ...companyProfile.primaryContact,
                          email: e.target.value
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correspondence Address</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                      value={companyProfile.correspondenceAddress}
                      onChange={(e) => updateCompany('correspondenceAddress', e.target.value)}
                      placeholder="Postal address for official communication"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Profile */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-bold text-gray-900">Customer Profile</h2>
                <p className="text-sm text-gray-600 mt-1">Department, designation, job roles, and communication preferences</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person Name</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customerProfile.contactPersonName}
                    onChange={(e) =>
                      setCustomerProfile((prev) => ({ ...prev, contactPersonName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customerProfile.contactPersonNumber}
                    onChange={(e) =>
                      setCustomerProfile((prev) => ({ ...prev, contactPersonNumber: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email ID</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="email"
                    value={customerProfile.emailId}
                    onChange={(e) =>
                      setCustomerProfile((prev) => ({ ...prev, emailId: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customerProfile.department}
                    onChange={(e) =>
                      setCustomerProfile((prev) => ({ ...prev, department: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customerProfile.designation}
                    onChange={(e) =>
                      setCustomerProfile((prev) => ({ ...prev, designation: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Role</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customerProfile.jobRole}
                    onChange={(e) =>
                      setCustomerProfile((prev) => ({ ...prev, jobRole: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Segment</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={customerProfile.segment}
                    onChange={(e) =>
                      setCustomerProfile((prev) => ({ ...prev, segment: e.target.value }))
                    }
                  />
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Terms</h2>
                  <p className="text-sm text-gray-600 mt-1">Define standard and customer-specific payment term templates</p>
                </div>
                <button type="button" className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm" onClick={addPaymentTerm}>
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Term
                </button>
              </div>
              <div className="p-6 space-y-4">
                {paymentTerms.map((term, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">Payment Term {index + 1}</span>
                      {paymentTerms.length > 1 && (
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700 text-xs inline-flex items-center gap-1"
                          onClick={() => removePaymentTerm(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Term Title (e.g., Advance 10%)"
                        value={term.title}
                        onChange={(e) => updatePaymentTerm(index, 'title', e.target.value)}
                      />
                      <select
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={term.type}
                        onChange={(e) => updatePaymentTerm(index, 'type', e.target.value)}
                      >
                        <option>Milestone Based</option>
                        <option>Percentage Based</option>
                        <option>Credit Days</option>
                        <option>Retention</option>
                        <option>Custom</option>
                      </select>
                      <input
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type="number"
                        min={0}
                        placeholder="Credit Days"
                        value={term.creditDays}
                        onChange={(e) => updatePaymentTerm(index, 'creditDays', Number(e.target.value))}
                      />
                      <input
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Applicable Segment / Dept."
                        value={term.applicableFor || ''}
                        onChange={(e) => updatePaymentTerm(index, 'applicableFor', e.target.value)}
                      />
                    </div>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
                      placeholder="Notes / description / milestones"
                      value={term.description}
                      onChange={(e) => updatePaymentTerm(index, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Team Profiles */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-bold text-gray-900">Sales / Collection Master Profiles</h2>
                <p className="text-sm text-gray-600 mt-1">Capture profiles for Sales Manager, Business Head, Agents, and Collection teams</p>
              </div>
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {teamProfiles.map((member, index) => (
                  <div key={member.role} className="rounded-lg border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">{member.role}</span>
                    </div>
                    <input
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full Name"
                      value={member.name}
                      onChange={(e) => updateTeamProfile(index, 'name', e.target.value)}
                    />
                    <input
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contact Number"
                      value={member.contactNumber}
                      onChange={(e) => updateTeamProfile(index, 'contactNumber', e.target.value)}
                    />
                    <input
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email ID"
                      value={member.email}
                      onChange={(e) => updateTeamProfile(index, 'email', e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Department"
                        value={member.department}
                        onChange={(e) => updateTeamProfile(index, 'department', e.target.value)}
                      />
                      <input
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Designation / Job Role"
                        value={member.designation}
                        onChange={(e) => updateTeamProfile(index, 'designation', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </form>
        ) : (
          // View Mode - Display All Data
          <div className="space-y-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-6 w-6" />
                  <p className="text-sm font-medium text-blue-100">Company</p>
                </div>
                <p className="text-xl font-bold">{companyName}</p>
                {customer.masterProfile?.legal_entity_name && (
                  <p className="text-sm text-blue-100 mt-1">{customer.masterProfile.legal_entity_name}</p>
                )}
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/25">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-6 w-6" />
                  <p className="text-sm font-medium text-green-100">Contact</p>
                </div>
                <p className="text-xl font-bold">{customer.email || customer.contact_email || 'N/A'}</p>
                <p className="text-sm text-green-100 mt-1">{customer.phone || customer.contact_phone || 'N/A'}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/25">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-6 w-6" />
                  <p className="text-sm font-medium text-purple-100">GST</p>
                </div>
                <p className="text-xl font-bold">{customer.gst_number || 'N/A'}</p>
              </div>
            </div>

            {/* Company Profile View */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-bold text-gray-900">Company Profile</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Company Name</p>
                    <p className="text-sm font-semibold text-gray-900">{companyProfile.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Legal Entity Name</p>
                    <p className="text-sm font-semibold text-gray-900">{companyProfile.legalEntityName || 'N/A'}</p>
                  </div>
                  {companyProfile.corporateOffice.addressLine && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Corporate Office</p>
                      <p className="text-sm text-gray-900">{companyProfile.corporateOffice.addressLine}</p>
                    </div>
                  )}
                  {companyProfile.marketingOffice.addressLine && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Marketing Office</p>
                      <p className="text-sm text-gray-900">{companyProfile.marketingOffice.addressLine}</p>
                    </div>
                  )}
                </div>

                {/* Site Offices */}
                {companyProfile.siteOffices.filter(so => so.addressLine).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Site Offices</p>
                    <div className="space-y-2">
                      {companyProfile.siteOffices.filter(so => so.addressLine).map((site, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900 mb-1">{site.label}</p>
                          <p className="text-sm text-gray-700">{site.addressLine}</p>
                          {site.gstNumber && <p className="text-xs text-gray-600 mt-1">GST: {site.gstNumber}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Terms */}
                {paymentTerms.filter(pt => pt.title).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Payment Terms</p>
                    <div className="space-y-2">
                      {paymentTerms.filter(pt => pt.title).map((term, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{term.title}</p>
                          <p className="text-xs text-gray-600 mt-1">Type: {term.type} | Credit Days: {term.creditDays || 0}</p>
                          {term.description && <p className="text-sm text-gray-700 mt-2">{term.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Profiles */}
                {teamProfiles.filter(tp => tp.name).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Team Profiles</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamProfiles.filter(tp => tp.name).map((member, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{member.role}</p>
                          <p className="text-sm text-gray-700">{member.name}</p>
                          {member.email && <p className="text-xs text-gray-600 mt-1">{member.email}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

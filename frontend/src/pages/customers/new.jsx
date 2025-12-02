import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import ErrorBoundary from '../../components/ui/ErrorBoundary.jsx'

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
  gstNumber: ''
})

const defaultPaymentTerm = () => ({
  title: '',
  type: 'Milestone Based',
  description: '',
  creditDays: 0,
  notes: ''
})

const STEPS = [
  {
    label: 'Company Profile',
    required: true,
  },
  {
    label: 'Customer Profile',
    required: true,
  },
  {
    label: 'Payment Terms',
    required: false,
  },
  {
    label: 'Team Profiles',
    required: false,
  },
  {
    label: 'Additional Step',
    required: false,
  },
]

export default function CustomerNew() {
  const { token } = useAuthContext()
  const svc = useMemo(() => createCustomerService(token), [token])
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(0)

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

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [createdRecordId, setCreatedRecordId] = useState(null)

  function validateEmail(email) {
    // Accept only company domain or gmail.com
    return /@([a-zA-Z0-9-]+\.)?(financialmgmt\.com|gmail\.com)$/.test(email)
  }

  function validatePhone(phone) {
    // Allow only digits, optional + at start
    return /^\+?\d{7,15}$/.test(phone || '')
  }

  function validateAllSteps() {
    try {
      // Step 1: Company Profile
      if (companyProfile?.primaryContact?.email && !validateEmail(companyProfile.primaryContact.email)) {
        setError('Primary contact email must be a valid @financialmgmt.com or @gmail.com address')
        return false
      }
      if (companyProfile?.primaryContact?.contactNumber && !validatePhone(companyProfile.primaryContact.contactNumber)) {
        setError('Primary contact number must contain only digits and be 7-15 digits long')
        return false
      }
      for (const site of (companyProfile?.siteOffices || [])) {
        if (site?.contactNumber && !validatePhone(site.contactNumber)) {
          setError('Site office contact number must contain only digits and be 7-15 digits long')
          return false
        }
      }
      // Step 2: Customer Profile
      if (customerProfile?.emailId && !validateEmail(customerProfile.emailId)) {
        setError('Customer email must be a valid @financialmgmt.com or @gmail.com address')
        return false
      }
      if (customerProfile?.contactPersonNumber && !validatePhone(customerProfile.contactPersonNumber)) {
        setError('Customer contact number must contain only digits and be 7-15 digits long')
        return false
      }
      // Step 4: Team Profiles
      for (const member of (teamProfiles || [])) {
        if (member?.email && !validateEmail(member.email)) {
          setError('Team member email must be a valid @financialmgmt.com or @gmail.com address')
          return false
        }
        if (member?.contactNumber && !validatePhone(member.contactNumber)) {
          setError('Team member contact number must contain only digits and be 7-15 digits long')
          return false
        }
      }
      setError('')
      return true
    } catch (err) {
      console.error('Validation error:', err)
      setError('Validation error occurred. Please check your input.')
      return false
    }
  }

  const canGoNext = useCallback(() => {
    try {
      if (currentStep === 0) {
        // Company Profile required fields - don't call validateAllSteps here to avoid infinite loops
        if (!companyProfile?.companyName?.trim() && !companyProfile?.legalEntityName?.trim()) {
          return false
        }
        return true
      }
      if (currentStep === 1) {
        // Customer Profile required fields
        if (!customerProfile?.contactPersonName?.trim() || 
            !customerProfile?.contactPersonNumber?.trim() || 
            !customerProfile?.emailId?.trim()) {
          return false
        }
        return true
      }
      if (currentStep === 3) {
        // Team Profiles step - skip validation during render
        return true
      }
      return true
    } catch (err) {
      console.error('Error in canGoNext:', err)
      return false
    }
  }, [currentStep, companyProfile, customerProfile])

  function goToStep(idx) {
    if (idx < currentStep) {
      setCurrentStep(idx)
    } else {
      // Only allow forward if current step is valid
      if (canGoNext()) {
        setCurrentStep(idx)
      }
    }
  }

  const updateCompany = useCallback((field, value) => {
    try {
      setCompanyProfile((prev) => {
        if (!prev) {
          console.warn('Company profile state is null, initializing...')
          return {
            companyName: '',
            legalEntityName: '',
            corporateOffice: emptyAddress('Corporate Office'),
            marketingOffice: emptyAddress('Marketing Office'),
            correspondenceAddress: '',
            gstNumbers: [''],
            siteOffices: [emptyAddress('Site Office 1')],
            plantAddresses: [emptyAddress('Plant Address 1')],
            primaryContact: emptyContact(),
            [field]: value
          }
        }
        return { ...prev, [field]: value }
      })
    } catch (err) {
      console.error('Error updating company field:', field, err)
      // Don't throw - just log the error to prevent blank page
    }
  }, [])

  function updateNestedAddress(listKey, index, field, value) {
    try {
      setCompanyProfile((prev) => {
        if (!prev[listKey] || !Array.isArray(prev[listKey])) {
          console.warn(`List key ${listKey} is not an array, initializing...`)
          return { ...prev, [listKey]: [emptyAddress(`${listKey} 1`)] }
        }
        const nextList = prev[listKey].map((item, i) => (i === index ? { ...item, [field]: value } : item))
        return { ...prev, [listKey]: nextList }
      })
    } catch (err) {
      console.error('Error updating nested address:', err)
    }
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

  function onNext(e) {
    e?.preventDefault()
    if (canGoNext()) setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function onPrev(e) {
    e?.preventDefault()
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!companyProfile.companyName?.trim() && !companyProfile.legalEntityName?.trim()) {
      setError('Company / legal entity name is required')
      return
    }
    if (!customerProfile.contactPersonName?.trim() || !customerProfile.contactPersonNumber?.trim() || !customerProfile.emailId?.trim()) {
      setError('Please fill all required customer profile fields')
      return
    }
    if (!validateAllSteps()) {
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
      const res = await svc.create(payload)
      const created = res?.data
      const recordId = created?.id ?? created?._id ?? ''
      setCreatedRecordId(recordId)
      setShowSuccessPopup(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create master record')
    } finally {
      setSaving(false)
    }
  }

  function handleDone() {
    setShowSuccessPopup(false)
    navigate(`/customers/${createdRecordId}`)
  }

  // Prevent blank page crashes by catching errors early
  useEffect(() => {
    const errorHandler = (event) => {
      console.error('Global error caught:', event.error)
      // Prevent blank page by logging error but not crashing
      event.preventDefault()
      return true
    }
    
    const unhandledRejectionHandler = (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      event.preventDefault()
    }
    
    window.addEventListener('error', errorHandler)
    window.addEventListener('unhandledrejection', unhandledRejectionHandler)
    
    return () => {
      window.removeEventListener('error', errorHandler)
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
    }
  }, [])

  // Ensure state is always initialized
  useEffect(() => {
    if (!companyProfile) {
      setCompanyProfile({
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
    }
  }, [])

  return (
    <ErrorBoundary>
      <DashboardLayout>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Creation of Master Data</h1>
        <p className="text-sm text-secondary-600">Stepwise onboarding for company, customer, payment, and team details.</p>
      </div>
      {/* Stepper */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((step, idx) => {
          const isCurrentStep = idx === currentStep
          const isPastStep = idx < currentStep
          const canNavigate = isPastStep || (isCurrentStep && canGoNext())
          
          return (
            <button
              key={step.label}
              type="button"
              onClick={() => goToStep(idx)}
              className={`flex flex-col items-center px-2 focus:outline-none ${isCurrentStep ? 'text-primary-700 font-bold' : 'text-gray-400'} ${canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              disabled={idx > currentStep && !canGoNext()}
            >
              <span className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${idx <= currentStep ? 'border-primary-600 bg-primary-50' : 'border-gray-300 bg-white'}`}>{idx + 1}</span>
              <span className="text-xs mt-1">{step.label}</span>
            </button>
          )
        })}
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>
        )}
        {/* Step 1: Company Profile */}
        {currentStep === 0 && (
  <section className="card">
    <div className="card-header">
      <h2 className="text-lg font-semibold text-secondary-900">Creation of Company Profile</h2>
    </div>
    <div className="card-content space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Company Name *</label>
          <input
            className="input"
            type="text"
            value={companyProfile?.companyName || ''}
            onChange={(e) => {
              try {
                const value = e.target.value
                updateCompany('companyName', value)
                // Clear error when user starts typing
                if (value?.trim() || companyProfile?.legalEntityName?.trim()) {
                  setError('')
                }
              } catch (err) {
                console.error('Error updating company name:', err)
              }
            }}
            onBlur={(e) => {
              // Validate on blur, not on every keystroke
              if (!e.target.value?.trim() && !companyProfile?.legalEntityName?.trim()) {
                setError('Company Name or Legal Entity Name is required')
              }
            }}
            placeholder="Company trading name"
          />
        </div>
        <div>
          <label className="form-label">Legal Entity Name *</label>
          <input
            className="input"
            type="text"
            value={companyProfile?.legalEntityName || ''}
            onChange={(e) => {
              try {
                const value = e.target.value
                updateCompany('legalEntityName', value)
                // Clear error when user starts typing
                if (value?.trim() || companyProfile?.companyName?.trim()) {
                  setError('')
                }
              } catch (err) {
                console.error('Error updating legal entity name:', err)
              }
            }}
            onBlur={(e) => {
              // Validate on blur, not on every keystroke
              if (!e.target.value?.trim() && !companyProfile?.companyName?.trim()) {
                setError('Company Name or Legal Entity Name is required')
              }
            }}
            placeholder="Registered legal entity"
          />
        </div>
        <div>
          <label className="form-label">Corporate Office Address</label>
          <textarea
            className="input min-h-[90px]"
            value={companyProfile.corporateOffice?.addressLine || ''}
            onChange={e => {
              try {
                setCompanyProfile(prev => ({
                  ...prev,
                  corporateOffice: { ...(prev.corporateOffice || emptyAddress('Corporate Office')), addressLine: e.target.value }
                }))
              } catch (err) {
                console.error('Error updating corporate office:', err)
              }
            }}
            placeholder="Full address, GST No, contact numbers"
          />
        </div>
        <div>
          <label className="form-label">Marketing Office</label>
          <textarea
            className="input min-h-[90px]"
            value={companyProfile.marketingOffice?.addressLine || ''}
            onChange={e => {
              try {
                setCompanyProfile(prev => ({
                  ...prev,
                  marketingOffice: { ...(prev.marketingOffice || emptyAddress('Marketing Office')), addressLine: e.target.value }
                }))
              } catch (err) {
                console.error('Error updating marketing office:', err)
              }
            }}
            placeholder="Address and contact details"
          />
        </div>
      </div>
      <div>
        <label className="form-label">Site Offices & GST</label>
        <div className="space-y-4">
          {(companyProfile.siteOffices || []).map((site, index) => (
            <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-800">{site.label}</span>
                {companyProfile.siteOffices.length > 1 && (
                  <button
                    type="button"
                    className="text-danger-600 hover:text-danger-700 text-xs"
                    onClick={() => removeAddress('siteOffices', index)}
                  >Remove</button>
                )}
              </div>
              <textarea
                className="input min-h-[80px]"
                value={site?.addressLine || ''}
                onChange={e => updateNestedAddress('siteOffices', index, 'addressLine', e.target.value)}
                placeholder="Address with GST"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="GST Number"
                  value={site?.gstNumber || ''}
                  onChange={e => updateNestedAddress('siteOffices', index, 'gstNumber', e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Contact Number"
                  value={site?.contactNumber || ''}
                  onChange={e => updateNestedAddress('siteOffices', index, 'contactNumber', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm inline-flex items-center gap-2"
            onClick={() => addAddress('siteOffices', 'Site Office')}
          >
            <Plus className="h-4 w-4" /> Add Site Office
          </button>
        </div>
      </div>
      <div>
        <label className="form-label">Plant Addresses</label>
        <div className="space-y-4">
          {(companyProfile.plantAddresses || []).map((plant, index) => (
            <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-800">{plant.label}</span>
                {companyProfile.plantAddresses.length > 1 && (
                  <button
                    type="button"
                    className="text-danger-600 hover:text-danger-700 text-xs"
                    onClick={() => removeAddress('plantAddresses', index)}
                  >Remove</button>
                )}
              </div>
              <textarea
                className="input min-h-[80px]"
                value={plant?.addressLine || ''}
                onChange={e => updateNestedAddress('plantAddresses', index, 'addressLine', e.target.value)}
                placeholder="Address and GST"
              />
              <input
                className="input"
                placeholder="GST Number"
                value={plant?.gstNumber || ''}
                onChange={e => updateNestedAddress('plantAddresses', index, 'gstNumber', e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm inline-flex items-center gap-2"
            onClick={() => addAddress('plantAddresses', 'Plant Address')}
          >
            <Plus className="h-4 w-4" /> Add Plant Address
          </button>
        </div>
      </div>
      <div>
        <label className="form-label">GST Numbers</label>
        <div className="grid gap-3">
          {(companyProfile.gstNumbers || []).map((gst, index) => (
            <input
              key={index}
              className="input"
              placeholder={`GST No ${index + 1}`}
              value={gst}
              onChange={e => updateGst(index, e.target.value)}
            />
          ))}
          <button type="button" className="btn btn-outline btn-sm w-fit" onClick={addGstField}>Add GST No</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Primary Contact Person</label>
          <input
            className="input mb-2"
            placeholder="Name"
            value={companyProfile.primaryContact?.name || ''}
            onChange={e => {
              try {
                updateCompany('primaryContact', {
                  ...(companyProfile.primaryContact || emptyContact()),
                  name: e.target.value
                })
              } catch (err) {
                console.error('Error updating primary contact name:', err)
              }
            }}
          />
          <input
            className="input mb-2"
            placeholder="Contact Number"
            value={companyProfile.primaryContact?.contactNumber || ''}
            onChange={e => {
              try {
                updateCompany('primaryContact', {
                  ...(companyProfile.primaryContact || emptyContact()),
                  contactNumber: e.target.value
                })
              } catch (err) {
                console.error('Error updating primary contact number:', err)
              }
            }}
          />
          <input
            className="input"
            placeholder="Email ID"
            value={companyProfile.primaryContact?.email || ''}
            onChange={e => {
              try {
                updateCompany('primaryContact', {
                  ...(companyProfile.primaryContact || emptyContact()),
                  email: e.target.value
                })
              } catch (err) {
                console.error('Error updating primary contact email:', err)
              }
            }}
          />
        </div>
        <div>
          <label className="form-label">Correspondence Address</label>
          <textarea
            className="input min-h-[120px]"
            value={companyProfile.correspondenceAddress}
            onChange={e => updateCompany('correspondenceAddress', e.target.value)}
            placeholder="Postal address for official communication"
          />
        </div>
      </div>
    </div>
  </section>
)}
        {/* Step 2: Customer Profile */}
        {currentStep === 1 && (
  <section className="card">
    <div className="card-header">
      <h2 className="text-lg font-semibold text-secondary-900">Creation of Customer Profile</h2>
    </div>
    <div className="card-content space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Contact Person Name *</label>
          <input
            className="input"
            value={customerProfile.contactPersonName}
            onChange={e => setCustomerProfile({ ...customerProfile, contactPersonName: e.target.value })}
            placeholder="Enter contact person name"
          />
        </div>
        <div>
          <label className="form-label">Contact Person Number *</label>
          <input
            className="input"
            value={customerProfile.contactPersonNumber}
            onChange={e => setCustomerProfile({ ...customerProfile, contactPersonNumber: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="form-label">Email ID *</label>
          <input
            className="input"
            type="email"
            value={customerProfile.emailId}
            onChange={e => setCustomerProfile({ ...customerProfile, emailId: e.target.value })}
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="form-label">Department</label>
          <input
            className="input"
            value={customerProfile.department}
            onChange={e => setCustomerProfile({ ...customerProfile, department: e.target.value })}
            placeholder="Enter department"
          />
        </div>
        <div>
          <label className="form-label">Designation</label>
          <input
            className="input"
            value={customerProfile.designation}
            onChange={e => setCustomerProfile({ ...customerProfile, designation: e.target.value })}
            placeholder="Enter designation"
          />
        </div>
        <div>
          <label className="form-label">Job Role</label>
          <input
            className="input"
            value={customerProfile.jobRole}
            onChange={e => setCustomerProfile({ ...customerProfile, jobRole: e.target.value })}
            placeholder="Enter job role"
          />
        </div>
        <div>
          <label className="form-label">Segment</label>
          <input
            className="input"
            value={customerProfile.segment}
            onChange={e => setCustomerProfile({ ...customerProfile, segment: e.target.value })}
            placeholder="Enter segment"
          />
        </div>
      </div>
    </div>
  </section>
)}
        {/* Step 3: Payment Terms */}
        {currentStep === 2 && (
          <section className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Creation of Payment Terms</h2>
            </div>
            <div className="card-content space-y-4">
              {paymentTerms.map((term, index) => (
                <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary-800">Payment Term {index + 1}</span>
                    {paymentTerms.length > 1 && (
                      <button
                        type="button"
                        className="text-danger-600 hover:text-danger-700 text-xs"
                        onClick={() => removePaymentTerm(index)}
                      >Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Payment Term Title</label>
                      <input
                        className="input"
                        value={term.title}
                        onChange={e => updatePaymentTerm(index, 'title', e.target.value)}
                        placeholder="e.g., Advance 50%, Balance at Delivery"
                      />
                    </div>
                    <div>
                      <label className="form-label">Payment Type</label>
                      <select
                        className="input"
                        value={term.type}
                        onChange={e => updatePaymentTerm(index, 'type', e.target.value)}
                      >
                        <option value="Milestone Based">Milestone Based</option>
                        <option value="Time Based">Time Based</option>
                        <option value="Fixed">Fixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Credit Days</label>
                      <input
                        className="input"
                        type="number"
                        value={term.creditDays}
                        onChange={e => updatePaymentTerm(index, 'creditDays', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <input
                        className="input"
                        value={term.description}
                        onChange={e => updatePaymentTerm(index, 'description', e.target.value)}
                        placeholder="Payment description"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Notes</label>
                    <textarea
                      className="input min-h-[80px]"
                      value={term.notes}
                      onChange={e => updatePaymentTerm(index, 'notes', e.target.value)}
                      placeholder="Additional notes for this payment term"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm inline-flex items-center gap-2"
                onClick={addPaymentTerm}
              >
                <Plus className="h-4 w-4" /> Add Payment Term
              </button>
            </div>
          </section>
        )}
        {/* Step 4: Team Profiles */}
        {currentStep === 3 && (
          <section className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Sales / Collection Master Profiles</h2>
            </div>
            <div className="card-content space-y-4">
              {teamProfiles.map((member, index) => (
                <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary-800">Profile: {member.role}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Name</label>
                      <input
                        className="input"
                        value={member.name}
                        onChange={e => updateTeamProfile(index, 'name', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Contact Number</label>
                      <input
                        className="input"
                        value={member.contactNumber}
                        onChange={e => updateTeamProfile(index, 'contactNumber', e.target.value)}
                        placeholder="10-digit phone number"
                      />
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <input
                        className="input"
                        type="email"
                        value={member.email}
                        onChange={e => updateTeamProfile(index, 'email', e.target.value)}
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <label className="form-label">Department</label>
                      <input
                        className="input"
                        value={member.department}
                        onChange={e => updateTeamProfile(index, 'department', e.target.value)}
                        placeholder="Department"
                      />
                    </div>
                    <div>
                      <label className="form-label">Designation</label>
                      <input
                        className="input"
                        value={member.designation}
                        onChange={e => updateTeamProfile(index, 'designation', e.target.value)}
                        placeholder="Designation"
                      />
                    </div>
                    <div>
                      <label className="form-label">Job Role</label>
                      <input
                        className="input"
                        value={member.jobRole}
                        onChange={e => updateTeamProfile(index, 'jobRole', e.target.value)}
                        placeholder="Job role"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Step 5: Additional Step */}
        {currentStep === 4 && (
          <section className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Additional Configuration</h2>
            </div>
            <div className="card-content space-y-4">
              <div className="rounded-lg border border-secondary-200 p-6 bg-secondary-50">
                <p className="text-sm text-secondary-600 mb-4">
                  Review and confirm all master data entries above. Once submitted, this configuration will be saved to your system.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">✓</span>
                    <span className="text-secondary-700">Company Profile configured</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">✓</span>
                    <span className="text-secondary-700">Customer Profile configured</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">✓</span>
                    <span className="text-secondary-700">Payment Terms configured</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">✓</span>
                    <span className="text-secondary-700">Team Profiles configured</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-secondary-200 mt-8">
  <button
    type="button"
    className="btn btn-outline px-8 py-3 text-base font-semibold rounded-full shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    onClick={onPrev}
    disabled={currentStep === 0}
    style={{ minWidth: 120 }}
  >
    Previous
  </button>
  {currentStep < STEPS.length - 1 ? (
    <button
      type="button"
      className="btn btn-primary px-10 py-3 text-base font-bold rounded-full shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      onClick={onNext}
      disabled={!canGoNext()}
      style={{ minWidth: 120 }}
    >
      Next
    </button>
  ) : (
    <button
      type="submit"
      className="btn btn-success px-10 py-3 text-base font-bold rounded-full shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={saving || !canGoNext()}
      style={{ minWidth: 120 }}
    >
      {saving ? 'Saving...' : 'Submit'}
    </button>
  )}
</div>
      </form>
      
      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Master Data Created Successfully! ✨
            </h3>
            <p className="text-center text-gray-600 text-sm mb-6">
              All your company, customer, payment terms, and team profile details have been saved successfully.
            </p>

            {/* Details Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Company Name:</span>
                <span className="font-semibold text-gray-900">{companyProfile.companyName || companyProfile.legalEntityName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Contact Person:</span>
                <span className="font-semibold text-gray-900">{customerProfile.contactPersonName || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold text-gray-900 truncate">{customerProfile.emailId || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-600">Record ID:</span>
                <span className="font-mono text-blue-600 font-semibold">{createdRecordId}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccessPopup(false)
                  setCurrentStep(0)
                  setCompanyProfile({
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
                  setCustomerProfile({
                    department: '',
                    designation: '',
                    jobRole: '',
                    segment: '',
                    contactPersonName: '',
                    contactPersonNumber: '',
                    emailId: ''
                  })
                  setPaymentTerms([defaultPaymentTerm()])
                  setTeamProfiles(MASTER_ROLES.map((role) => ({ role, ...emptyContact() })))
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Create Another
              </button>
              <button
                onClick={handleDone}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      </DashboardLayout>
    </ErrorBoundary>
  )
}


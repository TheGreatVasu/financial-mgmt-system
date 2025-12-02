import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'

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

  function canGoNext() {
    if (currentStep === 0) {
      // Company Profile required fields
      return (
        !!companyProfile.companyName?.trim() || !!companyProfile.legalEntityName?.trim()
      )
    }
    if (currentStep === 1) {
      // Customer Profile required fields
      return !!customerProfile.contactPersonName?.trim() && !!customerProfile.contactPersonNumber?.trim() && !!customerProfile.emailId?.trim()
    }
    // Add more validations for other steps if needed
    return true
  }

  function goToStep(idx) {
    if (idx < currentStep) {
      setCurrentStep(idx)
    } else {
      // Only allow forward if all previous are valid
      let valid = true
      for (let i = 0; i < idx; ++i) {
        setCurrentStep(i)
        if (!canGoNext()) {
          valid = false
          break
        }
      }
      if (valid && canGoNext()) setCurrentStep(idx)
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
    if (customerProfile.emailId && !/^\S+@\S+\.\S+$/.test(customerProfile.emailId)) {
      setError('Please enter a valid email for customer profile')
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
      navigate(`/customers/${created?.id ?? created?._id ?? ''}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create master record')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Creation of Master Data</h1>
        <p className="text-sm text-secondary-600">Stepwise onboarding for company, customer, payment, and team details.</p>
      </div>
      {/* Stepper */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((step, idx) => (
          <button
            key={step.label}
            type="button"
            onClick={() => goToStep(idx)}
            className={`flex flex-col items-center px-2 focus:outline-none ${idx === currentStep ? 'text-primary-700 font-bold' : 'text-gray-400'} ${canGoNext() || idx < currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            disabled={idx > currentStep && !canGoNext()}
          >
            <span className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${idx <= currentStep ? 'border-primary-600 bg-primary-50' : 'border-gray-300 bg-white'}`}>{idx + 1}</span>
            <span className="text-xs mt-1">{step.label}</span>
          </button>
        ))}
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
            value={companyProfile.companyName}
            onChange={e => updateCompany('companyName', e.target.value)}
            placeholder="Company trading name"
          />
        </div>
        <div>
          <label className="form-label">Legal Entity Name *</label>
          <input
            className="input"
            value={companyProfile.legalEntityName}
            onChange={e => updateCompany('legalEntityName', e.target.value)}
            placeholder="Registered legal entity"
          />
        </div>
        <div>
          <label className="form-label">Corporate Office Address</label>
          <textarea
            className="input min-h-[90px]"
            value={companyProfile.corporateOffice.addressLine}
            onChange={e => setCompanyProfile(prev => ({
              ...prev,
              corporateOffice: { ...prev.corporateOffice, addressLine: e.target.value }
            }))}
            placeholder="Full address, GST No, contact numbers"
          />
        </div>
        <div>
          <label className="form-label">Marketing Office</label>
          <textarea
            className="input min-h-[90px]"
            value={companyProfile.marketingOffice.addressLine}
            onChange={e => setCompanyProfile(prev => ({
              ...prev,
              marketingOffice: { ...prev.marketingOffice, addressLine: e.target.value }
            }))}
            placeholder="Address and contact details"
          />
        </div>
      </div>
      <div>
        <label className="form-label">Site Offices & GST</label>
        <div className="space-y-4">
          {companyProfile.siteOffices.map((site, index) => (
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
                value={site.addressLine}
                onChange={e => updateNestedAddress('siteOffices', index, 'addressLine', e.target.value)}
                placeholder="Address with GST"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="GST Number"
                  value={site.gstNumber}
                  onChange={e => updateNestedAddress('siteOffices', index, 'gstNumber', e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Contact Number"
                  value={site.contactNumber || ''}
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
          {companyProfile.plantAddresses.map((plant, index) => (
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
                value={plant.addressLine}
                onChange={e => updateNestedAddress('plantAddresses', index, 'addressLine', e.target.value)}
                placeholder="Address and GST"
              />
              <input
                className="input"
                placeholder="GST Number"
                value={plant.gstNumber}
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
          {companyProfile.gstNumbers.map((gst, index) => (
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
            value={companyProfile.primaryContact.name}
            onChange={e => updateCompany('primaryContact', {
              ...companyProfile.primaryContact,
              name: e.target.value
            })}
          />
          <input
            className="input mb-2"
            placeholder="Contact Number"
            value={companyProfile.primaryContact.contactNumber}
            onChange={e => updateCompany('primaryContact', {
              ...companyProfile.primaryContact,
              contactNumber: e.target.value
            })}
          />
          <input
            className="input"
            placeholder="Email ID"
            value={companyProfile.primaryContact.email}
            onChange={e => updateCompany('primaryContact', {
              ...companyProfile.primaryContact,
              email: e.target.value
            })}
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
  <CustomerProfileForm
    defaultValues={customerProfile}
    onPrevious={onPrev}
    onNext={(data) => {
      setCustomerProfile(data);
      onNext();
    }}
    loading={saving}
  />
)}
        {/* Step 3: Payment Terms */}
        {currentStep === 2 && (
          <section className="card">
            <div className="card-header flex items-center justify-between"><h2 className="text-lg font-semibold text-secondary-900">Creation of Payment Terms</h2></div>
            <div className="card-content space-y-4">{/* ...same as before... */}
              {/* ...copy Payment Terms JSX here... */}
            </div>
          </section>
        )}
        {/* Step 4: Team Profiles */}
        {currentStep === 3 && (
          <section className="card">
            <div className="card-header"><h2 className="text-lg font-semibold text-secondary-900">Sales / Collection Master Profiles</h2></div>
            <div className="card-content grid grid-cols-1 lg:grid-cols-2 gap-4">{/* ...same as before... */}
              {/* ...copy Team Profiles JSX here... */}
            </div>
          </section>
        )}
        {/* Step 5: Additional Step */}
        {currentStep === 4 && (
          <section className="card">
            <div className="card-header"><h2 className="text-lg font-semibold text-secondary-900">Additional Step</h2></div>
            <div className="card-content">
              {/* Add your custom fields here */}
              <div className="mb-4">Example additional box/step for future expansion.</div>
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
    </DashboardLayout>
  )
}


import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import MasterDataForm from './MasterDataForm'
import SmartDropdown from '../../components/ui/SmartDropdown.jsx'
import SelectWithOther from '../../components/ui/SelectWithOther.jsx'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import ErrorBoundary from '../../components/ui/ErrorBoundary.jsx'

const DEV_BYPASS_VALIDATION = true

const MASTER_ROLES = [
  'Sales Manager',
  'Sales Head',
  'Business Head',
  'Collection Incharge',
  'Sales Agent',
  'Collection Agent',
  'Project Manager',
  'Project Head'
]

const emptyContact = () => ({
  photo: '',
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

const emptyConsignee = () => ({
  logo: '',
  consigneeName: '',
  consigneeAddress: '',
  customerName: '',
  legalEntityName: '',
  city: '',
  state: '',
  gstNumber: '',
  contactPersonName: '',
  designation: '',
  contactNumber: '',
  emailId: ''
})

const emptyPayer = () => ({
  logo: '',
  payerName: '',
  payerAddress: '',
  customerName: '',
  legalEntityName: '',
  city: '',
  state: '',
  gstNumber: '',
  contactPersonName: '',
  designation: '',
  contactNumber: '',
  emailId: ''
})

const defaultPaymentTerm = () => ({
  basic: '',
  freight: '',
  taxes: '',
  due1: '',
  due2: '',
  due3: '',
  finalDue: '',
  description: ''
})

const STEPS = [
  { label: 'Company Profile', required: true },
  { label: 'Customer Profile', required: true },
  { label: 'Consignee Profile', required: true },
  { label: 'Payer Profile', required: true },
  { label: 'Employee Profile', required: false },
  { label: 'Payment Terms', required: true },
  { label: 'Review & Submit', required: false }
]

export default function CustomerNew() {
  const { token } = useAuthContext()
  const svc = useMemo(() => createCustomerService(token), [token])
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(0)

  const [logoPreview, setLogoPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [companyProfile, setCompanyProfile] = useState({
    logo: null,
    companyName: '',
    legalEntityName: '',
    corporateAddress: '',
    corporateDistrict: '',
    corporateState: '',
    corporateCountry: '',
    corporatePinCode: '',
    correspondenceAddress: '',
    correspondenceDistrict: '',
    correspondenceState: '',
    correspondenceCountry: '',
    correspondencePinCode: '',
    otherOfficeType: 'Plant Address',
    otherOfficeAddress: '',
    otherOfficeGst: '',
    otherOfficeDistrict: '',
    otherOfficeState: '',
    otherOfficeCountry: '',
    otherOfficePinCode: '',
    otherOfficeContactName: '',
    otherOfficeContactNumber: '',
    otherOfficeEmail: '',
    primaryContact: emptyContact()
  })

  const [customerProfile, setCustomerProfile] = useState({
    logo: '',
    customerName: '',
    legalEntityName: '',
    corporateOfficeAddress: '',
    correspondenceAddress: '',
    district: '',
    state: '',
    country: '',
    pinCode: '',
    segment: '',
    gstNumber: '',
    poIssuingAuthority: '',
    designation: '',
    contactNumber: '',
    emailId: ''
  })

  const [consigneeProfiles, setConsigneeProfiles] = useState([emptyConsignee()])
  const [payerProfiles, setPayerProfiles] = useState([emptyPayer()])

  const [masterData, setMasterData] = useState({
    companyProfile: {},
    customerProfile: {},
    paymentTerms: [defaultPaymentTerm()],
    teamProfiles: [{ role: MASTER_ROLES[0], ...emptyContact() }],
    additionalData: {}
  })

  const [paymentTerms, setPaymentTerms] = useState([defaultPaymentTerm()])
  const [teamProfiles, setTeamProfiles] = useState([{ role: MASTER_ROLES[0], ...emptyContact() }])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [createdRecordId, setCreatedRecordId] = useState(null)

  const progressPercent = Math.round(
    (currentStep / Math.max(1, STEPS.length - 1)) * 100
  )

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
      if (customerProfile?.contactNumber && !validatePhone(customerProfile.contactNumber)) {
        setError('Customer contact number must contain only digits and be 7-15 digits long')
        return false
      }

      for (const consignee of consigneeProfiles || []) {
        if (consignee?.emailId && !validateEmail(consignee.emailId)) {
          setError('Consignee email must be a valid @financialmgmt.com or @gmail.com address')
          return false
        }
        if (consignee?.contactNumber && !validatePhone(consignee.contactNumber)) {
          setError('Consignee contact number must contain only digits and be 7-15 digits long')
          return false
        }
      }

      for (const payer of payerProfiles || []) {
        if (payer?.emailId && !validateEmail(payer.emailId)) {
          setError('Payer email must be a valid @financialmgmt.com or @gmail.com address')
          return false
        }
        if (payer?.contactNumber && !validatePhone(payer.contactNumber)) {
          setError('Payer contact number must contain only digits and be 7-15 digits long')
          return false
        }
      }
      // Step 4: Employee Profile
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
    if (DEV_BYPASS_VALIDATION) return true

    // Payment Terms step validation can be added here if needed

    try {
      if (currentStep === 0) {
        // Company Profile required fields - basic gating
        const requiredFields = [
          'companyName',
          'legalEntityName',
          'corporateAddress',
          'corporateDistrict',
          'corporateState',
          'corporateCountry',
          'corporatePinCode',
          'correspondenceAddress',
          'correspondenceDistrict',
          'correspondenceState',
          'correspondenceCountry',
          'correspondencePinCode'
        ]
        const missing = requiredFields.some((key) => !companyProfile?.[key]?.trim())
        return !missing
      }
      if (currentStep === 1) {
        // Customer Profile required fields
        const requiredFields = [
          'customerName',
          'legalEntityName',
          'corporateOfficeAddress',
          'correspondenceAddress',
          'district',
          'state',
          'country',
          'pinCode',
          'segment',
          'gstNumber',
          'poIssuingAuthority',
          'designation',
          'contactNumber',
          'emailId'
        ]
        const missing = requiredFields.some((key) => !customerProfile?.[key]?.trim())
        if (missing) return false
        return true
      }
      if (currentStep === 2) {
        // Consignee Profile required fields (check first entry)
        const target = consigneeProfiles?.[0] || emptyConsignee()
        const requiredFields = [
          'consigneeName',
          'consigneeAddress',
          'customerName',
          'legalEntityName',
          'city',
          'state',
          'gstNumber',
          'contactPersonName',
          'designation',
          'contactNumber',
          'emailId'
        ]
        const missing = requiredFields.some((key) => !target?.[key]?.trim())
        if (missing) return false
        return true
      }
      if (currentStep === 3) {
        // Payer Profile required fields (check first entry)
        const target = payerProfiles?.[0] || emptyPayer()
        const requiredFields = [
          'payerName',
          'payerAddress',
          'customerName',
          'legalEntityName',
          'city',
          'state',
          'gstNumber',
          'contactPersonName',
          'designation',
          'contactNumber',
          'emailId'
        ]
        const missing = requiredFields.some((key) => !target?.[key]?.trim())
        if (missing) return false
        return true
      }
      if (currentStep === 4) {
        // Employee Profile step - skip validation during render
        return true
      }
      if (currentStep === 5) {
        // Payment Terms step - basic validation
        const target = paymentTerms?.[0] || defaultPaymentTerm()
        // Add validation if needed
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
      if (DEV_BYPASS_VALIDATION || canGoNext()) {
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
          logo: null,
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

    // Handle logo preview
    if (field === 'logo' && value instanceof File) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(value)
    } else if (field === 'logo' && !value) {
      setLogoPreview(null)
    }
  } catch (err) {
    console.error('Error updating company profile:', err)
  }
}, [])

function updatePaymentTerm(index, field, value) {
  setPaymentTerms((prev) =>
    prev.map((item, i) =>
      i === index
        ? {
            ...item,
            [field]: value,
            primaryContact: emptyContact()
          }
        : item
    )
  )
}

  function addPaymentTerm() {
    setPaymentTerms((prev) => [...prev, defaultPaymentTerm()])
  }

  function removePaymentTerm(index) {
    setPaymentTerms((prev) => prev.filter((_, i) => i !== index))
  }

  function updateConsignee(index, field, value) {
    setConsigneeProfiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  function addConsignee() {
    setConsigneeProfiles((prev) => [...prev, emptyConsignee()])
  }

  function updatePayer(index, field, value) {
    setPayerProfiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  function addPayer() {
    setPayerProfiles((prev) => [...prev, emptyPayer()])
  }

  function updateTeamProfile(index, field, value) {
    setTeamProfiles((prev) => prev.map((member, i) => (i === index ? { ...member, [field]: value } : member)))
  }

  function addTeamProfile() {
    setTeamProfiles((prev) => [...prev, { role: MASTER_ROLES[0], ...emptyContact() }])
  }

  function removeTeamProfile(index) {
    setTeamProfiles((prev) => prev.filter((_, i) => i !== index))
  }

  function onNext(e) {
    e?.preventDefault()
    if (DEV_BYPASS_VALIDATION || canGoNext()) setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function onPrev(e) {
    e?.preventDefault()
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  // Load saved data from localStorage on component mount
  const loadSavedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem('customerFormData')
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
      localStorage.removeItem('customerFormData')
    }
    return null
  }, [])

async function onSubmit(e) {
  e.preventDefault();
  setError("");

  try {
    // Basic validation
    if (!companyProfile.companyName?.trim() && !companyProfile.legalEntityName?.trim()) {
      setError("Company / legal entity name is required");
      return;
    }

    // Required company fields
    const requiredCompany = [
      "corporateAddress",
      "corporateDistrict",
      "corporateState",
      "corporateCountry",
      "corporatePinCode",
      "correspondenceAddress",
      "correspondenceDistrict",
      "correspondenceState",
      "correspondenceCountry",
      "correspondencePinCode",
    ];

    const missingCompany = requiredCompany.some((key) => !companyProfile?.[key]?.trim());
    if (missingCompany) {
      setError("Please fill all required company profile fields");
      return;
    }

    // Required customer fields
    const requiredCustomer = [
      "customerName",
      "legalEntityName",
      "corporateOfficeAddress",
      "correspondenceAddress",
      "district",
      "state",
      "country",
      "pinCode",
      "segment",
      "gstNumber",
      "poIssuingAuthority",
      "designation",
      "contactNumber",
      "emailId",
    ];

    const missingCust = requiredCustomer.some((key) => !customerProfile?.[key]?.trim());
    if (missingCust) {
      setError("Please fill all required customer profile fields");
      return;
    }

    // Consignee validation
    const c = consigneeProfiles[0];
    const requiredConFields = [
      "consigneeName",
      "consigneeAddress",
      "customerName",
      "legalEntityName",
      "city",
      "state",
      "gstNumber",
      "contactPersonName",
      "designation",
      "contactNumber",
      "emailId",
    ];

    const missingCon = requiredConFields.some((key) => !c?.[key]?.trim());
    if (missingCon) {
      setError("Please fill all required consignee profile fields");
      return;
    }

    // Payer validation
    const p = payerProfiles[0];
    const requiredPayerFields = [
      "payerName",
      "payerAddress",
      "customerName",
      "legalEntityName",
      "city",
      "state",
      "gstNumber",
      "contactPersonName",
      "designation",
      "contactNumber",
      "emailId",
    ];

    const missingPay = requiredPayerFields.some((key) => !p?.[key]?.trim());
    if (missingPay) {
      setError("Please fill all required payer profile fields");
      return;
    }

    // FINAL validation
    if (!validateAllSteps()) return;

    // ---- SUBMIT PAYLOAD ----
    setSaving(true);

    const payload = {
      companyProfile,
      customerProfile,
      consigneeProfiles,
      payerProfiles,
      paymentTerms,
      teamProfiles,
    };

    const response = await svc.createCustomer(payload);

    setCreatedRecordId(response?.id || "N/A");
    setShowSuccessPopup(true);

  } catch (err) {
    console.error("Submit error:", err);
    setError("Something went wrong while saving data.");
  } finally {
    setSaving(false);
  }
}

return (
// ...
    <ErrorBoundary>
      <DashboardLayout>
      <div className="mb-8 rounded-2xl border border-secondary-200 bg-gradient-to-r from-primary-50 via-white to-secondary-50 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-secondary-900">Creation of Master Data</h1>
            <p className="text-sm text-secondary-600">Stepwise onboarding for company, customer, payment, and team details.</p>
          </div>
          <div className="text-sm font-medium text-primary-700 bg-white/70 border border-primary-100 rounded-full px-4 py-2 shadow-xs">
            {progressPercent}% complete
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="h-2 w-full rounded-full bg-secondary-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-7">
            {STEPS.map((step, idx) => {
              const isCurrentStep = idx === currentStep
              const isPastStep = idx < currentStep
              const canNavigate = isPastStep || (isCurrentStep && canGoNext())
              return (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => goToStep(idx)}
                  disabled={idx > currentStep && !DEV_BYPASS_VALIDATION && !canGoNext()}
                  className={`group relative flex flex-col rounded-xl border px-3 py-3 text-left shadow-sm transition-all focus:outline-none ${
                    isCurrentStep
                      ? 'border-primary-200 bg-white shadow-primary-100'
                      : isPastStep
                      ? 'border-success-200 bg-success-50 text-secondary-800'
                      : 'border-secondary-200 bg-white text-secondary-500'
                  } ${canNavigate ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                        isCurrentStep
                          ? 'border-primary-500 text-primary-700 bg-primary-50'
                          : isPastStep
                          ? 'border-success-500 text-success-700 bg-success-50'
                          : 'border-secondary-200 text-secondary-500 bg-secondary-50'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${isCurrentStep ? 'text-primary-800' : ''}`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {isCurrentStep ? 'In progress' : isPastStep ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="form-label">Company Logo</label>
            <div className="rounded-lg border border-dashed border-secondary-300 bg-white p-4 text-center space-y-3">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 overflow-hidden">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-700 text-lg font-semibold">
                    {companyProfile.logo instanceof File 
                      ? companyProfile.logo.name.substring(0, 2).toUpperCase()
                      : 'Logo'}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-secondary-800">
                  {logoPreview ? 'Logo uploaded' : 'Upload company logo'}
                </p>
                <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
              </div>
              <label className="btn btn-primary btn-sm cursor-pointer">
                {logoPreview ? 'Change Logo' : 'Choose File'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    updateCompany('logo', file)
                  }}
                />
              </label>
              {companyProfile.logo && (
                <div className="text-xs text-secondary-600 truncate max-w-full">
                  {companyProfile.logo instanceof File ? companyProfile.logo.name : companyProfile.logo}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Company Name *</label>
              <input
                className="input"
                type="text"
                value={companyProfile?.companyName || ''}
                onChange={(e) => {
                  const value = e.target.value
                  updateCompany('companyName', value)
                  if (value?.trim() || companyProfile?.legalEntityName?.trim()) setError('')
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
                  const value = e.target.value
                  updateCompany('legalEntityName', value)
                  if (value?.trim() || companyProfile?.companyName?.trim()) setError('')
                }}
                placeholder="Registered legal entity"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="form-label">Corporate Office Address *</label>
            <textarea
              className="input min-h-[90px]"
              value={companyProfile.corporateAddress}
              onChange={(e) => updateCompany('corporateAddress', e.target.value)}
              placeholder="Full address"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="input"
                placeholder="District *"
                value={companyProfile.corporateDistrict}
                onChange={(e) => updateCompany('corporateDistrict', e.target.value)}
              />
              <input
                className="input"
                placeholder="State *"
                value={companyProfile.corporateState}
                onChange={(e) => updateCompany('corporateState', e.target.value)}
              />
              <input
                className="input"
                placeholder="Country *"
                value={companyProfile.corporateCountry}
                onChange={(e) => updateCompany('corporateCountry', e.target.value)}
              />
              <input
                className="input"
                placeholder="Pin Code *"
                value={companyProfile.corporatePinCode}
                onChange={(e) => updateCompany('corporatePinCode', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="form-label">Correspondence Address *</label>
            <textarea
              className="input min-h-[90px]"
              value={companyProfile.correspondenceAddress}
              onChange={(e) => updateCompany('correspondenceAddress', e.target.value)}
              placeholder="Postal address"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="input"
                placeholder="District *"
                value={companyProfile.correspondenceDistrict}
                onChange={(e) => updateCompany('correspondenceDistrict', e.target.value)}
              />
              <input
                className="input"
                placeholder="State *"
                value={companyProfile.correspondenceState}
                onChange={(e) => updateCompany('correspondenceState', e.target.value)}
              />
              <input
                className="input"
                placeholder="Country *"
                value={companyProfile.correspondenceCountry}
                onChange={(e) => updateCompany('correspondenceCountry', e.target.value)}
              />
              <input
                className="input"
                placeholder="Pin Code *"
                value={companyProfile.correspondencePinCode}
                onChange={(e) => updateCompany('correspondencePinCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="form-label">Other Office / Plant Details</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SelectWithOther
              className="input"
              value={companyProfile.otherOfficeType || ''}
              onChange={(val) => updateCompany('otherOfficeType', val)}
              options={[
                { value: 'Plant Address', label: 'Plant Address' },
                { value: 'Site Office', label: 'Site Office' },
                { value: 'Marketing Office', label: 'Marketing Office' }
              ]}
              placeholder="Select office type"
              otherLabel="Other"
              otherInputPlaceholder="Enter office type"
            />
            <input
              className="input"
              placeholder="GST No"
              value={companyProfile.otherOfficeGst}
              onChange={(e) => updateCompany('otherOfficeGst', e.target.value)}
            />
            <input
              className="input"
              placeholder="Pin Code"
              value={companyProfile.otherOfficePinCode}
              onChange={(e) => updateCompany('otherOfficePinCode', e.target.value)}
            />
          </div>
          <textarea
            className="input min-h-[80px]"
            placeholder="Address"
            value={companyProfile.otherOfficeAddress}
            onChange={(e) => updateCompany('otherOfficeAddress', e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="input"
              placeholder="District"
              value={companyProfile.otherOfficeDistrict}
              onChange={(e) => updateCompany('otherOfficeDistrict', e.target.value)}
            />
            <input
              className="input"
              placeholder="State"
              value={companyProfile.otherOfficeState}
              onChange={(e) => updateCompany('otherOfficeState', e.target.value)}
            />
            <input
              className="input"
              placeholder="Country"
              value={companyProfile.otherOfficeCountry}
              onChange={(e) => updateCompany('otherOfficeCountry', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="input"
              placeholder="Contact Person Name"
              value={companyProfile.otherOfficeContactName}
              onChange={(e) => updateCompany('otherOfficeContactName', e.target.value)}
            />
            <input
              className="input"
              placeholder="Contact Number"
              value={companyProfile.otherOfficeContactNumber}
              onChange={(e) => updateCompany('otherOfficeContactNumber', e.target.value)}
            />
            <input
              className="input"
              placeholder="Email ID"
              value={companyProfile.otherOfficeEmail}
              onChange={(e) => updateCompany('otherOfficeEmail', e.target.value)}
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
                  <label className="form-label">Logo</label>
                  <div className="rounded-lg border border-dashed border-secondary-300 bg-white p-4 text-center space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-secondary-800">Upload customer logo</p>
                      <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
                    </div>
                    <label className="btn btn-outline btn-sm cursor-pointer">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          setCustomerProfile({ ...customerProfile, logo: file?.name || '' })
                        }}
                      />
                    </label>
                    {customerProfile.logo && (
                      <div className="text-xs text-secondary-600 truncate">Selected: {customerProfile.logo}</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label">Customer Name *</label>
                  <input
                    className="input"
                    value={customerProfile.customerName}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, customerName: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="form-label">Legal Entity Name *</label>
                  <input
                    className="input"
                    value={customerProfile.legalEntityName}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, legalEntityName: e.target.value })}
                    placeholder="Enter legal entity name"
                  />
                </div>
                <div>
                  <label className="form-label">Corporate Office Address *</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={customerProfile.corporateOfficeAddress}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, corporateOfficeAddress: e.target.value })}
                    placeholder="Enter corporate office address"
                  />
                </div>
                <div>
                  <label className="form-label">Correspondence Address *</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={customerProfile.correspondenceAddress}
                    onChange={(e) =>
                      setCustomerProfile({ ...customerProfile, correspondenceAddress: e.target.value })
                    }
                    placeholder="Enter correspondence address"
                  />
                </div>
                <div>
                  <label className="form-label">District *</label>
                  <input
                    className="input"
                    value={customerProfile.district}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, district: e.target.value })}
                    placeholder="Enter district"
                  />
                </div>
                <div>
                  <label className="form-label">State *</label>
                  <input
                    className="input"
                    value={customerProfile.state}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, state: e.target.value })}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="form-label">Country *</label>
                  <input
                    className="input"
                    value={customerProfile.country}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, country: e.target.value })}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label className="form-label">Pin Code *</label>
                  <input
                    className="input"
                    value={customerProfile.pinCode}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, pinCode: e.target.value })}
                    placeholder="Enter pin code"
                  />
                </div>
                <div>
                  <label className="form-label">Segment *</label>
                  <SelectWithOther
                    className="input"
                    value={customerProfile.segment || ''}
                    onChange={(val) => setCustomerProfile({ ...customerProfile, segment: val })}
                    options={[
                      { value: 'Domestic', label: 'Domestic' },
                      { value: 'Export', label: 'Export' }
                    ]}
                    placeholder="Select segment"
                    otherLabel="Other"
                    otherInputPlaceholder="Enter segment"
                  />
                </div>
                <div>
                  <label className="form-label">GST No *</label>
                  <input
                    className="input"
                    value={customerProfile.gstNumber}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, gstNumber: e.target.value })}
                    placeholder="Enter GST number"
                  />
                </div>
                <div>
                  <label className="form-label">PO Issuing Authority / Contact Person Name *</label>
                  <input
                    className="input"
                    value={customerProfile.poIssuingAuthority}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, poIssuingAuthority: e.target.value })}
                    placeholder="Enter PO issuing authority / contact name"
                  />
                </div>
                <div>
                  <label className="form-label">Designation *</label>
                  <input
                    className="input"
                    value={customerProfile.designation}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, designation: e.target.value })}
                    placeholder="Enter designation"
                  />
                </div>
                <div>
                  <label className="form-label">Contact Person Contact No *</label>
                  <input
                    className="input"
                    value={customerProfile.contactNumber}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, contactNumber: e.target.value })}
                    placeholder="Enter contact number"
                  />
                </div>
                <div>
                  <label className="form-label">Email ID *</label>
                  <input
                    className="input"
                    value={customerProfile.emailId}
                    onChange={(e) => setCustomerProfile({ ...customerProfile, emailId: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Step 3: Consignee Profile */}
        {currentStep === 2 && (
          <section className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Creation of Consignee Profile</h2>
              <button type="button" className="btn btn-outline btn-sm inline-flex items-center gap-2" onClick={addConsignee}>
                <Plus className="h-4 w-4" /> Add +
              </button>
            </div>
            <div className="card-content space-y-4">
              {consigneeProfiles.map((consignee, index) => (
                <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Logo</label>
                      <div className="rounded-lg border border-dashed border-secondary-300 bg-white p-4 text-center space-y-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-secondary-800">Upload consignee logo</p>
                          <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
                        </div>
                        <label className="btn btn-outline btn-sm cursor-pointer">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              updateConsignee(index, 'logo', file?.name || '')
                            }}
                          />
                        </label>
                        {consignee.logo && (
                          <div className="text-xs text-secondary-600 truncate">Selected: {consignee.logo}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Consignee Name *</label>
                      <input
                        className="input"
                        value={consignee.consigneeName}
                        onChange={(e) => updateConsignee(index, 'consigneeName', e.target.value)}
                        placeholder="Enter consignee name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">Consignee Address *</label>
                      <textarea
                        className="input min-h-[80px]"
                        value={consignee.consigneeAddress}
                        onChange={(e) => updateConsignee(index, 'consigneeAddress', e.target.value)}
                        placeholder="Enter consignee address"
                      />
                    </div>
                    <div>
                      <label className="form-label">Customer Name *</label>
                      <input
                        className="input"
                        value={consignee.customerName}
                        onChange={(e) => updateConsignee(index, 'customerName', e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Legal Entity Name *</label>
                      <input
                        className="input"
                        value={consignee.legalEntityName}
                        onChange={(e) => updateConsignee(index, 'legalEntityName', e.target.value)}
                        placeholder="Enter legal entity name"
                      />
                    </div>
                    <div>
                      <label className="form-label">City *</label>
                      <input
                        className="input"
                        value={consignee.city}
                        onChange={(e) => updateConsignee(index, 'city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="form-label">State *</label>
                      <input
                        className="input"
                        value={consignee.state}
                        onChange={(e) => updateConsignee(index, 'state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <label className="form-label">Consignee GST No *</label>
                      <input
                        className="input"
                        value={consignee.gstNumber}
                        onChange={(e) => updateConsignee(index, 'gstNumber', e.target.value)}
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div>
                      <label className="form-label">Contact Person Name *</label>
                      <input
                        className="input"
                        value={consignee.contactPersonName}
                        onChange={(e) => updateConsignee(index, 'contactPersonName', e.target.value)}
                        placeholder="Enter contact person name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Designation *</label>
                      <input
                        className="input"
                        value={consignee.designation}
                        onChange={(e) => updateConsignee(index, 'designation', e.target.value)}
                        placeholder="Enter designation"
                      />
                    </div>
                    <div>
                      <label className="form-label">Contact Person Contact No *</label>
                      <input
                        className="input"
                        value={consignee.contactNumber}
                        onChange={(e) => updateConsignee(index, 'contactNumber', e.target.value)}
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div>
                      <label className="form-label">Email ID *</label>
                      <input
                        className="input"
                        value={consignee.emailId}
                        onChange={(e) => updateConsignee(index, 'emailId', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Step 4: Payer Profile */}
        {currentStep === 3 && (
          <section className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Creation of Payer Profile</h2>
              <button type="button" className="btn btn-outline btn-sm inline-flex items-center gap-2" onClick={addPayer}>
                <Plus className="h-4 w-4" /> Add +
              </button>
            </div>
            <div className="card-content space-y-4">
              {payerProfiles.map((payer, index) => (
                <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Logo</label>
                      <div className="rounded-lg border border-dashed border-secondary-300 bg-white p-4 text-center space-y-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-secondary-800">Upload payer logo</p>
                          <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
                        </div>
                        <label className="btn btn-outline btn-sm cursor-pointer">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              updatePayer(index, 'logo', file?.name || '')
                            }}
                          />
                        </label>
                        {payer.logo && <div className="text-xs text-secondary-600 truncate">Selected: {payer.logo}</div>}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Payer Name *</label>
                      <input
                        className="input"
                        value={payer.payerName}
                        onChange={(e) => updatePayer(index, 'payerName', e.target.value)}
                        placeholder="Enter payer name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">Payer Address *</label>
                      <textarea
                        className="input min-h-[80px]"
                        value={payer.payerAddress}
                        onChange={(e) => updatePayer(index, 'payerAddress', e.target.value)}
                        placeholder="Enter payer address"
                      />
                    </div>
                    <div>
                      <label className="form-label">Customer Name *</label>
                      <input
                        className="input"
                        value={payer.customerName}
                        onChange={(e) => updatePayer(index, 'customerName', e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Legal Entity Name *</label>
                      <input
                        className="input"
                        value={payer.legalEntityName}
                        onChange={(e) => updatePayer(index, 'legalEntityName', e.target.value)}
                        placeholder="Enter legal entity name"
                      />
                    </div>
                    <div>
                      <label className="form-label">City *</label>
                      <input
                        className="input"
                        value={payer.city}
                        onChange={(e) => updatePayer(index, 'city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="form-label">State *</label>
                      <input
                        className="input"
                        value={payer.state}
                        onChange={(e) => updatePayer(index, 'state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <label className="form-label">Payer GST No *</label>
                      <input
                        className="input"
                        value={payer.gstNumber}
                        onChange={(e) => updatePayer(index, 'gstNumber', e.target.value)}
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div>
                      <label className="form-label">Contact Person Name *</label>
                      <input
                        className="input"
                        value={payer.contactPersonName}
                        onChange={(e) => updatePayer(index, 'contactPersonName', e.target.value)}
                        placeholder="Enter contact person name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Designation *</label>
                      <input
                        className="input"
                        value={payer.designation}
                        onChange={(e) => updatePayer(index, 'designation', e.target.value)}
                        placeholder="Enter designation"
                      />
                    </div>
                    <div>
                      <label className="form-label">Contact Person Contact No *</label>
                      <input
                        className="input"
                        value={payer.contactNumber}
                        onChange={(e) => updatePayer(index, 'contactNumber', e.target.value)}
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div>
                      <label className="form-label">Email ID *</label>
                      <input
                        className="input"
                        value={payer.emailId}
                        onChange={(e) => updatePayer(index, 'emailId', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Step 5: Employee Profile */}
        {currentStep === 4 && (
          <section className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Creation of Employee Profile</h2>
              <button type="button" className="btn btn-outline btn-sm inline-flex items-center gap-2" onClick={addTeamProfile}>
                <Plus className="h-4 w-4" /> Add Employee
              </button>
            </div>
            <div className="card-content space-y-4">
              {teamProfiles.map((member, index) => (
                <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary-800">Employee {index + 1}</span>
                    {teamProfiles.length > 1 && (
                      <button
                        type="button"
                        className="text-danger-600 hover:text-danger-700 text-xs"
                        onClick={() => removeTeamProfile(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Role</label>
                      <SelectWithOther
                        className="input"
                        value={member.role || ''}
                        onChange={(val) => updateTeamProfile(index, 'role', val)}
                        options={MASTER_ROLES.map(role => ({ value: role, label: role }))}
                        placeholder="Select role"
                        otherLabel="Other"
                        otherInputPlaceholder="Enter role"
                      />
                    </div>
                    <div>
                      <label className="form-label">Photo</label>
                      <div className="flex items-center gap-3">
                        <label className="btn btn-outline btn-sm cursor-pointer">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              updateTeamProfile(index, 'photo', file?.name || '')
                            }}
                          />
                        </label>
                        {member.photo && <span className="text-xs text-secondary-600 truncate">{member.photo}</span>}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Name of Employee</label>
                      <input
                        className="input"
                        value={member.name}
                        onChange={(e) => updateTeamProfile(index, 'name', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Designation</label>
                      <input
                        className="input"
                        value={member.designation}
                        onChange={(e) => updateTeamProfile(index, 'designation', e.target.value)}
                        placeholder="Designation"
                      />
                    </div>
                    <div>
                      <label className="form-label">Contact No</label>
                      <input
                        className="input"
                        value={member.contactNumber}
                        onChange={(e) => updateTeamProfile(index, 'contactNumber', e.target.value)}
                        placeholder="Contact number"
                      />
                    </div>
                    <div>
                      <label className="form-label">Email ID</label>
                      <input
                        className="input"
                        type="email"
                        value={member.email}
                        onChange={(e) => updateTeamProfile(index, 'email', e.target.value)}
                        placeholder="Email address"
                      />
                    </div>
                    <div>
                      <label className="form-label">Department</label>
                      <input
                        className="input"
                        value={member.department}
                        onChange={(e) => updateTeamProfile(index, 'department', e.target.value)}
                        placeholder="Department"
                      />
                    </div>
                    <div>
                      <label className="form-label">Job Role</label>
                      <input
                        className="input"
                        value={member.jobRole}
                        onChange={(e) => updateTeamProfile(index, 'jobRole', e.target.value)}
                        placeholder="Job role"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Step 6: Payment Terms */}
        {currentStep === 5 && (
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">Basic</label>
                      <input
                        className="input"
                        value={term.basic}
                        onChange={e => updatePaymentTerm(index, 'basic', e.target.value)}
                        placeholder="Enter basic"
                      />
                    </div>
                    <div>
                      <label className="form-label">Freight</label>
                      <input
                        className="input"
                        value={term.freight}
                        onChange={e => updatePaymentTerm(index, 'freight', e.target.value)}
                        placeholder="Enter freight"
                      />
                    </div>
                    <div>
                      <label className="form-label">Taxes</label>
                      <input
                        className="input"
                        value={term.taxes}
                        onChange={e => updatePaymentTerm(index, 'taxes', e.target.value)}
                        placeholder="Enter taxes"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="form-label">1st Due</label>
                      <input
                        className="input"
                        value={term.due1}
                        onChange={e => updatePaymentTerm(index, 'due1', e.target.value)}
                        placeholder="Enter 1st due"
                      />
                    </div>
                    <div>
                      <label className="form-label">2nd Due</label>
                      <input
                        className="input"
                        value={term.due2}
                        onChange={e => updatePaymentTerm(index, 'due2', e.target.value)}
                        placeholder="Enter 2nd due"
                      />
                    </div>
                    <div>
                      <label className="form-label">3rd Due</label>
                      <input
                        className="input"
                        value={term.due3}
                        onChange={e => updatePaymentTerm(index, 'due3', e.target.value)}
                        placeholder="Enter 3rd due"
                      />
                    </div>
                    <div>
                      <label className="form-label">Final Due</label>
                      <input
                        className="input"
                        value={term.finalDue}
                        onChange={e => updatePaymentTerm(index, 'finalDue', e.target.value)}
                        placeholder="Enter final due"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Payment Terms Description</label>
                    <textarea
                      className="input min-h-[80px]"
                      value={term.description}
                      onChange={e => updatePaymentTerm(index, 'description', e.target.value)}
                      placeholder="Describe the payment terms"
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
        {/* Step 7: Review & Submit */}
        {currentStep === 6 && (
          <section className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900">Review & Submit</h2>
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
                    <span className="text-secondary-700">Consignee Profile configured</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">✓</span>
                    <span className="text-secondary-700">Payer Profile configured</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">✓</span>
                    <span className="text-secondary-700">Employee Profile configured</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">✓</span>
                    <span className="text-secondary-700">Payment Terms configured</span>
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
      disabled={!DEV_BYPASS_VALIDATION && !canGoNext()}
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
        <div
          className="fixed inset-0 flex items-center justify-center z-[12000]"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in relative">
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
                    logo: '',
                    customerName: '',
                    legalEntityName: '',
                    corporateOfficeAddress: '',
                    correspondenceAddress: '',
                    district: '',
                    state: '',
                    country: '',
                    pinCode: '',
                    segment: '',
                    gstNumber: '',
                    poIssuingAuthority: '',
                    designation: '',
                    contactNumber: '',
                    emailId: ''
                  })
                  setConsigneeProfiles([emptyConsignee()])
                  setPayerProfiles([emptyPayer()])
                  setPaymentTerms([defaultPaymentTerm()])
                  setTeamProfiles([{ role: MASTER_ROLES[0], ...emptyContact() }])
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


import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import masterDataService from '../../services/masterDataService'
import MasterDataForm from './MasterDataForm'
import SmartDropdown from '../../components/ui/SmartDropdown.jsx'
import SelectWithOther from '../../components/ui/SelectWithOther.jsx'
import { Loader2, Plus, Save, Trash2, CheckCircle2, XCircle, Building2, Users, FileText, CreditCard, UserCheck } from 'lucide-react'
import ErrorBoundary from '../../components/ui/ErrorBoundary.jsx'
import Modal from '../../components/ui/Modal.jsx'
import toast from 'react-hot-toast'

const DEV_BYPASS_VALIDATION = false
const STORAGE_KEY = 'masterDataFormDraft'

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
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const [currentStep, setCurrentStep] = useState(0)
  const [loadingData, setLoadingData] = useState(!!editId)

  const [logoPreview, setLogoPreview] = useState(null)
  const [customerLogoPreview, setCustomerLogoPreview] = useState(null)
  const [consigneeLogoPreviews, setConsigneeLogoPreviews] = useState({})
  const [payerLogoPreviews, setPayerLogoPreviews] = useState({})
  const [employeePhotoPreviews, setEmployeePhotoPreviews] = useState({})
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [createdRecordId, setCreatedRecordId] = useState(null)
  const [submittedData, setSubmittedData] = useState(null)

  const progressPercent = Math.round(
    (currentStep / Math.max(1, STEPS.length - 1)) * 100
  )

  // Helper function to get field error
  const getFieldError = (fieldPath) => {
    return fieldErrors[fieldPath] || ''
  }

  function validateEmail(email) {
    if (!email || typeof email !== 'string') return false
    // Trim whitespace
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return false
    // Accept only company domain or gmail.com
    // Match @financialmgmt.com or @gmail.com (with optional subdomain)
    return /^[^\s@]+@([a-zA-Z0-9-]+\.)?(financialmgmt\.com|gmail\.com)$/i.test(trimmedEmail)
  }

  function validatePhone(phone) {
    // Allow only digits, optional + at start
    return /^\+?\d{7,15}$/.test(phone || '')
  }

  function validateAllSteps() {
    const errors = {}
    let isValid = true

    try {
      // Step 1: Company Profile
      const requiredCompany = [
        'companyName', 'legalEntityName', 'corporateAddress', 'corporateDistrict',
        'corporateState', 'corporateCountry', 'corporatePinCode', 'correspondenceAddress',
        'correspondenceDistrict', 'correspondenceState', 'correspondenceCountry', 'correspondencePinCode'
      ]
      
      requiredCompany.forEach(field => {
        if (!companyProfile?.[field]?.trim()) {
          errors[`company.${field}`] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`
          isValid = false
        }
      })

      if (companyProfile?.primaryContact?.email && !validateEmail(companyProfile.primaryContact.email)) {
        errors['company.primaryContact.email'] = 'Primary contact email must be a valid @financialmgmt.com or @gmail.com address'
        isValid = false
      }
      if (companyProfile?.primaryContact?.contactNumber && !validatePhone(companyProfile.primaryContact.contactNumber)) {
        errors['company.primaryContact.contactNumber'] = 'Primary contact number must contain only digits and be 7-15 digits long'
        isValid = false
      }

      // Step 2: Customer Profile
      const requiredCustomer = [
        'customerName', 'legalEntityName', 'corporateOfficeAddress', 'correspondenceAddress',
        'district', 'state', 'country', 'pinCode', 'segment', 'gstNumber',
        'poIssuingAuthority', 'designation', 'contactNumber', 'emailId'
      ]
      
      requiredCustomer.forEach(field => {
        if (!customerProfile?.[field]?.trim()) {
          errors[`customer.${field}`] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`
          isValid = false
        }
      })

      if (customerProfile?.emailId && !validateEmail(customerProfile.emailId)) {
        errors['customer.emailId'] = 'Customer email must be a valid @financialmgmt.com or @gmail.com address'
        isValid = false
      }
      if (customerProfile?.contactNumber && !validatePhone(customerProfile.contactNumber)) {
        errors['customer.contactNumber'] = 'Customer contact number must contain only digits and be 7-15 digits long'
        isValid = false
      }

      // Step 3: Consignee Profile
      consigneeProfiles.forEach((consignee, index) => {
        const requiredFields = [
          'consigneeName', 'consigneeAddress', 'customerName', 'legalEntityName',
          'city', 'state', 'gstNumber', 'contactPersonName', 'designation', 'contactNumber', 'emailId'
        ]
        requiredFields.forEach(field => {
          if (!consignee?.[field]?.trim()) {
            errors[`consignee.${index}.${field}`] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`
            isValid = false
          }
        })
        if (consignee?.emailId && !validateEmail(consignee.emailId)) {
          errors[`consignee.${index}.emailId`] = 'Consignee email must be a valid @financialmgmt.com or @gmail.com address'
          isValid = false
        }
        if (consignee?.contactNumber && !validatePhone(consignee.contactNumber)) {
          errors[`consignee.${index}.contactNumber`] = 'Consignee contact number must contain only digits and be 7-15 digits long'
          isValid = false
        }
      })

      // Step 4: Payer Profile
      payerProfiles.forEach((payer, index) => {
        const requiredFields = [
          'payerName', 'payerAddress', 'customerName', 'legalEntityName',
          'city', 'state', 'gstNumber', 'contactPersonName', 'designation', 'contactNumber', 'emailId'
        ]
        requiredFields.forEach(field => {
          if (!payer?.[field]?.trim()) {
            errors[`payer.${index}.${field}`] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`
            isValid = false
          }
        })
        if (payer?.emailId && !validateEmail(payer.emailId)) {
          errors[`payer.${index}.emailId`] = 'Payer email must be a valid @financialmgmt.com or @gmail.com address'
          isValid = false
        }
        if (payer?.contactNumber && !validatePhone(payer.contactNumber)) {
          errors[`payer.${index}.contactNumber`] = 'Payer contact number must contain only digits and be 7-15 digits long'
          isValid = false
        }
      })

      // Step 5: Employee Profile
      teamProfiles.forEach((member, index) => {
        if (member?.email && !validateEmail(member.email)) {
          errors[`team.${index}.email`] = 'Team member email must be a valid @financialmgmt.com or @gmail.com address'
          isValid = false
        }
        if (member?.contactNumber && !validatePhone(member.contactNumber)) {
          errors[`team.${index}.contactNumber`] = 'Team member contact number must contain only digits and be 7-15 digits long'
          isValid = false
        }
      })

      setFieldErrors(errors)
      if (isValid) {
        setError('')
        setFieldErrors({})
      } else {
        // Don't show team member errors in top banner - they'll show on the field
        const nonTeamErrors = Object.values(errors).filter(err => 
          !err.includes('Team member') && !err.includes('team member')
        )
        if (nonTeamErrors.length > 0) {
          setError(nonTeamErrors[0] || 'Please fix the errors below')
        } else {
          setError('') // Clear top error, field errors will show inline
        }
      }
      return isValid
    } catch (err) {
      console.error('Validation error:', err)
      setError('Validation error occurred. Please check your input.')
      return false
    }
  }

  const canGoNext = useMemo(() => {
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
        const missing = requiredFields.some((key) => {
          const value = companyProfile?.[key]
          // Check if value is missing or empty string
          if (value === undefined || value === null) return true
          if (typeof value === 'string' && value.trim() === '') return true
          return false
        })
        if (missing) return false
        
        // Validate primary contact email and phone if provided
        const errors = {}
        if (companyProfile?.primaryContact?.email && !validateEmail(companyProfile.primaryContact.email)) {
          errors['company.primaryContact.email'] = 'Primary contact email must be a valid @financialmgmt.com or @gmail.com address'
        }
        if (companyProfile?.primaryContact?.contactNumber && !validatePhone(companyProfile.primaryContact.contactNumber)) {
          errors['company.primaryContact.contactNumber'] = 'Primary contact number must contain only digits and be 7-15 digits long'
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...errors }))
          // Don't show primary contact errors in top banner - they'll show on the field
          setError('') // Clear top error, field errors will show inline
          return false
        }
        return true
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
        const missing = requiredFields.some((key) => {
          const value = customerProfile?.[key]
          if (value === undefined || value === null) return true
          if (typeof value === 'string' && value.trim() === '') return true
          return false
        })
        if (missing) return false
        
        // Validate email and phone format
        const errors = {}
        if (customerProfile?.emailId && !validateEmail(customerProfile.emailId)) {
          errors['customer.emailId'] = 'Customer email must be a valid @financialmgmt.com or @gmail.com address'
        }
        if (customerProfile?.contactNumber && !validatePhone(customerProfile.contactNumber)) {
          errors['customer.contactNumber'] = 'Customer contact number must contain only digits and be 7-15 digits long'
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...errors }))
          setError(Object.values(errors)[0])
          return false
        }
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
        const missing = requiredFields.some((key) => {
          const value = target?.[key]
          if (value === undefined || value === null) return true
          if (typeof value === 'string' && value.trim() === '') return true
          return false
        })
        if (missing) return false
        
        // Validate email and phone format
        const errors = {}
        if (target?.emailId && !validateEmail(target.emailId)) {
          errors['consignee.0.emailId'] = 'Consignee email must be a valid @financialmgmt.com or @gmail.com address'
        }
        if (target?.contactNumber && !validatePhone(target.contactNumber)) {
          errors['consignee.0.contactNumber'] = 'Consignee contact number must contain only digits and be 7-15 digits long'
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...errors }))
          setError(Object.values(errors)[0])
          return false
        }
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
        const missing = requiredFields.some((key) => {
          const value = target?.[key]
          if (value === undefined || value === null) return true
          if (typeof value === 'string' && value.trim() === '') return true
          return false
        })
        if (missing) return false
        
        // Validate email and phone format
        const errors = {}
        if (target?.emailId && !validateEmail(target.emailId)) {
          errors['payer.0.emailId'] = 'Payer email must be a valid @financialmgmt.com or @gmail.com address'
        }
        if (target?.contactNumber && !validatePhone(target.contactNumber)) {
          errors['payer.0.contactNumber'] = 'Payer contact number must contain only digits and be 7-15 digits long'
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...errors }))
          setError(Object.values(errors)[0])
          return false
        }
        return true
      }
      if (currentStep === 4) {
        // Employee Profile step - validate email and phone if provided
        const errors = {}
        teamProfiles.forEach((member, index) => {
          if (member?.email && !validateEmail(member.email)) {
            errors[`team.${index}.email`] = 'Team member email must be a valid @financialmgmt.com or @gmail.com address'
          }
          if (member?.contactNumber && !validatePhone(member.contactNumber)) {
            errors[`team.${index}.contactNumber`] = 'Team member contact number must contain only digits and be 7-15 digits long'
          }
        })
        if (Object.keys(errors).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...errors }))
          // Don't show team member errors in top banner - they'll show on the field
          setError('') // Clear top error, field errors will show inline
          return false
        }
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
  }, [currentStep, companyProfile, customerProfile, consigneeProfiles, payerProfiles, paymentTerms])

  function goToStep(idx) {
    if (idx < currentStep) {
      setCurrentStep(idx)
    } else {
      // Only allow forward if current step is valid
      if (DEV_BYPASS_VALIDATION || canGoNext) {
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
    // Clean up photo preview for removed employee
    setEmployeePhotoPreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[index]
      // Shift previews for indices after the removed one
      const shiftedPreviews = {}
      Object.keys(newPreviews).forEach((key) => {
        const keyNum = parseInt(key)
        if (keyNum > index) {
          shiftedPreviews[keyNum - 1] = newPreviews[key]
        } else if (keyNum < index) {
          shiftedPreviews[keyNum] = newPreviews[key]
        }
      })
      return shiftedPreviews
    })
  }

  function onNext(e) {
    e?.preventDefault()
    // Clear previous errors when trying to move forward
    setError('')
    
    // Validate current step before moving forward
    if (DEV_BYPASS_VALIDATION) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
      return
    }
    
    if (canGoNext) {
      // Clear field errors for current step when moving forward successfully
      const stepErrorKeys = Object.keys(fieldErrors).filter(key => {
        if (currentStep === 0) return key.startsWith('company.')
        if (currentStep === 1) return key.startsWith('customer.')
        if (currentStep === 2) return key.startsWith('consignee.')
        if (currentStep === 3) return key.startsWith('payer.')
        if (currentStep === 4) return key.startsWith('team.')
        return false
      })
      if (stepErrorKeys.length > 0) {
        setFieldErrors(prev => {
          const newErrors = { ...prev }
          stepErrorKeys.forEach(key => delete newErrors[key])
          return newErrors
        })
      }
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
    } else {
      // Validation failed - errors are already set in canGoNext
      // Scroll to first error field if possible
      const firstErrorKey = Object.keys(fieldErrors)[0]
      if (firstErrorKey) {
        const element = document.querySelector(`[data-field="${firstErrorKey}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }

  function onPrev(e) {
    e?.preventDefault()
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  function handleDone() {
    setShowSuccessPopup(false)
    // Navigate to customers list page with refresh state
    navigate('/customers', { replace: true, state: { refresh: true } })
  }

  // Function to load sample data for testing
  function loadSampleData() {
    setCompanyProfile({
      logo: null,
      companyName: 'Tech Solutions Pvt. Ltd.',
      legalEntityName: 'Tech Solutions Private Limited',
      corporateAddress: '123 Business Park, Sector 18',
      corporateDistrict: 'Gurgaon',
      corporateState: 'Haryana',
      corporateCountry: 'India',
      corporatePinCode: '122015',
      correspondenceAddress: '123 Business Park, Sector 18',
      correspondenceDistrict: 'Gurgaon',
      correspondenceState: 'Haryana',
      correspondenceCountry: 'India',
      correspondencePinCode: '122015',
      otherOfficeType: 'Branch Office',
      otherOfficeAddress: '456 Industrial Area, Phase 2',
      otherOfficeGst: '06AATCS1234F1Z5',
      otherOfficeDistrict: 'Gurgaon',
      otherOfficeState: 'Haryana',
      otherOfficeCountry: 'India',
      otherOfficePinCode: '122016',
      otherOfficeContactName: 'Rajesh Kumar',
      otherOfficeContactNumber: '+919876543210',
      otherOfficeEmail: 'rajesh.kumar@techsolutions.com',
      primaryContact: {
        name: 'Rajesh Kumar',
        contactNumber: '+919876543210',
        email: 'rajesh.kumar@gmail.com',
        department: 'Management',
        designation: 'CEO',
        jobRole: 'Executive',
        segment: 'Domestic'
      }
    })

    setCustomerProfile({
      logo: '',
      customerName: 'ABC Manufacturing Ltd.',
      legalEntityName: 'ABC Manufacturing Private Limited',
      corporateOfficeAddress: '789 Factory Road, Industrial Estate',
      correspondenceAddress: '789 Factory Road, Industrial Estate',
      district: 'Gurgaon',
      state: 'Haryana',
      country: 'India',
      pinCode: '122001',
      segment: 'Domestic',
      gstNumber: '06AABCU1234F1Z5',
      poIssuingAuthority: 'John Doe',
      designation: 'Purchase Manager',
      contactNumber: '+919876543211',
      emailId: 'john.doe@gmail.com'
    })

    setConsigneeProfiles([{
      logo: '',
      consigneeName: 'ABC Manufacturing - Warehouse',
      consigneeAddress: '789 Factory Road, Warehouse Block A',
      customerName: 'ABC Manufacturing Ltd.',
      legalEntityName: 'ABC Manufacturing Private Limited',
      city: 'Gurgaon',
      state: 'Haryana',
      gstNumber: '06AABCU1234F1Z5',
      contactPersonName: 'Jane Smith',
      designation: 'Warehouse Manager',
      contactNumber: '+919876543212',
      emailId: 'jane.smith@gmail.com'
    }])

    setPayerProfiles([{
      logo: '',
      payerName: 'ABC Manufacturing Ltd.',
      payerAddress: '789 Factory Road, Accounts Department',
      customerName: 'ABC Manufacturing Ltd.',
      legalEntityName: 'ABC Manufacturing Private Limited',
      city: 'Gurgaon',
      state: 'Haryana',
      gstNumber: '06AABCU1234F1Z5',
      contactPersonName: 'Robert Wilson',
      designation: 'Accounts Manager',
      contactNumber: '+919876543213',
      emailId: 'robert.wilson@gmail.com'
    }])

    setTeamProfiles([{
      role: 'Sales Manager',
      name: 'Amit Sharma',
      designation: 'Sales Manager',
      contactNumber: '+919876543214',
      email: 'amit.sharma@gmail.com',
      department: 'Sales',
      jobRole: 'Sales Executive',
      segment: 'Domestic',
      photo: ''
    }])

    setPaymentTerms([{
      basic: '70%',
      freight: '10%',
      taxes: '18%',
      due1: '30',
      due2: '60',
      due3: '90',
      finalDue: '120',
      description: 'Net 30 Days with 70% advance, 10% on delivery, balance in 30 days'
    }])

    setCurrentStep(0)
    toast.success('Sample data loaded! You can now navigate through the steps to review it.')
  }

  // Load customer data for editing
  useEffect(() => {
    async function loadCustomerData() {
      if (!editId || !token) {
        // Load saved data from localStorage if not editing
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed.companyProfile) setCompanyProfile(parsed.companyProfile)
        if (parsed.customerProfile) setCustomerProfile(parsed.customerProfile)
        if (parsed.consigneeProfiles) setConsigneeProfiles(parsed.consigneeProfiles)
        if (parsed.payerProfiles) setPayerProfiles(parsed.payerProfiles)
        if (parsed.paymentTerms) setPaymentTerms(parsed.paymentTerms)
        if (parsed.teamProfiles) setTeamProfiles(parsed.teamProfiles)
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep)
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
        setLoadingData(false)
        return
      }

      try {
        setLoadingData(true)
        const customer = await svc.get(editId)
        const metadata = customer?.metadata || {}
        
        // Load company profile
        if (metadata.companyProfile) {
          setCompanyProfile({
            ...metadata.companyProfile,
            primaryContact: {
              name: metadata.companyProfile.primaryContactName || '',
              contactNumber: metadata.companyProfile.primaryContactNumber || '',
              email: metadata.companyProfile.primaryContactEmail || '',
              department: '',
              designation: '',
              jobRole: '',
              segment: ''
            }
          })
        }
        
        // Load customer profile
        if (metadata.customerProfile) {
          setCustomerProfile(metadata.customerProfile)
        }
        
        // Load consignee profiles
        if (metadata.consigneeProfiles && Array.isArray(metadata.consigneeProfiles)) {
          setConsigneeProfiles(metadata.consigneeProfiles)
        }
        
        // Load payer profiles
        if (metadata.payerProfiles && Array.isArray(metadata.payerProfiles)) {
          setPayerProfiles(metadata.payerProfiles)
        }
        
        // Load payment terms
        if (metadata.paymentTerms && Array.isArray(metadata.paymentTerms)) {
          setPaymentTerms(metadata.paymentTerms.map(term => ({
            basic: term.advanceRequired || '',
            freight: '',
            taxes: term.latePaymentInterest || '',
            due1: term.creditPeriod || '',
            due2: '',
            due3: '',
            finalDue: term.balancePaymentDueDays || '',
            description: term.paymentTermName || term.notes || ''
          })))
        }
        
        // Load team profiles
        if (metadata.teamProfiles && Array.isArray(metadata.teamProfiles)) {
          setTeamProfiles(metadata.teamProfiles.map(member => ({
            role: member.role || '',
            name: member.teamMemberName || '',
            designation: '',
            contactNumber: member.contactNumber || '',
            email: member.emailId || '',
            department: member.department || '',
            jobRole: member.remarks || '',
            segment: '',
            photo: ''
          })))
        }
      } catch (error) {
        console.error('Error loading customer data:', error)
        toast.error('Failed to load customer data for editing')
      } finally {
        setLoadingData(false)
      }
    }
    
    loadCustomerData()
  }, [editId, token, svc])

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    try {
      const dataToSave = {
        companyProfile,
        customerProfile,
        consigneeProfiles,
        payerProfiles,
        paymentTerms,
        teamProfiles,
        currentStep
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }, [companyProfile, customerProfile, consigneeProfiles, payerProfiles, paymentTerms, teamProfiles, currentStep])

async function onSubmit(e) {
  if (e) {
  e.preventDefault();
    e.stopPropagation();
  }
  setError("");
  setFieldErrors({});
  setConfirmOpen(false); // Close confirmation modal

  try {
    // Comprehensive validation
    if (!validateAllSteps()) {
      // Scroll to first error
      const firstErrorField = Object.keys(fieldErrors)[0]
      if (firstErrorField) {
        const element = document.querySelector(`[data-field="${firstErrorField}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    // ---- SUBMIT PAYLOAD ----
    setSaving(true);

    // Prepare payload for masterDataService
    const payload = {
      companyProfile: {
        ...companyProfile,
        primaryContactName: companyProfile.primaryContact?.name || '',
        primaryContactNumber: companyProfile.primaryContact?.contactNumber || '',
        primaryContactEmail: companyProfile.primaryContact?.email || ''
      },
      customerProfile,
      consigneeProfiles,
      payerProfiles,
      paymentTerms: paymentTerms.map(term => ({
        paymentTermName: term.description || 'Default',
        creditPeriod: term.due1 || '',
        advanceRequired: term.basic || '',
        balancePaymentDueDays: term.finalDue || '',
        latePaymentInterest: term.taxes || '',
        billingCycle: 'Monthly',
        paymentMethod: 'Bank Transfer',
        bankName: '',
        bankAccountNumber: '',
        ifscCode: '',
        notes: term.description || ''
      })),
      teamProfiles: teamProfiles.map(member => ({
        teamMemberName: member.name || '',
        employeeId: '',
        role: member.role || '',
        department: member.department || '',
        contactNumber: member.contactNumber || '',
        emailId: member.email || '',
        reportingManager: '',
        location: '',
        accessLevel: 'Standard',
        remarks: member.jobRole || ''
      })),
      additionalStep: {
        defaultCurrency: 'INR',
        defaultTax: '18',
        invoicePrefix: 'INV',
        quotationPrefix: 'QUO',
        enableBOQ: 'Yes',
        enableAutoInvoice: 'No',
        notificationEmail: customerProfile.emailId || '',
        smsNotification: 'No',
        allowPartialDelivery: 'Yes',
        serviceCharge: '0',
        remarks: ''
      }
    };

    let response
    if (editId) {
      // Update existing customer
      response = await svc.update(editId, payload)
      toast.success('Master Data updated successfully!')
    } else {
      // Create new customer
      response = await masterDataService.submitMasterData(payload)
      toast.success('Master Data created successfully!')
    }

    // Clear localStorage after successful submission
    localStorage.removeItem(STORAGE_KEY)

    setSubmittedData(payload)
    // Get customer ID from sync result or response
    const recordId = response?.data?.syncResult?.customerId || response?.data?.syncResult?.id || response?.data?.customerId || response?.data?.id || editId || Date.now().toString()
    setCreatedRecordId(recordId)
    setShowSuccessPopup(true)
    
    // Don't auto-navigate - let user click "Done" or "Create Another" button

  } catch (err) {
    console.error("Submit error:", err);
    setError(err?.message || "Something went wrong while saving data. Please try again.");
  } finally {
    setSaving(false);
  }
}

if (loadingData) {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    </DashboardLayout>
  )
}

return (
// ...
    <ErrorBoundary>
      <DashboardLayout>
      <div className="mb-8 rounded-2xl border border-secondary-200 bg-gradient-to-r from-primary-50 via-white to-secondary-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-secondary-900">Creation of Master Data</h1>
            <p className="text-sm text-secondary-600">Stepwise onboarding for company, customer, payment, and team details.</p>
          </div>
          <div className="text-sm font-medium text-primary-700 bg-white/70 border border-primary-100 rounded-full px-4 py-2 shadow-xs">
            {progressPercent}% complete
            </div>
          </div>
          
          {/* Load Sample Data Button */}
          <div>
            <button
              type="button"
              onClick={loadSampleData}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-500 bg-blue-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-600 hover:border-blue-600 hover:shadow-xl transition-all duration-200 active:scale-95"
              title="Load sample data for testing all form fields"
            >
              <Plus className="h-5 w-5" />
              Load Sample Data
            </button>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              Click to automatically fill all form fields with sample data for testing
            </p>
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
              const canNavigate = isPastStep || (isCurrentStep && canGoNext)
              return (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => goToStep(idx)}
                  disabled={idx > currentStep && !DEV_BYPASS_VALIDATION && !canGoNext}
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
      <form onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // Only allow submission through the button click, not form submit
        return false
      }} className="space-y-6">
        {error && !error.includes('Primary contact') && !error.includes('primary contact') && !error.includes('Team member') && !error.includes('team member') && (
          <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-center gap-2">
            <XCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
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
                data-field="company.companyName"
                className={`input ${getFieldError('company.companyName') ? 'border-red-500' : ''}`}
                type="text"
                value={companyProfile?.companyName || ''}
                onChange={(e) => {
                  const value = e.target.value
                  updateCompany('companyName', value)
                  if (getFieldError('company.companyName')) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors['company.companyName']
                      return newErrors
                    })
                  }
                  if (value?.trim() || companyProfile?.legalEntityName?.trim()) setError('')
                }}
                placeholder="Company trading name"
              />
              {getFieldError('company.companyName') && (
                <p className="text-xs text-red-500 mt-1">{getFieldError('company.companyName')}</p>
              )}
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

        {/* Primary Contact Section */}
        <div className="space-y-3 mt-6 pt-6 border-t border-secondary-200">
          <h3 className="text-base font-semibold text-secondary-900">Primary Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Contact Name</label>
              <input
                className="input"
                placeholder="Contact person name"
                value={companyProfile.primaryContact?.name || ''}
                onChange={(e) => updateCompany('primaryContact', { ...companyProfile.primaryContact, name: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Contact Number</label>
              <input
                data-field="company.primaryContact.contactNumber"
                className={`input ${getFieldError('company.primaryContact.contactNumber') ? 'border-red-500' : ''}`}
                placeholder="Contact number"
                value={companyProfile.primaryContact?.contactNumber || ''}
                onChange={(e) => {
                  const value = e.target.value
                  updateCompany('primaryContact', { ...companyProfile.primaryContact, contactNumber: value })
                  if (getFieldError('company.primaryContact.contactNumber')) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors['company.primaryContact.contactNumber']
                      return newErrors
                    })
                  }
                }}
              />
              {getFieldError('company.primaryContact.contactNumber') && (
                <p className="text-xs text-red-500 mt-1">{getFieldError('company.primaryContact.contactNumber')}</p>
              )}
            </div>
            <div>
              <label className="form-label">Email ID</label>
              <input
                data-field="company.primaryContact.email"
                type="email"
                className={`input ${getFieldError('company.primaryContact.email') ? 'border-red-500' : ''}`}
                placeholder="Email address"
                value={companyProfile.primaryContact?.email || ''}
                onChange={(e) => {
                  const value = e.target.value
                  updateCompany('primaryContact', { ...companyProfile.primaryContact, email: value })
                  if (getFieldError('company.primaryContact.email')) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors['company.primaryContact.email']
                      return newErrors
                    })
                  }
                }}
              />
              {getFieldError('company.primaryContact.email') && (
                <p className="text-xs text-red-500 mt-1">{getFieldError('company.primaryContact.email')}</p>
              )}
            </div>
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
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 overflow-hidden">
                      {customerLogoPreview ? (
                        <img 
                          src={customerLogoPreview} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-700 text-lg font-semibold">
                          {customerProfile.logo instanceof File 
                            ? customerProfile.logo.name.substring(0, 2).toUpperCase()
                            : 'Logo'}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-secondary-800">
                        {customerLogoPreview ? 'Logo uploaded' : 'Upload customer logo'}
                      </p>
                      <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
                    </div>
                    <label className="btn btn-outline btn-sm cursor-pointer">
                      {customerLogoPreview ? 'Change Logo' : 'Choose File'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setCustomerLogoPreview(reader.result)
                            }
                            reader.readAsDataURL(file)
                            setCustomerProfile({ ...customerProfile, logo: file })
                          } else {
                            setCustomerLogoPreview(null)
                            setCustomerProfile({ ...customerProfile, logo: '' })
                          }
                        }}
                      />
                    </label>
                    {customerProfile.logo && (
                      <div className="text-xs text-secondary-600 truncate max-w-full">
                        {customerProfile.logo instanceof File ? customerProfile.logo.name : customerProfile.logo}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label">Customer Name *</label>
                  <input
                    data-field="customer.customerName"
                    className={`input ${getFieldError('customer.customerName') ? 'border-red-500' : ''}`}
                    value={customerProfile.customerName}
                    onChange={(e) => {
                      const value = e.target.value
                      setCustomerProfile({ ...customerProfile, customerName: value })
                      if (getFieldError('customer.customerName')) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors['customer.customerName']
                          return newErrors
                        })
                      }
                    }}
                    placeholder="Enter customer name"
                  />
                  {getFieldError('customer.customerName') && (
                    <p className="text-xs text-red-500 mt-1">{getFieldError('customer.customerName')}</p>
                  )}
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
                    data-field="customer.contactNumber"
                    className={`input ${getFieldError('customer.contactNumber') ? 'border-red-500' : ''}`}
                    value={customerProfile.contactNumber}
                    onChange={(e) => {
                      const value = e.target.value
                      setCustomerProfile({ ...customerProfile, contactNumber: value })
                      if (getFieldError('customer.contactNumber')) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors['customer.contactNumber']
                          return newErrors
                        })
                      }
                    }}
                    placeholder="Enter contact number"
                  />
                  {getFieldError('customer.contactNumber') && (
                    <p className="text-xs text-red-500 mt-1">{getFieldError('customer.contactNumber')}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Email ID *</label>
                  <input
                    data-field="customer.emailId"
                    type="email"
                    className={`input ${getFieldError('customer.emailId') ? 'border-red-500' : ''}`}
                    value={customerProfile.emailId}
                    onChange={(e) => {
                      const value = e.target.value
                      setCustomerProfile({ ...customerProfile, emailId: value })
                      if (getFieldError('customer.emailId')) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors['customer.emailId']
                          return newErrors
                        })
                      }
                    }}
                    placeholder="Enter email address"
                  />
                  {getFieldError('customer.emailId') && (
                    <p className="text-xs text-red-500 mt-1">{getFieldError('customer.emailId')}</p>
                  )}
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
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 overflow-hidden">
                          {consigneeLogoPreviews[index] ? (
                            <img 
                              src={consigneeLogoPreviews[index]} 
                              alt="Logo preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary-700 text-lg font-semibold">
                              {consignee.logo instanceof File 
                                ? consignee.logo.name.substring(0, 2).toUpperCase()
                                : 'Logo'}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-secondary-800">
                            {consigneeLogoPreviews[index] ? 'Logo uploaded' : 'Upload consignee logo'}
                          </p>
                          <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
                        </div>
                        <label className="btn btn-outline btn-sm cursor-pointer">
                          {consigneeLogoPreviews[index] ? 'Change Logo' : 'Choose File'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setConsigneeLogoPreviews(prev => ({ ...prev, [index]: reader.result }))
                                }
                                reader.readAsDataURL(file)
                                updateConsignee(index, 'logo', file)
                              } else {
                                setConsigneeLogoPreviews(prev => {
                                  const newPreviews = { ...prev }
                                  delete newPreviews[index]
                                  return newPreviews
                                })
                                updateConsignee(index, 'logo', '')
                              }
                            }}
                          />
                        </label>
                        {consignee.logo && (
                          <div className="text-xs text-secondary-600 truncate max-w-full">
                            {consignee.logo instanceof File ? consignee.logo.name : consignee.logo}
                          </div>
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
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 overflow-hidden">
                          {payerLogoPreviews[index] ? (
                            <img 
                              src={payerLogoPreviews[index]} 
                              alt="Logo preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary-700 text-lg font-semibold">
                              {payer.logo instanceof File 
                                ? payer.logo.name.substring(0, 2).toUpperCase()
                                : 'Logo'}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-secondary-800">
                            {payerLogoPreviews[index] ? 'Logo uploaded' : 'Upload payer logo'}
                          </p>
                          <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
                        </div>
                        <label className="btn btn-outline btn-sm cursor-pointer">
                          {payerLogoPreviews[index] ? 'Change Logo' : 'Choose File'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setPayerLogoPreviews(prev => ({ ...prev, [index]: reader.result }))
                                }
                                reader.readAsDataURL(file)
                                updatePayer(index, 'logo', file)
                              } else {
                                setPayerLogoPreviews(prev => {
                                  const newPreviews = { ...prev }
                                  delete newPreviews[index]
                                  return newPreviews
                                })
                                updatePayer(index, 'logo', '')
                              }
                            }}
                          />
                        </label>
                        {payer.logo && (
                          <div className="text-xs text-secondary-600 truncate max-w-full">
                            {payer.logo instanceof File ? payer.logo.name : payer.logo}
                          </div>
                        )}
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
                      <div className="rounded-lg border border-dashed border-secondary-300 bg-white p-4 text-center space-y-3">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 overflow-hidden">
                          {employeePhotoPreviews[index] ? (
                            <img 
                              src={employeePhotoPreviews[index]} 
                              alt="Photo preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary-700 text-lg font-semibold">
                              {member.photo instanceof File 
                                ? member.photo.name.substring(0, 2).toUpperCase()
                                : member.name 
                                  ? member.name.substring(0, 2).toUpperCase()
                                  : 'Photo'}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-secondary-800">
                            {employeePhotoPreviews[index] ? 'Photo uploaded' : 'Upload employee photo'}
                          </p>
                          <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
                        </div>
                        <label className="btn btn-outline btn-sm cursor-pointer">
                          {employeePhotoPreviews[index] ? 'Change Photo' : 'Choose File'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setEmployeePhotoPreviews(prev => ({ ...prev, [index]: reader.result }))
                                }
                                reader.readAsDataURL(file)
                                updateTeamProfile(index, 'photo', file)
                              } else {
                                setEmployeePhotoPreviews(prev => {
                                  const newPreviews = { ...prev }
                                  delete newPreviews[index]
                                  return newPreviews
                                })
                                updateTeamProfile(index, 'photo', '')
                              }
                            }}
                          />
                        </label>
                        {member.photo && (
                          <div className="text-xs text-secondary-600 truncate max-w-full">
                            {member.photo instanceof File ? member.photo.name : member.photo}
                          </div>
                        )}
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
                        data-field={`team.${index}.contactNumber`}
                        className={`input ${getFieldError(`team.${index}.contactNumber`) ? 'border-red-500' : ''}`}
                        value={member.contactNumber}
                        onChange={(e) => {
                          const value = e.target.value
                          updateTeamProfile(index, 'contactNumber', value)
                          if (getFieldError(`team.${index}.contactNumber`)) {
                            setFieldErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors[`team.${index}.contactNumber`]
                              return newErrors
                            })
                          }
                        }}
                        placeholder="Contact number"
                      />
                      {getFieldError(`team.${index}.contactNumber`) && (
                        <p className="text-xs text-red-500 mt-1">{getFieldError(`team.${index}.contactNumber`)}</p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Email ID</label>
                      <input
                        data-field={`team.${index}.email`}
                        type="email"
                        className={`input ${getFieldError(`team.${index}.email`) ? 'border-red-500' : ''}`}
                        value={member.email}
                        onChange={(e) => {
                          const value = e.target.value
                          updateTeamProfile(index, 'email', value)
                          if (getFieldError(`team.${index}.email`)) {
                            setFieldErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors[`team.${index}.email`]
                              return newErrors
                            })
                          }
                        }}
                        placeholder="Email address"
                      />
                      {getFieldError(`team.${index}.email`) && (
                        <p className="text-xs text-red-500 mt-1">{getFieldError(`team.${index}.email`)}</p>
                      )}
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
      disabled={!DEV_BYPASS_VALIDATION && !canGoNext}
      style={{ minWidth: 120 }}
      title={!DEV_BYPASS_VALIDATION && !canGoNext ? 'Please fill all required fields' : ''}
    >
      Next
    </button>
  ) : (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (validateAllSteps()) {
          setConfirmOpen(true)
        }
      }}
      className="btn btn-success px-10 py-3 text-base font-bold rounded-full shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={saving || !canGoNext}
      style={{ minWidth: 120 }}
    >
      {saving ? 'Saving...' : 'Submit'}
    </button>
  )}
</div>
      </form>
      
      {/* Confirmation Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
        title="Confirm Submission"
        variant="dialog"
        size="sm"
        footer={(
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              className="btn btn-outline btn-md"
              onClick={() => setConfirmOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-success btn-md"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setConfirmOpen(false)
                onSubmit(e)
              }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Confirm & Submit'
              )}
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Submit Master Data?
              </h3>
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to submit this master data? Once submitted, it will be saved to your system and you can view it on the Master Data page.
              </p>
              <p className="text-xs text-gray-500">
                You can edit or preview this entry after submission.
              </p>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* Success Popup Modal - Professional Design */}
      {showSuccessPopup && submittedData && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[12000] overflow-y-auto p-4"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={(e) => e.target === e.currentTarget && setShowSuccessPopup(false)}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 my-8 relative">
            {/* Success Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Master Data Submitted Successfully
                  </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Record ID: <span className="font-mono text-gray-700">{createdRecordId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                  <XCircle className="h-5 w-5" />
              </button>
              </div>
            </div>

            {/* Structured Data Display */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Company Profile */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    Company Profile
                  </h4>
                  <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-600 w-1/3">Company Name</td>
                          <td className="px-4 py-2.5 text-gray-900">{submittedData.companyProfile.companyName || submittedData.companyProfile.legalEntityName || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-600">Legal Entity</td>
                          <td className="px-4 py-2.5 text-gray-900">{submittedData.companyProfile.legalEntityName || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-600">State</td>
                          <td className="px-4 py-2.5 text-gray-900">{submittedData.companyProfile.corporateState || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-600">Country</td>
                          <td className="px-4 py-2.5 text-gray-900">{submittedData.companyProfile.corporateCountry || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>

                {/* Customer Profile */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    Customer Profile
                  </h4>
                  <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-600 w-1/3">Customer Name</td>
                          <td className="px-4 py-2.5 text-gray-900">{submittedData.customerProfile.customerName || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-600">Segment</td>
                          <td className="px-4 py-2.5 text-gray-900">{submittedData.customerProfile.segment || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-600">Contact Number</td>
                          <td className="px-4 py-2.5 text-gray-900">{submittedData.customerProfile.contactNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-gray-600">Email</td>
                          <td className="px-4 py-2.5 text-gray-900">{submittedData.customerProfile.emailId || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
              </div>

                {/* Consignee Profile */}
              {submittedData.consigneeProfiles?.[0] && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      Consignee Profile
                    </h4>
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600 w-1/3">Consignee Name</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.consigneeProfiles[0].consigneeName || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600">City</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.consigneeProfiles[0].city || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600">State</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.consigneeProfiles[0].state || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600">GST Number</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.consigneeProfiles[0].gstNumber || 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                  </div>
                </div>
              )}

                {/* Payer Profile */}
              {submittedData.payerProfiles?.[0] && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      Payer Profile
                    </h4>
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600 w-1/3">Payer Name</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.payerProfiles[0].payerName || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600">City</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.payerProfiles[0].city || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600">State</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.payerProfiles[0].state || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600">GST Number</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.payerProfiles[0].gstNumber || 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                  </div>
                </div>
              )}

                {/* Payment Terms */}
              {submittedData.paymentTerms?.[0] && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      Payment Terms
                    </h4>
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600 w-1/3">Term Name</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.paymentTerms[0].paymentTermName || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600">Credit Period</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.paymentTerms[0].creditPeriod || 'N/A'} days</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2.5 font-medium text-gray-600">Billing Cycle</td>
                            <td className="px-4 py-2.5 text-gray-900">{submittedData.paymentTerms[0].billingCycle || 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                  </div>
                </div>
              )}

                {/* Team Profiles */}
              {submittedData.teamProfiles?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-gray-600" />
                      Team Members ({submittedData.teamProfiles.length})
                    </h4>
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {submittedData.teamProfiles.map((member, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2.5 text-gray-900">{member.teamMemberName || 'N/A'}</td>
                              <td className="px-4 py-2.5 text-gray-900">{member.role || 'N/A'}</td>
                              <td className="px-4 py-2.5 text-gray-900">{member.department || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSuccessPopup(false)
                  setCurrentStep(0)
                  setLogoPreview(null)
                  setCustomerLogoPreview(null)
                  setConsigneeLogoPreviews({})
                  setPayerLogoPreviews({})
                  setEmployeePhotoPreviews({})
                  setCompanyProfile({
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
                  setSubmittedData(null)
                  setCreatedRecordId(null)
                  localStorage.removeItem(STORAGE_KEY)
                  // Stay on the same page to create another entry
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create Another
              </button>
              <button
                onClick={handleDone}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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


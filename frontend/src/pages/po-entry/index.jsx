import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import SmartDropdown from '../../components/ui/SmartDropdown.jsx'

import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import { createPOEntryService } from '../../services/poEntryService'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, ExternalLink, Info, Loader2, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

const emptyBOQItem = () => ({
  materialDescription: '',
  qty: '',
  uom: '',
  unitPrice: '',
  unitCost: '',
  freight: '',
  gst: '',
  totalCost: ''
})

const initialForm = {
  // Customer Details
  customerName: '',
  legalEntityName: '',
  customerAddress: '',
  district: '',
  state: '',
  country: '',
  pinCode: '',
  gstNo: '',
  businessUnit: '',
  segment: '',
  zone: '',
  
  // Contract and Purchase Order Details
  contractAgreementNo: '',
  contractAgreementDate: '',
  poNo: '',
  poDate: '',
  letterOfIntentNo: '',
  letterOfIntentDate: '',
  letterOfAwardNo: '',
  letterOfAwardDate: '',
  tenderReferenceNo: '',
  tenderDate: '',
  projectDescription: '',
  
  // Payment Details
  paymentType: '',
  paymentTerms: '',
  paymentTermsClauseInPO: '',
  
  // Insurance Details
  insuranceType: '',
  policyNo: '',
  policyDate: '',
  policyCompany: '',
  policyValidUpto: '',
  policyClauseInPO: '',
  policyRemarks: '',
  
  // Bank Guarantee Details
  bankGuaranteeType: '',
  bankGuaranteeNo: '',
  bankGuaranteeDate: '',
  bankGuaranteeValue: '',
  bankName: '',
  bankGuaranteeValidity: '',
  bankGuaranteeReleaseValidityClauseInPO: '',
  bankGuaranteeRemarks: '',
  
  // Team Members
  salesManager: '',
  salesHead: '',
  businessHead: '',
  projectManager: '',
  projectHead: '',
  collectionIncharge: '',
  salesAgentName: '',
  salesAgentCommission: '',
  collectionAgentName: '',
  collectionAgentCommission: '',
  
  // Additional Fields
  deliveryScheduleClause: '',
  liquidatedDamagesClause: '',
  lastDateOfDelivery: '',
  poValidity: '',
  poSignedConcernName: '',
  
  // Legacy fields for backward compatibility
  businessType: '',
  agentName: '',
  agentCommission: '',
  deliverySchedule: '',
  description: '',
  caDate: '',
  performanceBankGuaranteeNo: '',
  pbgDate: '',
  advanceBankGuaranteeNo: '',
  abgDate: '',
  boqAsPerPO: '',
  
  // Financial Summary
  totalExWorks: '',
  totalFreightAmount: '',
  gst: '',
  totalPOValue: ''
}

const numericFields = ['agentCommission', 'salesAgentCommission', 'collectionAgentCommission', 'gst', 'totalExWorks', 'totalFreightAmount', 'freightAmount', 'totalPOValue', 'bankGuaranteeValue']
const requiredFields = [
  'poNo',
  'poDate',
  'customerName',
  'legalEntityName',
  'customerAddress',
  'district',
  'country',
  'state',
  'pinCode',
  'gstNo',
  'segment',
  'zone',
  'paymentType',
  'paymentTerms',
  'totalPOValue'
]

function createEmptyForm() {
  return { ...initialForm }
}

function hydrateForm(entry) {
  if (!entry) return createEmptyForm()
  const hydrated = createEmptyForm()
  Object.keys(hydrated).forEach((key) => {
    if (entry[key] !== undefined && entry[key] !== null) {
      hydrated[key] = typeof entry[key] === 'number' ? entry[key].toString() : entry[key]
    }
  })
  return hydrated
}

const fallbackMasterSeeds = {
  segments: ['Domestic', 'Export'],
  zones: ['North', 'East', 'West', 'South'],
  businessTypes: ['EPC', 'OEM', 'Dealer', 'Direct', 'Distributor'],
  paymentTerms: ['Advance', 'Milestone Based', 'Net 30', 'Net 45', 'Net 60'],
  paymentTypes: ['Secured', 'Unsecured', 'Govt'],
  insuranceTypes: ['Marine Insurance', 'Group Accidental Policy', 'Workmen Compensation Policy', 'All Erection Policy', 'Others'],
  bankGuaranteeTypes: ['Advance Bank Guarantee', 'Performance Bank Guarantee', 'Bid Security', 'Retention', 'Others'],
  countries: ['India']
}

// Single page form - no steps needed

function Section({ title, description, children, badge }) {
  return (
    <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between bg-secondary-50 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">{title}</h2>
          {description ? <p className="text-sm text-secondary-600 mt-1">{description}</p> : null}
        </div>
        {badge ? <span className="text-xs font-semibold uppercase tracking-wider text-secondary-500">{badge}</span> : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, required, children, hint }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-secondary-800">
        {label}
        {required ? <span className="text-danger-600 ml-1">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-secondary-500">{hint}</span> : null}
    </label>
  )
}

export default function POEntry() {
  const { token } = useAuthContext()
  const navigate = useNavigate()
  const { id } = useParams()
  const customerService = useMemo(() => createCustomerService(token), [token])
  const poEntryService = useMemo(() => createPOEntryService(token), [token])
  const isEditing = Boolean(id)
  const [form, setForm] = useState(() => createEmptyForm())
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEntry, setIsLoadingEntry] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [boqEnabled, setBoqEnabled] = useState(false)
  const [boqItems, setBoqItems] = useState([emptyBOQItem()])
  const [masterOptions, setMasterOptions] = useState({
    customers: [],
    segments: fallbackMasterSeeds.segments,
    zones: fallbackMasterSeeds.zones,
    businessTypes: fallbackMasterSeeds.businessTypes,
    paymentTerms: fallbackMasterSeeds.paymentTerms,
    paymentTypes: fallbackMasterSeeds.paymentTypes,
    insuranceTypes: fallbackMasterSeeds.insuranceTypes,
    bankGuaranteeTypes: fallbackMasterSeeds.bankGuaranteeTypes,
    countries: fallbackMasterSeeds.countries,
    salesContacts: []
  })

  useEffect(() => {
    if (!token) return
    loadMasterData()
  }, [token, customerService])

  useEffect(() => {
    if (!token) return
    if (!isEditing) {
      setForm(createEmptyForm())
      return
    }

    let cancelled = false
    async function loadEntry() {
      setIsLoadingEntry(true)
      try {
        const response = await poEntryService.get(id)
        const entry = response?.data || response
        if (!cancelled && entry) {
          setForm(hydrateForm(entry))
        }
      } catch (error) {
        if (!cancelled) {
          const message = error?.response?.data?.message || error?.message || 'Failed to load PO entry'
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEntry(false)
        }
      }
    }

    loadEntry()
    return () => {
      cancelled = true
    }
  }, [id, isEditing, poEntryService, token])

  async function loadMasterData() {
    try {
      const response = await customerService.masterOptions()
      const data = response?.data || {}

      setMasterOptions((prev) => ({
        ...prev,
        customers: data.customers || [],
        segments: data.segments?.length ? data.segments : fallbackMasterSeeds.segments,
        zones: data.zones?.length ? data.zones : fallbackMasterSeeds.zones,
        businessTypes: data.businessTypes?.length ? data.businessTypes : fallbackMasterSeeds.businessTypes,
        paymentTerms: data.paymentTerms?.length ? data.paymentTerms : fallbackMasterSeeds.paymentTerms,
        paymentTypes: prev.paymentTypes,
        countries: data.countries?.length ? data.countries : fallbackMasterSeeds.countries,
        salesContacts: data.salesContacts || []
      }))
      } catch (error) {
      console.error('Failed to load master data', error)
      toast.error('Unable to load master data. Continue manually.')
    }
  }

  function handleChange({ target: { name, value } }) {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  function handleCustomerSelect(value) {
    const selected = masterOptions.customers.find(
      (c) => (c.companyName || c.name) === value
    )
    const paymentTerm = selected?.paymentTerms?.[0]?.title || ''
    const contactByRole = (role) =>
      selected?.contacts?.find((contact) => contact.contact_role === role)?.name || ''

    setForm((prev) => ({
      ...prev,
      customerName: value,
      legalEntityName: selected?.legalEntityName || prev.legalEntityName,
      customerAddress: selected?.customerAddress || selected?.address || prev.customerAddress,
      district: selected?.district || prev.district,
      country: selected?.country || prev.country || 'India',
      state: selected?.state || prev.state || '',
      pinCode: selected?.pinCode || prev.pinCode,
      zone: selected?.zone || prev.zone || '',
      segment: selected?.segment || prev.segment || '',
      businessType: selected?.businessType || prev.businessType || '',
      businessUnit: selected?.businessUnit || prev.businessUnit,
      gstNo: selected?.gstNumber || prev.gstNo,
      paymentTerms: prev.paymentTerms || paymentTerm,
      salesManager: prev.salesManager || selected?.salesManager || contactByRole('sales_manager'),
      salesHead: prev.salesHead || selected?.salesHead || contactByRole('sales_head')
    }))
  }

  function handleBOQItemChange(index, field, value) {
    setBoqItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      
      // Calculate total cost
      const qty = parseFloat(updated[index].qty) || 0
      const unitCost = parseFloat(updated[index].unitCost) || 0
      const freight = parseFloat(updated[index].freight) || 0
      const gst = parseFloat(updated[index].gst) || 0
      const totalCost = (qty * unitCost) + freight + gst
      updated[index].totalCost = totalCost.toFixed(2)
      
      // Recalculate summary
      const totalExWorks = updated.reduce((sum, item) => {
        const q = parseFloat(item.qty) || 0
        const uc = parseFloat(item.unitCost) || 0
        return sum + (q * uc)
      }, 0)
      
      const totalFreight = updated.reduce((sum, item) => {
        return sum + (parseFloat(item.freight) || 0)
      }, 0)
      
      const totalGST = updated.reduce((sum, item) => {
        return sum + (parseFloat(item.gst) || 0)
      }, 0)
      
      const totalPOValue = totalExWorks + totalFreight + totalGST
      
      setForm(prev => ({
        ...prev,
        totalExWorks: totalExWorks.toFixed(2),
        totalFreightAmount: totalFreight.toFixed(2),
        gst: totalGST.toFixed(2),
        totalPOValue: totalPOValue.toFixed(2)
      }))
      
      return updated
    })
  }

  function addBOQItem() {
    setBoqItems(prev => [...prev, emptyBOQItem()])
  }

  function removeBOQItem(index) {
    if (boqItems.length > 1) {
      setBoqItems(prev => {
        const updated = prev.filter((_, i) => i !== index)
        
        // Recalculate summary
        const totalExWorks = updated.reduce((sum, item) => {
          const q = parseFloat(item.qty) || 0
          const uc = parseFloat(item.unitCost) || 0
          return sum + (q * uc)
        }, 0)
        
        const totalFreight = updated.reduce((sum, item) => {
          return sum + (parseFloat(item.freight) || 0)
        }, 0)
        
        const totalGST = updated.reduce((sum, item) => {
          return sum + (parseFloat(item.gst) || 0)
        }, 0)
        
        const totalPOValue = totalExWorks + totalFreight + totalGST
        
        setForm(prev => ({
          ...prev,
          totalExWorks: totalExWorks.toFixed(2),
          totalFreightAmount: totalFreight.toFixed(2),
          gst: totalGST.toFixed(2),
          totalPOValue: totalPOValue.toFixed(2)
        }))
        
        return updated
      })
    }
  }

  function validateForm() {
    const nextErrors = {}
    requiredFields.forEach((field) => {
      if (!form[field]?.toString().trim()) {
        nextErrors[field] = 'Required'
      }
    })

    if (form.gst && Number(form.gst) < 0) nextErrors.gst = 'Must be positive'
    if (form.totalExWorks && Number(form.totalExWorks) < 0) nextErrors.totalExWorks = 'Must be positive'
    if (form.freightAmount && Number(form.freightAmount) < 0) nextErrors.freightAmount = 'Must be positive'
    if (form.totalPOValue && Number(form.totalPOValue) <= 0) nextErrors.totalPOValue = 'Must be greater than 0'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function saveEntry() {
    try {
      setIsSubmitting(true)
      const payload = { ...form, boqEnabled, boqItems: boqEnabled ? boqItems : [] }
      numericFields.forEach((field) => {
        payload[field] = form[field] ? Number(form[field]) : null
      })
      const response = isEditing
        ? await poEntryService.update(id, payload)
        : await poEntryService.create(payload)
      if (response?.success) {
        toast.success(isEditing ? 'Purchase Order entry updated successfully!' : 'Purchase Order entry saved successfully!')
      } else {
        toast.success(isEditing ? 'Purchase Order entry updated' : 'Purchase Order entry created')
      }
      setForm(createEmptyForm())
      setErrors({})
      setConfirmOpen(false)
      navigate('/po-entry')
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to save PO entry'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please resolve validation errors.')
      return
    }

    // Show confirmation popup
    setConfirmOpen(true)
  }

  return (
    <DashboardLayout>
  
      {/* PAGE WRAPPER */}
      <div className="space-y-6">
        {isLoadingEntry ? (
          <div className="rounded-2xl border border-secondary-200 bg-white p-5 text-center shadow-sm text-secondary-600">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-primary-600" />
            Loading PO entry...
          </div>
        ) : null}
  
        {/* HEADER */}
        <div className="rounded-2xl border border-secondary-200 bg-gradient-to-r from-primary-50 via-white to-secondary-50 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-secondary-600 mb-2">
                Structured Master Linked Form
              </div>
              <h1 className="text-2xl font-semibold text-secondary-900">Customer PO Entry</h1>
              <p className="text-sm text-secondary-600 mt-1">
                Capture Purchase Orders using the exact structure from your Excel master.
              </p>
            </div>
            <div className="flex justify-end w-full lg:w-auto gap-2">
              <button
                type="button"
                onClick={() => setBoqEnabled(!boqEnabled)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${
                  boqEnabled 
                    ? 'border-green-300 bg-green-600 text-white hover:bg-green-700' 
                    : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50'
                }`}
              >
                {boqEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                BOQ {boqEnabled ? 'Enabled' : 'Disabled'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/po-entry')}
                className="inline-flex items-center gap-2 rounded-full border border-secondary-300 bg-white px-4 py-2 text-sm font-semibold text-secondary-700 shadow-sm hover:bg-secondary-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to PO List
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section
            title="Customer Details"
            description="Pull customer metadata directly from the master data module."
            badge="Customer Master"
          >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Customer Name" required>
                  <SmartDropdown
                    value={form.customerName}
                    onChange={(val) => {
                      handleCustomerSelect(val)
                    }}
                    fieldName="customerName"
                    placeholder="Select from Master Data or start typing"
                    inputClassName={`input ${errors.customerName ? 'border-danger-400' : ''}`}
                  />
                  {errors.customerName ? <span className="text-xs text-danger-600">{errors.customerName}</span> : null}
                </Field>
                <Field label="Legal Entity Name" required>
                  <input
                    name="legalEntityName"
                    value={form.legalEntityName}
                    onChange={handleChange}
                    className={`input ${errors.legalEntityName ? 'border-danger-400' : ''}`}
                    placeholder="Legal entity name"
                  />
                  {errors.legalEntityName ? <span className="text-xs text-danger-600">{errors.legalEntityName}</span> : null}
                </Field>
                <Field label="Customer Address" required>
                  <textarea
                    name="customerAddress"
                    value={form.customerAddress}
                    onChange={handleChange}
                    rows={3}
                    className={`input min-h-[88px] ${errors.customerAddress ? 'border-danger-400' : ''}`}
                    placeholder="Full postal address"
                  />
                  {errors.customerAddress ? (
                    <span className="text-xs text-danger-600">{errors.customerAddress}</span>
                  ) : null}
                </Field>
                <Field label="District" required>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className={`input ${errors.district ? 'border-danger-400' : ''}`}
                    placeholder="District"
                  />
                  {errors.district ? <span className="text-xs text-danger-600">{errors.district}</span> : null}
                </Field>
                <Field label="State" required>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={`input ${errors.state ? 'border-danger-400' : ''}`}
                  />
                  {errors.state ? <span className="text-xs text-danger-600">{errors.state}</span> : null}
                </Field>
                <Field label="Country" required>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className={`input ${errors.country ? 'border-danger-400' : ''}`}
                  >
                    <option value="">Select Country</option>
                    {masterOptions.countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country ? <span className="text-xs text-danger-600">{errors.country}</span> : null}
                </Field>
                <Field label="Pin Code" required>
                  <input
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    className={`input ${errors.pinCode ? 'border-danger-400' : ''}`}
                    placeholder="Pin code"
                  />
                  {errors.pinCode ? <span className="text-xs text-danger-600">{errors.pinCode}</span> : null}
                </Field>
                <Field label="GST No" required>
                  <SmartDropdown
                    value={form.gstNo}
                    onChange={(val) => handleChange({ target: { name: 'gstNo', value: val } })}
                    fieldName="gstNo"
                    placeholder="27ABCDE1234F1Z5"
                    inputClassName={`input ${errors.gstNo ? 'border-danger-400' : ''}`}
                  />
                  {errors.gstNo ? <span className="text-xs text-danger-600">{errors.gstNo}</span> : null}
                </Field>
                <Field label="Business Unit">
                  <input
                    name="businessUnit"
                    value={form.businessUnit}
                    onChange={handleChange}
                    className="input"
                    placeholder="Business unit"
                  />
                </Field>
                <Field label="Segment" required>
                  <select name="segment" value={form.segment} onChange={handleChange} className={`input ${errors.segment ? 'border-danger-400' : ''}`}>
                    <option value="">Select Segment</option>
                    {masterOptions.segments.map((segment) => (
                      <option key={segment} value={segment}>
                        {segment}
                      </option>
                    ))}
                  </select>
                  {errors.segment ? <span className="text-xs text-danger-600">{errors.segment}</span> : null}
                </Field>
                <Field label="Zone" required>
                  <select name="zone" value={form.zone} onChange={handleChange} className={`input ${errors.zone ? 'border-danger-400' : ''}`}>
                    <option value="">Select Zone</option>
                    {masterOptions.zones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                  {errors.zone ? <span className="text-xs text-danger-600">{errors.zone}</span> : null}
                </Field>
                
              </div>
            </Section>

          <Section title="PO Details" description="Exact PO header fields from the excel template." badge="Mandatory">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Contract Agreement No">
                  <input
                    name="contractAgreementNo"
                    value={form.contractAgreementNo}
                    onChange={handleChange}
                    className="input"
                    placeholder="Contract Agreement No"
                  />
                </Field>
                <Field label="Contract Agreement Date">
                  <input
                    type="date"
                    name="contractAgreementDate"
                    value={form.contractAgreementDate}
                    onChange={handleChange}
                    className="input"
                  />
                </Field>
                <Field label="Purchase Order No" required>
                  <input
                    name="poNo"
                    value={form.poNo}
                    onChange={handleChange}
                    className={`input ${errors.poNo ? 'border-danger-400' : ''}`}
                    placeholder="PO-0001"
                  />
                  {errors.poNo ? <span className="text-xs text-danger-600">{errors.poNo}</span> : null}
                </Field>
                <Field label="Purchase Order Date" required>
                  <input
                    type="date"
                    name="poDate"
                    value={form.poDate}
                    onChange={handleChange}
                    className={`input ${errors.poDate ? 'border-danger-400' : ''}`}
                  />
                  {errors.poDate ? <span className="text-xs text-danger-600">{errors.poDate}</span> : null}
                </Field>
                <Field label="Letter of Intent No">
                  <input
                    name="letterOfIntentNo"
                    value={form.letterOfIntentNo}
                    onChange={handleChange}
                    className="input"
                    placeholder="Letter of Intent No"
                  />
                </Field>
                <Field label="Letter of Intent Date">
                  <input
                    type="date"
                    name="letterOfIntentDate"
                    value={form.letterOfIntentDate}
                    onChange={handleChange}
                    className="input"
                  />
                </Field>
                <Field label="Letter of Award No">
                  <input
                    name="letterOfAwardNo"
                    value={form.letterOfAwardNo}
                    onChange={handleChange}
                    className="input"
                    placeholder="Letter of Award No"
                  />
                </Field>
                <Field label="Letter of Award Date">
                  <input
                    type="date"
                    name="letterOfAwardDate"
                    value={form.letterOfAwardDate}
                    onChange={handleChange}
                    className="input"
                  />
                </Field>
                <Field label="Tender Reference No">
                  <input
                    name="tenderReferenceNo"
                    value={form.tenderReferenceNo}
                    onChange={handleChange}
                    className="input"
                    placeholder="Tender Reference No"
                  />
                </Field>
                <Field label="Tender Date">
                  <input
                    type="date"
                    name="tenderDate"
                    value={form.tenderDate}
                    onChange={handleChange}
                    className="input"
                  />
                </Field>
                <Field label="Project Description">
                  <textarea
                    name="projectDescription"
                    value={form.projectDescription}
                    onChange={handleChange}
                    rows={3}
                    className="input min-h-[88px]"
                    placeholder="Project description"
                  />
                </Field>
                <Field label="Payment Type" required>
                  <select
                    name="paymentType"
                    value={form.paymentType}
                    onChange={handleChange}
                    className={`input ${errors.paymentType ? 'border-danger-400' : ''}`}
                  >
                    <option value="">Select Payment Type</option>
                    {masterOptions.paymentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.paymentType ? <span className="text-xs text-danger-600">{errors.paymentType}</span> : null}
                </Field>
                <Field label="Payment Terms" required hint="Sourced from payment-term master.">
                  <select
                    name="paymentTerms"
                    value={form.paymentTerms}
                    onChange={handleChange}
                    className={`input ${errors.paymentTerms ? 'border-danger-400' : ''}`}
                  >
                    <option value="">Select Payment Terms</option>
                    {masterOptions.paymentTerms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                  {errors.paymentTerms ? <span className="text-xs text-danger-600">{errors.paymentTerms}</span> : null}
                </Field>
                <Field label="Payment Terms Clause in PO">
                  <textarea
                    name="paymentTermsClauseInPO"
                    value={form.paymentTermsClauseInPO}
                    onChange={handleChange}
                    rows={3}
                    className="input min-h-[88px]"
                    placeholder="Payment terms clause in PO"
                  />
                </Field>
                  </div>
            </Section>

          <Section title="Tender & Agreement" description="Legal references tied to the PO.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Delivery Schedule Clause">
                    <textarea
                      name="deliveryScheduleClause"
                      value={form.deliveryScheduleClause}
                      onChange={handleChange}
                      rows={3}
                      className="input min-h-[88px]"
                      placeholder="Delivery schedule clause"
                    />
                  </Field>
                  <Field label="Liquidated Damages Clause">
                    <textarea
                      name="liquidatedDamagesClause"
                      value={form.liquidatedDamagesClause}
                      onChange={handleChange}
                      rows={3}
                      className="input min-h-[88px]"
                      placeholder="Liquidated damages clause"
                    />
                  </Field>
                  <Field label="Last Date of Delivery">
                    <input
                      type="date"
                      name="lastDateOfDelivery"
                      value={form.lastDateOfDelivery}
                      onChange={handleChange}
                      className="input"
                    />
                  </Field>
                  <Field label="PO Validity">
                    <input
                      type="date"
                      name="poValidity"
                      value={form.poValidity}
                      onChange={handleChange}
                      className="input"
                    />
                  </Field>
                  <Field label="PO Signed Concern Name">
                    <input 
                      name="poSignedConcernName" 
                      value={form.poSignedConcernName} 
                      onChange={handleChange} 
                      className="input"
                      placeholder="Name of the person/concern who signed the PO"
                    />
                  </Field>
                </div>
              </Section>
              
              <Section title="Insurance Details" description="Insurance policy information.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Insurance Type">
                    <select
                      name="insuranceType"
                      value={form.insuranceType}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Select Insurance Type</option>
                      {masterOptions.insuranceTypes?.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Policy No">
                    <input
                      name="policyNo"
                      value={form.policyNo}
                      onChange={handleChange}
                      className="input"
                      placeholder="Policy number"
                    />
                  </Field>
                  <Field label="Policy Date">
                    <input
                      type="date"
                      name="policyDate"
                      value={form.policyDate}
                      onChange={handleChange}
                      className="input"
                    />
                  </Field>
                  <Field label="Policy Company">
                    <input
                      name="policyCompany"
                      value={form.policyCompany}
                      onChange={handleChange}
                      className="input"
                      placeholder="Policy company name"
                    />
                  </Field>
                  <Field label="Policy Valid upto">
                    <input
                      type="date"
                      name="policyValidUpto"
                      value={form.policyValidUpto}
                      onChange={handleChange}
                      className="input"
                    />
                  </Field>
                  <Field label="Policy Clause in PO">
                    <textarea
                      name="policyClauseInPO"
                      value={form.policyClauseInPO}
                      onChange={handleChange}
                      rows={2}
                      className="input min-h-[60px]"
                      placeholder="Policy clause in PO"
                    />
                  </Field>
                  <Field label="Policy Remarks">
                    <textarea
                      name="policyRemarks"
                      value={form.policyRemarks}
                      onChange={handleChange}
                      rows={2}
                      className="input min-h-[60px]"
                      placeholder="Policy remarks"
                    />
                  </Field>
                </div>
              </Section>

          <Section title="Bank Guarantee" description="Track ABG and PBG instruments against this PO.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Bank Guarantee Type">
                    <select
                      name="bankGuaranteeType"
                      value={form.bankGuaranteeType}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="">Select Bank Guarantee Type</option>
                      {masterOptions.bankGuaranteeTypes?.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Bank Guarantee No">
                    <input
                      name="bankGuaranteeNo"
                      value={form.bankGuaranteeNo}
                      onChange={handleChange}
                      className="input"
                      placeholder="Bank guarantee number"
                    />
                  </Field>
                  <Field label="Bank Guarantee Date">
                    <input
                      type="date"
                      name="bankGuaranteeDate"
                      value={form.bankGuaranteeDate}
                      onChange={handleChange}
                      className="input"
                    />
                  </Field>
                  <Field label="Bank Guarantee Value">
                    <input
                      type="number"
                      name="bankGuaranteeValue"
                      value={form.bankGuaranteeValue}
                      onChange={handleChange}
                      className="input"
                      placeholder="Bank guarantee value"
                    />
                  </Field>
                  <Field label="Bank Name">
                    <input
                      name="bankName"
                      value={form.bankName}
                      onChange={handleChange}
                      className="input"
                      placeholder="Bank name"
                    />
                  </Field>
                  <Field label="Bank Guarantee Validity">
                    <input
                      type="date"
                      name="bankGuaranteeValidity"
                      value={form.bankGuaranteeValidity}
                      onChange={handleChange}
                      className="input"
                    />
                  </Field>
                  <Field label="Bank Guarantee Release & Validity Clause in PO">
                    <textarea
                      name="bankGuaranteeReleaseValidityClauseInPO"
                      value={form.bankGuaranteeReleaseValidityClauseInPO}
                      onChange={handleChange}
                      rows={2}
                      className="input min-h-[60px]"
                      placeholder="Bank guarantee release & validity clause in PO"
                    />
                  </Field>
                  <Field label="Bank Guarantee Remarks">
                    <textarea
                      name="bankGuaranteeRemarks"
                      value={form.bankGuaranteeRemarks}
                      onChange={handleChange}
                      rows={2}
                      className="input min-h-[60px]"
                      placeholder="Bank guarantee remarks"
                    />
                  </Field>
                </div>
              </Section>
              
          <Section title="Team Members" description="Sales and collection team members.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Sales Manager">
                    <select name="salesManager" value={form.salesManager} onChange={handleChange} className="input">
                      <option value="">Select Sales Manager</option>
                      {masterOptions.salesContacts.map((name) => (
                        <option key={`mgr-${name}`} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Sales Head">
                    <select name="salesHead" value={form.salesHead} onChange={handleChange} className="input">
                      <option value="">Select Sales Head</option>
                      {masterOptions.salesContacts.map((name) => (
                        <option key={`head-${name}`} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Business Head">
                    <input
                      name="businessHead"
                      value={form.businessHead}
                      onChange={handleChange}
                      className="input"
                      placeholder="Business head"
                    />
                  </Field>
                  <Field label="Project Manager">
                    <input
                      name="projectManager"
                      value={form.projectManager}
                      onChange={handleChange}
                      className="input"
                      placeholder="Project manager"
                    />
                  </Field>
                  <Field label="Project Head">
                    <input
                      name="projectHead"
                      value={form.projectHead}
                      onChange={handleChange}
                      className="input"
                      placeholder="Project head"
                    />
                  </Field>
                  <Field label="Collection Incharge">
                    <input
                      name="collectionIncharge"
                      value={form.collectionIncharge}
                      onChange={handleChange}
                      className="input"
                      placeholder="Collection incharge"
                    />
                  </Field>
                  <Field label="Sales Agent Name">
                    <input
                      name="salesAgentName"
                      value={form.salesAgentName}
                      onChange={handleChange}
                      className="input"
                      placeholder="Sales agent name"
                    />
                  </Field>
                  <Field label="Sales Agent Commission">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="salesAgentCommission"
                      value={form.salesAgentCommission}
                      onChange={handleChange}
                      className="input"
                      placeholder="Sales agent commission"
                    />
                  </Field>
                  <Field label="Collection Agent Name">
                    <input
                      name="collectionAgentName"
                      value={form.collectionAgentName}
                      onChange={handleChange}
                      className="input"
                      placeholder="Collection agent name"
                    />
                  </Field>
                  <Field label="Collection Agent Commission">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="collectionAgentCommission"
                      value={form.collectionAgentCommission}
                      onChange={handleChange}
                      className="input"
                      placeholder="Collection agent commission"
                    />
                  </Field>
                </div>
              </Section>

          <Section title="BOQ as per PO (Form)" description="Bill of Quantity details for the Purchase Order.">
            <div className="space-y-4">
              <div className="overflow-x-auto bg-white border-2 border-secondary-400 shadow-lg">
                <table className="w-full border-collapse" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <thead>
                    <tr className="bg-secondary-200 border-b-2 border-secondary-400">
                      <th className="border-r border-secondary-400 px-4 py-3 text-left text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '200px' }}>Material Description</th>
                      <th className="border-r border-secondary-400 px-4 py-3 text-center text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '80px' }}>Qty</th>
                      <th className="border-r border-secondary-400 px-4 py-3 text-center text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '80px' }}>UOM</th>
                      <th className="border-r border-secondary-400 px-4 py-3 text-center text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '100px' }}>Unit Price</th>
                      <th className="border-r border-secondary-400 px-4 py-3 text-center text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '100px' }}>Unit Cost</th>
                      <th className="border-r border-secondary-400 px-4 py-3 text-center text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '100px' }}>Freight</th>
                      <th className="border-r border-secondary-400 px-4 py-3 text-center text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '100px' }}>GST</th>
                      <th className="border-r border-secondary-400 px-4 py-3 text-center text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '120px' }}>Total Cost</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-secondary-900 uppercase" style={{ minWidth: '80px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map((item, index) => (
                      <tr key={index} className="border-b border-secondary-300 hover:bg-secondary-50">
                        <td className="border-r border-secondary-300 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-secondary-600 font-medium">{index + 1}</span>
                            <input
                              type="text"
                              value={item.materialDescription}
                              onChange={(e) => handleBOQItemChange(index, 'materialDescription', e.target.value)}
                              className="flex-1 px-2 py-1 border border-secondary-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                              placeholder="Enter material description"
                            />
                          </div>
                        </td>
                        <td className="border-r border-secondary-300 px-4 py-3">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleBOQItemChange(index, 'qty', e.target.value)}
                            className="w-full px-2 py-1 border border-secondary-300 rounded-none text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="border-r border-secondary-300 px-4 py-3">
                          <input
                            type="text"
                            value={item.uom}
                            onChange={(e) => handleBOQItemChange(index, 'uom', e.target.value)}
                            className="w-full px-2 py-1 border border-secondary-300 rounded-none text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            placeholder="UOM"
                          />
                        </td>
                        <td className="border-r border-secondary-300 px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleBOQItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full px-2 py-1 border border-secondary-300 rounded-none text-right focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border-r border-secondary-300 px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => handleBOQItemChange(index, 'unitCost', e.target.value)}
                            className="w-full px-2 py-1 border border-secondary-300 rounded-none text-right focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border-r border-secondary-300 px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.freight}
                            onChange={(e) => handleBOQItemChange(index, 'freight', e.target.value)}
                            className="w-full px-2 py-1 border border-secondary-300 rounded-none text-right focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border-r border-secondary-300 px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.gst}
                            onChange={(e) => handleBOQItemChange(index, 'gst', e.target.value)}
                            className="w-full px-2 py-1 border border-secondary-300 rounded-none text-right focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border-r border-secondary-300 px-4 py-3">
                          <input
                            type="text"
                            value={item.totalCost || '0.00'}
                            readOnly
                            className="w-full px-2 py-1 border border-secondary-300 rounded-none text-right font-semibold bg-secondary-100 text-secondary-900"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {boqItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBOQItem(index)}
                              className="text-danger-600 hover:text-danger-800 p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-secondary-200 border-t-2 border-secondary-400 font-bold">
                      <td colSpan="7" className="border-r border-secondary-400 px-4 py-3 text-right text-secondary-900">Total</td>
                      <td className="border-r border-secondary-400 px-4 py-3 text-right">
                        <input
                          type="text"
                          value={form.totalPOValue || '0.00'}
                          readOnly
                          className="w-full px-2 py-1 border-2 border-secondary-400 rounded-none text-right font-bold bg-white text-secondary-900"
                        />
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={addBOQItem}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-300 hover:bg-primary-100 rounded"
                >
                  <Plus className="h-4 w-4" />
                  Add line item
                </button>
              </div>
            </div>
          </Section>
              
          <Section title="Summary" description="Financial summary of the PO." badge="Finance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Total Ex Works">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="totalExWorks"
                      value={form.totalExWorks}
                      onChange={handleChange}
                      readOnly={boqEnabled}
                      className={`input ${errors.totalExWorks ? 'border-danger-400' : ''} ${boqEnabled ? 'bg-secondary-50' : ''}`}
                    />
                    {errors.totalExWorks ? <span className="text-xs text-danger-600">{errors.totalExWorks}</span> : null}
                  </Field>
                  <Field label="Total Freight Amount">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="totalFreightAmount"
                      value={form.totalFreightAmount}
                      onChange={handleChange}
                      readOnly={boqEnabled}
                      className={`input ${errors.totalFreightAmount ? 'border-danger-400' : ''} ${boqEnabled ? 'bg-secondary-50' : ''}`}
                    />
                    {errors.totalFreightAmount ? <span className="text-xs text-danger-600">{errors.totalFreightAmount}</span> : null}
                  </Field>
                  <Field label="GST">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="gst"
                      value={form.gst}
                      onChange={handleChange}
                      readOnly={boqEnabled}
                      className={`input ${errors.gst ? 'border-danger-400' : ''} ${boqEnabled ? 'bg-secondary-50' : ''}`}
                    />
                    {errors.gst ? <span className="text-xs text-danger-600">{errors.gst}</span> : null}
                  </Field>
                  <Field label="Total PO Value" required>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="totalPOValue"
                      value={form.totalPOValue}
                      onChange={handleChange}
                      readOnly={boqEnabled}
                      className={`input font-semibold ${errors.totalPOValue ? 'border-danger-400' : ''} ${boqEnabled ? 'bg-secondary-50' : ''}`}
                    />
                    {errors.totalPOValue ? <span className="text-xs text-danger-600">{errors.totalPOValue}</span> : null}
                  </Field>
                </div>
              </Section>

          {Object.keys(errors).length > 0 ? (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Some required fields are missing or invalid. Please review the sections highlighted above.
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-secondary-200 pt-4">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 px-8 py-3 text-base font-semibold text-white shadow-[0_15px_30px_-10px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_25px_45px_-15px_rgba(15,23,42,0.55)] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Saving PO Entry...' : 'Submit PO Entry'}
              </button>
            </div>
            <span className="text-sm text-secondary-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success-500" />
              All entries are stored against the authenticated user and can be exported later.
            </span>
          </div>
        </form>

        {/* Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => !isSubmitting && setConfirmOpen(false)} />
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-secondary-200">
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-semibold text-secondary-900">Save PO Entry?</h3>
                <p className="text-sm text-secondary-600">
                  Your purchase order will be saved and appear in the PO Entry list.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-secondary-300 px-4 py-2 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => setConfirmOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={saveEntry}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </DashboardLayout>
  )
}

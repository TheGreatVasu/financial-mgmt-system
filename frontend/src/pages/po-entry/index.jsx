import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import SmartDropdown from '../../components/ui/SmartDropdown.jsx'

import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import { createPOEntryService } from '../../services/poEntryService'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, ExternalLink, Info, Loader2 } from 'lucide-react'

const initialForm = {
  poNo: '',
  poDate: '',
  customerName: '',
  customerAddress: '',
  country: '',
  state: '',
  zone: '',
  segment: '',
  businessType: '',
  salesManager: '',
  salesHead: '',
  agentName: '',
  agentCommission: '',
  gstNo: '',
  gst: '',
  totalExWorks: '',
  freightAmount: '',
  totalPOValue: '',
  paymentType: '',
  paymentTerms: '',
  deliverySchedule: '',
  description: '',
  tenderReferenceNo: '',
  tenderDate: '',
  contractAgreementNo: '',
  caDate: '',
  poSignedConcernName: '',
  performanceBankGuaranteeNo: '',
  pbgDate: '',
  advanceBankGuaranteeNo: '',
  abgDate: '',
  boqAsPerPO: ''
}

const numericFields = ['agentCommission', 'gst', 'totalExWorks', 'freightAmount', 'totalPOValue']
const requiredFields = [
  'poNo',
  'poDate',
  'customerName',
  'customerAddress',
  'country',
  'state',
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
  segments: ['Infrastructure', 'Industrial', 'Residential', 'Government', 'Retail'],
  zones: ['North', 'South', 'East', 'West', 'Central'],
  businessTypes: ['EPC', 'OEM', 'Dealer', 'Direct', 'Distributor'],
  paymentTerms: ['Advance', 'Milestone Based', 'Net 30', 'Net 45', 'Net 60'],
  paymentTypes: ['Supply', 'Service', 'Turnkey', 'AMC', 'Custom'],
  countries: ['India']
}

const STEPS = [
  { title: 'Customer Details', description: 'Pull customer metadata directly from the master data module.' },
  { title: 'PO Details', description: 'Exact PO header fields from the excel template.' },
  { title: 'Tender & Agreement', description: 'Legal references tied to the PO.' },
  { title: 'Bank Guarantee', description: 'Track ABG and PBG instruments against this PO.' },
  { title: 'Financial Details', description: 'Exact numbers from the PO excel sheet.' },
]

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
  const [currentStep, setCurrentStep] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [masterOptions, setMasterOptions] = useState({
    customers: [],
    segments: fallbackMasterSeeds.segments,
    zones: fallbackMasterSeeds.zones,
    businessTypes: fallbackMasterSeeds.businessTypes,
    paymentTerms: fallbackMasterSeeds.paymentTerms,
    paymentTypes: fallbackMasterSeeds.paymentTypes,
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
      setCurrentStep(0)
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
          setCurrentStep(0)
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
      customerAddress: selected?.customerAddress || selected?.address || prev.customerAddress,
      country: selected?.country || prev.country || 'India',
      state: selected?.state || prev.state || '',
      zone: selected?.zone || prev.zone || '',
      segment: selected?.segment || prev.segment || '',
      businessType: selected?.businessType || prev.businessType || '',
      gstNo: selected?.gstNumber || prev.gstNo,
      paymentTerms: prev.paymentTerms || paymentTerm,
      salesManager: prev.salesManager || selected?.salesManager || contactByRole('sales_manager'),
      salesHead: prev.salesHead || selected?.salesHead || contactByRole('sales_head')
    }))
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
      const payload = { ...form }
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
      setCurrentStep(0)
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
    const isLastStep = currentStep === STEPS.length - 1

    // If not on last step, move forward instead of submitting
    if (!isLastStep) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
      return
    }

    if (!validateForm()) {
      toast.error('Please resolve validation errors.')
      return
    }

    // Show confirmation pop on final save
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
  
        {/* HEADER + STEPS BOX */}
        <div className="rounded-2xl border border-secondary-200 bg-gradient-to-r from-primary-50 via-white to-secondary-50 p-6 shadow-sm space-y-4 relative">
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
            <div className="flex justify-end w-full lg:w-auto">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-secondary-700">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{Math.round((currentStep / Math.max(1, STEPS.length - 1)) * 100)}% complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out"
                style={{ width: `${Math.round((currentStep / Math.max(1, STEPS.length - 1)) * 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {STEPS.map((step, idx) => {
                const isCurrent = idx === currentStep
                const isPast = idx < currentStep
                const canNavigate = isPast
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => canNavigate && setCurrentStep(idx)}
                    className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all focus:outline-none ${
                      isCurrent
                        ? 'border-primary-300 bg-white shadow-sm'
                        : isPast
                        ? 'border-success-200 bg-success-50'
                        : 'border-secondary-200 bg-white'
                    } ${canNavigate || isCurrent ? 'hover:-translate-y-0.5 hover:shadow-md' : 'cursor-not-allowed opacity-70'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                          isCurrent
                            ? 'border-primary-500 text-primary-700 bg-primary-50'
                            : isPast
                            ? 'border-success-500 text-success-700 bg-success-50'
                            : 'border-secondary-200 text-secondary-500 bg-secondary-50'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="text-sm font-semibold text-secondary-900">{step.title}</div>
                    </div>
                    <div className="text-xs text-secondary-500">{step.description}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 0 && (
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
                <Field label="State" required>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={`input ${errors.state ? 'border-danger-400' : ''}`}
                  />
                  {errors.state ? <span className="text-xs text-danger-600">{errors.state}</span> : null}
                </Field>
                <Field label="Zone">
                  <select name="zone" value={form.zone} onChange={handleChange} className="input">
                    <option value="">Select Zone</option>
                    {masterOptions.zones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Segment">
                  <select name="segment" value={form.segment} onChange={handleChange} className="input">
                    <option value="">Select Segment</option>
                    {masterOptions.segments.map((segment) => (
                      <option key={segment} value={segment}>
                        {segment}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Business Type">
                  <select name="businessType" value={form.businessType} onChange={handleChange} className="input">
                    <option value="">Select Business Type</option>
                    {masterOptions.businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="GST No">
                  <SmartDropdown
                    value={form.gstNo}
                    onChange={(val) => handleChange({ target: { name: 'gstNo', value: val } })}
                    fieldName="gstNo"
                    placeholder="27ABCDE1234F1Z5"
                    inputClassName="input"
                  />
                </Field>
                <Field label="Sales Manager">
                  <select name="salesManager" value={form.salesManager} onChange={handleChange} className="input">
                    <option value="">Select Manager</option>
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
                <Field label="Agent Name">
                  <input name="agentName" value={form.agentName} onChange={handleChange} className="input" />
                </Field>
                <Field label="Agent Commission">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="agentCommission"
                    value={form.agentCommission}
                    onChange={handleChange}
                    className="input"
                    placeholder="In percentage or value"
                  />
                </Field>
              </div>
            </Section>
          )}

          {currentStep === 1 && (
            <Section title="PO Details" description="Exact PO header fields from the excel template." badge="Mandatory">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="PO No" required>
                  <input
                    name="poNo"
                    value={form.poNo}
                    onChange={handleChange}
                    className={`input ${errors.poNo ? 'border-danger-400' : ''}`}
                    placeholder="PO-0001"
                  />
                  {errors.poNo ? <span className="text-xs text-danger-600">{errors.poNo}</span> : null}
                </Field>
                <Field label="PO Date" required>
                  <input
                    type="date"
                    name="poDate"
                    value={form.poDate}
                    onChange={handleChange}
                    className={`input ${errors.poDate ? 'border-danger-400' : ''}`}
                  />
                  {errors.poDate ? <span className="text-xs text-danger-600">{errors.poDate}</span> : null}
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
                <Field label="Delivery Schedule">
                  <textarea
                    name="deliverySchedule"
                    value={form.deliverySchedule}
                    onChange={handleChange}
                    rows={3}
                    className="input min-h-[88px]"
                  />
                </Field>
                <Field label="Description">
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input min-h-[88px]" />
                </Field>
                  </div>
            </Section>
          )}

          {currentStep === 2 && (
            <Section title="Tender & Agreement" description="Legal references tied to the PO.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Tender Reference No">
                  <input name="tenderReferenceNo" value={form.tenderReferenceNo} onChange={handleChange} className="input" />
                </Field>
                <Field label="Tender Date">
                  <input type="date" name="tenderDate" value={form.tenderDate} onChange={handleChange} className="input" />
                </Field>
                <Field label="Contract Agreement No">
                  <input name="contractAgreementNo" value={form.contractAgreementNo} onChange={handleChange} className="input" />
                </Field>
                <Field label="CA Date">
                  <input type="date" name="caDate" value={form.caDate} onChange={handleChange} className="input" />
                </Field>
                <Field label="PO Signed Concern Name">
                  <input name="poSignedConcernName" value={form.poSignedConcernName} onChange={handleChange} className="input" />
                </Field>
                </div>
            </Section>
          )}

          {currentStep === 3 && (
            <Section title="Bank Guarantee" description="Track ABG and PBG instruments against this PO.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Performance Bank Guarantee No">
                  <input
                    name="performanceBankGuaranteeNo"
                    value={form.performanceBankGuaranteeNo}
                    onChange={handleChange}
                    className="input"
                  />
                </Field>
                <Field label="PBG Date">
                  <input type="date" name="pbgDate" value={form.pbgDate} onChange={handleChange} className="input" />
                </Field>
                <Field label="Advance Bank Guarantee No">
                  <input
                    name="advanceBankGuaranteeNo"
                    value={form.advanceBankGuaranteeNo}
                    onChange={handleChange}
                    className="input"
                  />
                </Field>
                <Field label="ABG Date">
                  <input type="date" name="abgDate" value={form.abgDate} onChange={handleChange} className="input" />
                </Field>
              </div>
            </Section>
          )}

          {currentStep === 4 && (
            <Section title="Financial Details" description="Exact numbers from the PO excel sheet." badge="Finance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="GST No">
                  <input name="gstNo" value={form.gstNo} onChange={handleChange} className="input" placeholder="27ABCDE1234F1Z5" />
                </Field>
                <Field label="GST (%)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="gst"
                    value={form.gst}
                    onChange={handleChange}
                    className={`input ${errors.gst ? 'border-danger-400' : ''}`}
                  />
                  {errors.gst ? <span className="text-xs text-danger-600">{errors.gst}</span> : null}
                </Field>
                <Field label="Total Ex Works">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="totalExWorks"
                    value={form.totalExWorks}
                    onChange={handleChange}
                    className={`input ${errors.totalExWorks ? 'border-danger-400' : ''}`}
                              />
                  {errors.totalExWorks ? <span className="text-xs text-danger-600">{errors.totalExWorks}</span> : null}
                </Field>
                <Field label="Freight Amount">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="freightAmount"
                    value={form.freightAmount}
                    onChange={handleChange}
                    className={`input ${errors.freightAmount ? 'border-danger-400' : ''}`}
                  />
                  {errors.freightAmount ? <span className="text-xs text-danger-600">{errors.freightAmount}</span> : null}
                </Field>
                <Field label="Total PO Value" required>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="totalPOValue"
                    value={form.totalPOValue}
                    onChange={handleChange}
                    className={`input ${errors.totalPOValue ? 'border-danger-400' : ''}`}
                  />
                  {errors.totalPOValue ? <span className="text-xs text-danger-600">{errors.totalPOValue}</span> : null}
                </Field>
                <Field label="BOQ as per PO">
                  <textarea name="boqAsPerPO" value={form.boqAsPerPO} onChange={handleChange} rows={3} className="input min-h-[88px]" />
                </Field>
                                    </div>
            </Section>
          )}

          {Object.keys(errors).length > 0 ? (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Some required fields are missing or invalid. Please review the sections highlighted above.
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-secondary-200 pt-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-secondary-300 px-4 py-2 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 px-8 py-3 text-base font-semibold text-white shadow-[0_15px_30px_-10px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_25px_45px_-15px_rgba(15,23,42,0.55)] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {currentStep === STEPS.length - 1 ? (isSubmitting ? 'Saving PO Entry...' : 'Save PO Entry') : 'Next'}
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

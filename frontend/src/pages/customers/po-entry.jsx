import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { Save, Download, ArrowLeft, FileSpreadsheet, Eye, Printer, HelpCircle, RotateCcw, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createApiClient } from '../../services/apiClient'

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

export default function CustomerPOEntry() {
  const navigate = useNavigate()
  const { token } = useAuthContext()
  const [formError, setFormError] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [boqEnabled, setBoqEnabled] = useState(false)
  const [boqItems, setBoqItems] = useState([emptyBOQItem()])
  
  const validateEmail = (email) => {
    return /@([a-zA-Z0-9-]+\.)?(financialmgmt\.com|gmail\.com)$/.test(email)
  }

  const validatePhone = (phone) => {
    return /^\+?\d{7,15}$/.test(phone || '')
  }
  
  const [formData, setFormData] = useState({
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
    
    // Summary
    totalExWorks: '',
    totalFreightAmount: '',
    gst: '',
    totalPOValue: ''
  })

  const [loading, setLoading] = useState(false)
  const [showExcelView, setShowExcelView] = useState(false)
  
  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
      
      return updated
    })
  }

  function addBOQItem() {
    setBoqItems(prev => [...prev, emptyBOQItem()])
  }

  function removeBOQItem(index) {
    if (boqItems.length > 1) {
      setBoqItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  function calculateSummary() {
    const totalExWorks = boqItems.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0
      const unitCost = parseFloat(item.unitCost) || 0
      return sum + (qty * unitCost)
    }, 0)
    
    const totalFreight = boqItems.reduce((sum, item) => {
      return sum + (parseFloat(item.freight) || 0)
    }, 0)
    
    const totalGST = boqItems.reduce((sum, item) => {
      return sum + (parseFloat(item.gst) || 0)
    }, 0)
    
    const totalPOValue = totalExWorks + totalFreight + totalGST
    
    setFormData(prev => ({
      ...prev,
      totalExWorks: totalExWorks.toFixed(2),
      totalFreightAmount: totalFreight.toFixed(2),
      gst: totalGST.toFixed(2),
      totalPOValue: totalPOValue.toFixed(2)
    }))
  }

  // Recalculate summary when BOQ items change
  useMemo(() => {
    if (boqEnabled && boqItems.length > 0) {
      calculateSummary()
    }
  }, [boqItems, boqEnabled])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    try {
      const api = createApiClient(token)
      const payload = {
        ...formData,
        boqEnabled,
        boqItems: boqEnabled ? boqItems : []
      }

      const response = await api.post('/customers/po-entry', payload)
      toast.success('PO Entry saved successfully!')
      navigate('/customers')
    } catch (error) {
      setFormError(error?.response?.data?.message || 'Failed to save PO entry')
      toast.error(error?.response?.data?.message || 'Failed to save PO entry')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDraft() {
    setIsSavingDraft(true)
    try {
      const api = createApiClient(token)
      const payload = {
        ...formData,
        boqEnabled,
        boqItems: boqEnabled ? boqItems : [],
        status: 'draft'
      }
      await api.post('/customers/po-entry/draft', payload)
      toast.success('Draft saved successfully!')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  function resetForm() {
    setFormData({
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
      paymentType: '',
      paymentTerms: '',
      paymentTermsClauseInPO: '',
      insuranceType: '',
      policyNo: '',
      policyDate: '',
      policyCompany: '',
      policyValidUpto: '',
      policyClauseInPO: '',
      policyRemarks: '',
      bankGuaranteeType: '',
      bankGuaranteeNo: '',
      bankGuaranteeDate: '',
      bankGuaranteeValue: '',
      bankName: '',
      bankGuaranteeValidity: '',
      bankGuaranteeReleaseValidityClauseInPO: '',
      bankGuaranteeRemarks: '',
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
      deliveryScheduleClause: '',
      liquidatedDamagesClause: '',
      lastDateOfDelivery: '',
      poValidity: '',
      poSignedConcernName: '',
      totalExWorks: '',
      totalFreightAmount: '',
      gst: '',
      totalPOValue: ''
    })
    setBoqItems([emptyBOQItem()])
    setBoqEnabled(false)
    toast.success('Form reset successfully!')
  }

  function handlePrint() {
    window.print()
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">PO Entry Form</h1>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBoqEnabled(!boqEnabled)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                boqEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' 
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
              }`}
            >
              {boqEnabled ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
              BOQ {boqEnabled ? 'Enabled' : 'Disabled'}
            </button>
            
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {isSavingDraft ? 'Saving...' : 'Save as Draft'}
            </button>
            
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>

            <button
              type="submit"
              form="po-entry-form"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 mr-2 -ml-1 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save PO
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form */}
        <form id="po-entry-form" onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}

          {/* Customer Details Section */}
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Customer Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Legal Entity Name *</label>
                  <input
                    type="text"
                    name="legalEntityName"
                    value={formData.legalEntityName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Customer Address *</label>
                  <textarea
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">District *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Pin Code *</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">GST No *</label>
                  <input
                    type="text"
                    name="gstNo"
                    value={formData.gstNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Business Unit</label>
                  <input
                    type="text"
                    name="businessUnit"
                    value={formData.businessUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Segment *</label>
                  <select
                    name="segment"
                    value={formData.segment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Segment</option>
                    <option value="Domestic">Domestic</option>
                    <option value="Export">Export</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Zone *</label>
                  <select
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Zone</option>
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contract and Purchase Order Details */}
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Contract and Purchase Order Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Contract Agreement No</label>
                  <input
                    type="text"
                    name="contractAgreementNo"
                    value={formData.contractAgreementNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Contract Agreement Date</label>
                  <input
                    type="date"
                    name="contractAgreementDate"
                    value={formData.contractAgreementDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Purchase Order No *</label>
                  <input
                    type="text"
                    name="poNo"
                    value={formData.poNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Purchase Order Date *</label>
                  <input
                    type="date"
                    name="poDate"
                    value={formData.poDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Letter of Intent No</label>
                  <input
                    type="text"
                    name="letterOfIntentNo"
                    value={formData.letterOfIntentNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Letter of Intent Date</label>
                  <input
                    type="date"
                    name="letterOfIntentDate"
                    value={formData.letterOfIntentDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Letter of Award No</label>
                  <input
                    type="text"
                    name="letterOfAwardNo"
                    value={formData.letterOfAwardNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Letter of Award Date</label>
                  <input
                    type="date"
                    name="letterOfAwardDate"
                    value={formData.letterOfAwardDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Tender Reference No</label>
                  <input
                    type="text"
                    name="tenderReferenceNo"
                    value={formData.tenderReferenceNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Tender Date</label>
                  <input
                    type="date"
                    name="tenderDate"
                    value={formData.tenderDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Project Description</label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Payment Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Payment Type *</label>
                  <select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Payment Type</option>
                    <option value="Secured">Secured</option>
                    <option value="Unsecured">Unsecured</option>
                    <option value="Govt">Govt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Payment Terms</label>
                  <input
                    type="text"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Payment Terms Clause in PO</label>
                  <textarea
                    name="paymentTermsClauseInPO"
                    value={formData.paymentTermsClauseInPO}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Details */}
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Insurance Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Insurance Type</label>
                  <select
                    name="insuranceType"
                    value={formData.insuranceType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Insurance Type</option>
                    <option value="Marine Insurance">Marine Insurance</option>
                    <option value="Group Accidental Policy">Group Accidental Policy</option>
                    <option value="Workmen Compensation Policy">Workmen Compensation Policy</option>
                    <option value="All Erection Policy">All Erection Policy</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Policy No</label>
                  <input
                    type="text"
                    name="policyNo"
                    value={formData.policyNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Policy Date</label>
                  <input
                    type="date"
                    name="policyDate"
                    value={formData.policyDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Policy Company</label>
                  <input
                    type="text"
                    name="policyCompany"
                    value={formData.policyCompany}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Policy Valid upto</label>
                  <input
                    type="date"
                    name="policyValidUpto"
                    value={formData.policyValidUpto}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Policy Clause in PO</label>
                  <textarea
                    name="policyClauseInPO"
                    value={formData.policyClauseInPO}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Policy Remarks</label>
                  <textarea
                    name="policyRemarks"
                    value={formData.policyRemarks}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Guarantee Details */}
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Bank Guarantee Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Guarantee Type</label>
                  <select
                    name="bankGuaranteeType"
                    value={formData.bankGuaranteeType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Bank Guarantee Type</option>
                    <option value="Advance Bank Guarantee">Advance Bank Guarantee</option>
                    <option value="Performance Bank Guarantee">Performance Bank Guarantee</option>
                    <option value="Bid Security">Bid Security</option>
                    <option value="Retention">Retention</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Guarantee No</label>
                  <input
                    type="text"
                    name="bankGuaranteeNo"
                    value={formData.bankGuaranteeNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Guarantee Date</label>
                  <input
                    type="date"
                    name="bankGuaranteeDate"
                    value={formData.bankGuaranteeDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Guarantee Value</label>
                  <input
                    type="number"
                    name="bankGuaranteeValue"
                    value={formData.bankGuaranteeValue}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Guarantee Validity</label>
                  <input
                    type="date"
                    name="bankGuaranteeValidity"
                    value={formData.bankGuaranteeValidity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Guarantee Release & Validity Clause in PO</label>
                  <textarea
                    name="bankGuaranteeReleaseValidityClauseInPO"
                    value={formData.bankGuaranteeReleaseValidityClauseInPO}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Guarantee Remarks</label>
                  <textarea
                    name="bankGuaranteeRemarks"
                    value={formData.bankGuaranteeRemarks}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Team Members</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Sales Manager</label>
                  <input
                    type="text"
                    name="salesManager"
                    value={formData.salesManager}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Sales Head</label>
                  <input
                    type="text"
                    name="salesHead"
                    value={formData.salesHead}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Business Head</label>
                  <input
                    type="text"
                    name="businessHead"
                    value={formData.businessHead}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Project Manager</label>
                  <input
                    type="text"
                    name="projectManager"
                    value={formData.projectManager}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Project Head</label>
                  <input
                    type="text"
                    name="projectHead"
                    value={formData.projectHead}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Collection Incharge</label>
                  <input
                    type="text"
                    name="collectionIncharge"
                    value={formData.collectionIncharge}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Sales Agent Name</label>
                  <input
                    type="text"
                    name="salesAgentName"
                    value={formData.salesAgentName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Sales Agent Commission</label>
                  <input
                    type="number"
                    name="salesAgentCommission"
                    value={formData.salesAgentCommission}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Collection Agent Name</label>
                  <input
                    type="text"
                    name="collectionAgentName"
                    value={formData.collectionAgentName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Collection Agent Commission</label>
                  <input
                    type="number"
                    name="collectionAgentCommission"
                    value={formData.collectionAgentCommission}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Additional Fields</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Delivery Schedule Clause</label>
                  <textarea
                    name="deliveryScheduleClause"
                    value={formData.deliveryScheduleClause}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Liquidated Damages Clause</label>
                  <textarea
                    name="liquidatedDamagesClause"
                    value={formData.liquidatedDamagesClause}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Last Date of Delivery</label>
                  <input
                    type="date"
                    name="lastDateOfDelivery"
                    value={formData.lastDateOfDelivery}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">PO Validity</label>
                  <input
                    type="date"
                    name="poValidity"
                    value={formData.poValidity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">PO Signed Concern Name</label>
                  <input
                    type="text"
                    name="poSignedConcernName"
                    value={formData.poSignedConcernName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOQ Section */}
          {boqEnabled && (
            <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">BOQ as per PO</h2>
                <button
                  type="button"
                  onClick={addBOQItem}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Line Item
                </button>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Material Description</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Qty</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">UOM</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Unit Cost</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Freight</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">GST</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Total Cost</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            value={item.materialDescription}
                            onChange={(e) => handleBOQItemChange(index, 'materialDescription', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleBOQItemChange(index, 'qty', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            value={item.uom}
                            onChange={(e) => handleBOQItemChange(index, 'uom', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleBOQItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => handleBOQItemChange(index, 'unitCost', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="number"
                            value={item.freight}
                            onChange={(e) => handleBOQItemChange(index, 'freight', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="number"
                            value={item.gst}
                            onChange={(e) => handleBOQItemChange(index, 'gst', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            value={item.totalCost}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-200 rounded bg-gray-50"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {boqItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBOQItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan="7" className="border border-gray-300 px-3 py-2 text-right">Total</td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={formData.totalPOValue}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-200 rounded bg-gray-50 font-semibold"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Total Ex Works</label>
                  <input
                    type="number"
                    name="totalExWorks"
                    value={formData.totalExWorks}
                    onChange={handleChange}
                    readOnly={boqEnabled}
                    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${boqEnabled ? 'bg-gray-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Total Freight Amount</label>
                  <input
                    type="number"
                    name="totalFreightAmount"
                    value={formData.totalFreightAmount}
                    onChange={handleChange}
                    readOnly={boqEnabled}
                    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${boqEnabled ? 'bg-gray-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">GST</label>
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst}
                    onChange={handleChange}
                    readOnly={boqEnabled}
                    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${boqEnabled ? 'bg-gray-50' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Total PO Value *</label>
                  <input
                    type="number"
                    name="totalPOValue"
                    value={formData.totalPOValue}
                    onChange={handleChange}
                    readOnly={boqEnabled}
                    required
                    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold ${boqEnabled ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="px-6 py-2 rounded-lg text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save PO Entry'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

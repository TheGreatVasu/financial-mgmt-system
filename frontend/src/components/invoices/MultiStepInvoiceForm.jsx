import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createApiClient } from '../../services/apiClient'
import Step1Header from './steps/Step1Header'
import Step2ItemTax from './steps/Step2ItemTax'
import Step3Logistics from './steps/Step3Logistics'
import Step4FirstDue from './steps/Step4FirstDue'
import Step5SecondDue from './steps/Step5SecondDue'
import Step6ThirdDueSummary from './steps/Step6ThirdDueSummary'
import Step7Summary from './steps/Step7Summary'

const TOTAL_STEPS = 7

export default function MultiStepInvoiceForm({ invoice, onSubmit, onCancel }) {
  const { token } = useAuthContext()
  const [customers, setCustomers] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(() => {
    // Initialize all 107 fields
    const initial = {}
    
    // Step 1 - 14 fields
    initial.keyId = invoice?.keyId || invoice?.key_id || ''
    initial.gstTaxInvoiceNo = invoice?.gstTaxInvoiceNo || invoice?.gst_tax_invoice_no || ''
    initial.gstTaxInvoiceDate = invoice?.gstTaxInvoiceDate || invoice?.gst_tax_invoice_date || invoice?.issueDate || invoice?.issue_date || new Date().toISOString().split('T')[0]
    initial.internalInvoiceNo = invoice?.internalInvoiceNo || invoice?.internal_invoice_no || ''
    initial.invoiceType = invoice?.invoiceType || invoice?.invoice_type || ''
    initial.businessUnit = invoice?.businessUnit || invoice?.business_unit || ''
    initial.customerId = invoice?.customerId || invoice?.customer_id || ''
    initial.customerName = invoice?.customerName || invoice?.customer_name || ''
    initial.segment = invoice?.segment || ''
    initial.region = invoice?.region || ''
    initial.zone = invoice?.zone || ''
    initial.salesOrderNo = invoice?.salesOrderNo || invoice?.sales_order_no || ''
    initial.accountManagerName = invoice?.accountManagerName || invoice?.account_manager_name || ''
    initial.poNoReference = invoice?.poNoReference || invoice?.po_no_reference || ''
    initial.poDate = invoice?.poDate || invoice?.po_date || ''
    
    // Step 2 - 18 fields
    initial.materialDescriptionType = invoice?.materialDescriptionType || invoice?.material_description_type || ''
    initial.stateOfSupply = invoice?.stateOfSupply || invoice?.state_of_supply || ''
    initial.qty = invoice?.qty || invoice?.quantity || 0
    initial.unit = invoice?.unit || ''
    initial.currency = invoice?.currency || 'INR'
    initial.basicRate = invoice?.basicRate || invoice?.basic_rate || 0
    initial.basicValue = invoice?.basicValue || invoice?.basic_value || 0
    initial.freightInvoiceNo = invoice?.freightInvoiceNo || invoice?.freight_invoice_no || ''
    initial.freightRate = invoice?.freightRate || invoice?.freight_rate || 0
    initial.freightValue = invoice?.freightValue || invoice?.freight_value || 0
    initial.sgstOutput = invoice?.sgstOutput || invoice?.sgst_output || 0
    initial.cgstOutput = invoice?.cgstOutput || invoice?.cgst_output || 0
    initial.igstOutput = invoice?.igstOutput || invoice?.igst_output || 0
    initial.ugstOutput = invoice?.ugstOutput || invoice?.ugst_output || 0
    initial.totalGst = invoice?.totalGst || invoice?.total_gst || 0
    initial.tcs = invoice?.tcs || 0
    initial.subTotal = invoice?.subTotal || invoice?.sub_total || 0
    initial.totalInvoiceValue = invoice?.totalInvoiceValue || invoice?.total_invoice_value || 0
    
    // Step 3 - 33 fields
    initial.consigneeNameAddress = invoice?.consigneeNameAddress || invoice?.consignee_name_address || ''
    initial.consigneeCity = invoice?.consigneeCity || invoice?.consignee_city || ''
    initial.payerNameAddress = invoice?.payerNameAddress || invoice?.payer_name_address || ''
    initial.city = invoice?.city || ''
    initial.lorryReceiptNo = invoice?.lorryReceiptNo || invoice?.lorry_receipt_no || ''
    initial.lorryReceiptDate = invoice?.lorryReceiptDate || invoice?.lorry_receipt_date || ''
    initial.transporterName = invoice?.transporterName || invoice?.transporter_name || ''
    initial.deliveryChallanNo = invoice?.deliveryChallanNo || invoice?.delivery_challan_no || ''
    initial.deliveryChallanDate = invoice?.deliveryChallanDate || invoice?.delivery_challan_date || ''
    initial.materialInspectionRequestDate = invoice?.materialInspectionRequestDate || invoice?.material_inspection_request_date || ''
    initial.inspectionOfferDate = invoice?.inspectionOfferDate || invoice?.inspection_offer_date || ''
    initial.materialInspectionDate = invoice?.materialInspectionDate || invoice?.material_inspection_date || ''
    initial.deliveryInstructionDate = invoice?.deliveryInstructionDate || invoice?.delivery_instruction_date || ''
    initial.deliveryInspectionCipReceivedDate = invoice?.deliveryInspectionCipReceivedDate || invoice?.delivery_inspection_cip_received_date || ''
    initial.miccReceiptDate = invoice?.miccReceiptDate || invoice?.micc_receipt_date || ''
    initial.lastDateOfDispatch = invoice?.lastDateOfDispatch || invoice?.last_date_of_dispatch || ''
    initial.invoiceReadyDate = invoice?.invoiceReadyDate || invoice?.invoice_ready_date || ''
    initial.courierDocumentNo = invoice?.courierDocumentNo || invoice?.courier_document_no || ''
    initial.courierDocumentDate = invoice?.courierDocumentDate || invoice?.courier_document_date || ''
    initial.courierCompanyName = invoice?.courierCompanyName || invoice?.courier_company_name || ''
    initial.billSentToPersonName = invoice?.billSentToPersonName || invoice?.bill_sent_to_person_name || ''
    initial.billSentDate = invoice?.billSentDate || invoice?.bill_sent_date || ''
    initial.lastDateOfMaterialReceipt = invoice?.lastDateOfMaterialReceipt || invoice?.last_date_of_material_receipt || ''
    initial.invoiceReceiptDate = invoice?.invoiceReceiptDate || invoice?.invoice_receipt_date || ''
    initial.invoiceReceiptPersonName = invoice?.invoiceReceiptPersonName || invoice?.invoice_receipt_person_name || ''
    initial.materialVerificationDate = invoice?.materialVerificationDate || invoice?.material_verification_date || ''
    initial.jvrDate = invoice?.jvrDate || invoice?.jvr_date || ''
    initial.srnDate = invoice?.srnDate || invoice?.srn_date || ''
    initial.mrcDate = invoice?.mrcDate || invoice?.mrc_date || ''
    initial.invoiceSubmissionAtSiteDate = invoice?.invoiceSubmissionAtSiteDate || invoice?.invoice_submission_at_site_date || ''
    initial.invoiceForwardedToHo = invoice?.invoiceForwardedToHo || invoice?.invoice_forwarded_to_ho || ''
    initial.invoiceForwardedForPayment = invoice?.invoiceForwardedForPayment || invoice?.invoice_forwarded_for_payment || ''
    
    // Step 4 - 10 fields
    initial.paymentText = invoice?.paymentText || invoice?.payment_text || ''
    initial.paymentTerms = invoice?.paymentTerms || invoice?.payment_terms || 'Net 30'
    initial.firstDueDate = invoice?.firstDueDate || invoice?.first_due_date || invoice?.dueDate || invoice?.due_date || ''
    initial.notes = invoice?.notes || ''
    initial.firstDueAmount = invoice?.firstDueAmount || invoice?.first_due_amount || 0
    initial.paymentReceivedAmountFirstDue = invoice?.paymentReceivedAmountFirstDue || invoice?.payment_received_amount_first_due || 0
    initial.receiptDateFirstDue = invoice?.receiptDateFirstDue || invoice?.receipt_date_first_due || ''
    initial.firstDueBalance = invoice?.firstDueBalance || invoice?.first_due_balance || 0
    initial.notDueFirstDue = invoice?.notDueFirstDue || invoice?.not_due_first_due || 0
    initial.overDueFirstDue = invoice?.overDueFirstDue || invoice?.over_due_first_due || 0
    initial.noOfDaysOfPaymentReceiptFirstDue = invoice?.noOfDaysOfPaymentReceiptFirstDue || invoice?.no_of_days_of_payment_receipt_first_due || 0
    
    // Step 5 - 9 fields
    initial.secondDueDate = invoice?.secondDueDate || invoice?.second_due_date || ''
    initial.secondDueAmount = invoice?.secondDueAmount || invoice?.second_due_amount || 0
    initial.paymentReceivedAmountSecondDue = invoice?.paymentReceivedAmountSecondDue || invoice?.payment_received_amount_second_due || 0
    initial.receiptDateSecondDue = invoice?.receiptDateSecondDue || invoice?.receipt_date_second_due || ''
    initial.secondDueBalance = invoice?.secondDueBalance || invoice?.second_due_balance || 0
    initial.notDueSecondDue = invoice?.notDueSecondDue || invoice?.not_due_second_due || 0
    initial.overDueSecondDue = invoice?.overDueSecondDue || invoice?.over_due_second_due || 0
    initial.noOfDaysOfPaymentReceiptSecondDue = invoice?.noOfDaysOfPaymentReceiptSecondDue || invoice?.no_of_days_of_payment_receipt_second_due || 0
    
    // Step 6 - 23 fields
    initial.thirdDueDate = invoice?.thirdDueDate || invoice?.third_due_date || ''
    initial.thirdDueAmount = invoice?.thirdDueAmount || invoice?.third_due_amount || 0
    initial.paymentReceivedAmountThirdDue = invoice?.paymentReceivedAmountThirdDue || invoice?.payment_received_amount_third_due || 0
    initial.receiptDateThirdDue = invoice?.receiptDateThirdDue || invoice?.receipt_date_third_due || ''
    initial.thirdDueBalance = invoice?.thirdDueBalance || invoice?.third_due_balance || 0
    initial.notDueThirdDue = invoice?.notDueThirdDue || invoice?.not_due_third_due || 0
    initial.overDueThirdDue = invoice?.overDueThirdDue || invoice?.over_due_third_due || 0
    initial.noOfDaysOfPaymentReceiptThirdDue = invoice?.noOfDaysOfPaymentReceiptThirdDue || invoice?.no_of_days_of_payment_receipt_third_due || 0
    initial.totalBalance = invoice?.totalBalance || invoice?.total_balance || 0
    initial.notDueTotal = invoice?.notDueTotal || invoice?.not_due_total || 0
    initial.overDueTotal = invoice?.overDueTotal || invoice?.over_due_total || 0
    initial.itTds2PercentService = invoice?.itTds2PercentService || invoice?.it_tds_2_percent_service || 0
    initial.itTds1PercentUs194Q = invoice?.itTds1PercentUs194Q || invoice?.it_tds_1_percent_us_194q || 0
    initial.lcessBoq1PercentWorks = invoice?.lcessBoq1PercentWorks || invoice?.lcess_boq_1_percent_works || 0
    initial.tds2PercentCgst1PercentSgst1Percent = invoice?.tds2PercentCgst1PercentSgst1Percent || invoice?.tds_2_percent_cgst_1_percent_sgst_1_percent || 0
    initial.tdsOnCgst1Percent = invoice?.tdsOnCgst1Percent || invoice?.tds_on_cgst_1_percent || 0
    initial.tdsOnSgst1Percent = invoice?.tdsOnSgst1Percent || invoice?.tds_on_sgst_1_percent || 0
    initial.excessSupplyQty = invoice?.excessSupplyQty || invoice?.excess_supply_qty || 0
    initial.interestOnAdvance = invoice?.interestOnAdvance || invoice?.interest_on_advance || 0
    initial.anyHold = invoice?.anyHold || invoice?.any_hold || ''
    initial.penaltyLdDeduction = invoice?.penaltyLdDeduction || invoice?.penalty_ld_deduction || 0
    initial.bankCharges = invoice?.bankCharges || invoice?.bank_charges || 0
    initial.lcDiscrepancyCharge = invoice?.lcDiscrepancyCharge || invoice?.lc_discrepancy_charge || 0
    initial.provisionForBadDebts = invoice?.provisionForBadDebts || invoice?.provision_for_bad_debts || 0
    initial.badDebts = invoice?.badDebts || invoice?.bad_debts || 0
    
    return initial
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Load customers
  useEffect(() => {
    if (!token) return
    
    async function loadCustomers() {
      try {
        const api = createApiClient(token)
        const { data } = await api.get('/customers?limit=100')
        setCustomers(data?.data || [])
      } catch (err) {
        console.error('Failed to load customers:', err)
      }
    }
    loadCustomers()
  }, [token])

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      // Add validation for Step 1 required fields
      if (!formData.customerId) newErrors.customerId = 'Customer is required'
      if (!formData.gstTaxInvoiceDate) newErrors.gstTaxInvoiceDate = 'GST Tax Invoice Date is required'
    }
    
    // Add more validations as needed
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    
    setLoading(true)
    try {
      // Convert formData to the format expected by the API
      // Backend expects: customerId, issueDate, dueDate, items[], taxRate, paymentTerms, notes
      
      // Use GST Tax Invoice Date as issueDate
      const issueDate = formData.gstTaxInvoiceDate || new Date().toISOString().split('T')[0]
      
      // Calculate dueDate from paymentTerms and issueDate
      let dueDate = formData.firstDueDate || ''
      if (!dueDate && issueDate && formData.paymentTerms) {
        const issue = new Date(issueDate)
        const days = parseInt(formData.paymentTerms.replace(/\D/g, '')) || 30
        issue.setDate(issue.getDate() + days)
        dueDate = issue.toISOString().split('T')[0]
      }
      // Fallback: if still no dueDate, add 30 days to issueDate
      if (!dueDate && issueDate) {
        const issue = new Date(issueDate)
        issue.setDate(issue.getDate() + 30)
        dueDate = issue.toISOString().split('T')[0]
      }
      
      // Validate customerId
      const customerId = Number(formData.customerId)
      if (!customerId || isNaN(customerId)) {
        throw new Error('Please select a valid customer')
      }
      
      // Create items array from form data
      const items = []
      if (formData.materialDescriptionType || formData.qty > 0 || formData.basicRate > 0 || formData.basicValue > 0) {
        const description = formData.materialDescriptionType || 'Invoice Item'
        const qty = Number(formData.qty || 1)
        const unitPrice = formData.basicRate > 0 ? Number(formData.basicRate) : 
                         (formData.basicValue > 0 ? Number(formData.basicValue) / qty : 0)
        const total = formData.basicValue > 0 ? Number(formData.basicValue) : (qty * unitPrice)
        
        items.push({
          description: description,
          quantity: qty,
          unitPrice: unitPrice,
          total: total
        })
      } else {
        // Default item to satisfy backend requirement
        const defaultValue = Number(formData.totalInvoiceValue || formData.subTotal || 0)
        items.push({
          description: 'Invoice Item',
          quantity: 1,
          unitPrice: defaultValue,
          total: defaultValue
        })
      }
      
      // Calculate tax rate from GST values
      let taxRate = 0
      if (formData.totalGst > 0 && formData.basicValue > 0) {
        taxRate = (formData.totalGst / formData.basicValue) * 100
      } else if (formData.subTotal > 0 && formData.totalGst > 0) {
        taxRate = (formData.totalGst / formData.subTotal) * 100
      }
      
      const payload = {
        // Required fields for backend
        customerId: customerId,
        issueDate: issueDate,
        dueDate: dueDate,
        items: items,
        taxRate: Number(taxRate.toFixed(2)),
        paymentTerms: formData.paymentTerms || 'Net 30',
        notes: formData.notes || '',
        
        // Store all other fields for future use (backend may ignore them for now)
        ...formData
      }
      
      await onSubmit(payload)
      setErrors({})
    } catch (err) {
      console.error('Failed to save invoice:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save invoice'
      setErrors({ submit: errorMsg })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = [
    'Invoice Header & Customer Info',
    'Item, Value & Tax Details',
    'Consignee, Payer & Logistics Tracking',
    'Payment Info & 1st Due',
    '2nd Due Details',
    '3rd Due, Summary & Deductions',
    'Review & Submit'
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Header formData={formData} updateFormData={updateFormData} errors={errors} customers={customers} />
      case 2:
        return <Step2ItemTax formData={formData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return <Step3Logistics formData={formData} updateFormData={updateFormData} errors={errors} />
      case 4:
        return <Step4FirstDue formData={formData} updateFormData={updateFormData} errors={errors} />
      case 5:
        return <Step5SecondDue formData={formData} updateFormData={updateFormData} errors={errors} />
      case 6:
        return <Step6ThirdDueSummary formData={formData} updateFormData={updateFormData} errors={errors} />
      case 7:
        return <Step7Summary formData={formData} onEdit={() => setCurrentStep(1)} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-secondary-700">
            Step {currentStep} of {TOTAL_STEPS}: {stepTitles[currentStep - 1]}
          </span>
          <span className="text-sm text-secondary-500">
            {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary-200">
        {stepTitles.map((title, index) => (
          <div
            key={index + 1}
            className={`flex flex-col items-center flex-1 ${
              index + 1 < currentStep ? 'text-primary-600' :
              index + 1 === currentStep ? 'text-primary-700 font-semibold' :
              'text-secondary-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-1 ${
                index + 1 < currentStep
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : index + 1 === currentStep
                  ? 'bg-primary-100 border-primary-600 text-primary-700'
                  : 'bg-white border-secondary-300 text-secondary-400'
              }`}
            >
              {index + 1 < currentStep ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            <span className="text-xs text-center hidden md:block">{title.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm">
          {errors.submit}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-secondary-200">
        <button
          type="button"
          onClick={currentStep === TOTAL_STEPS ? handlePrevious : onCancel}
          className="btn btn-outline btn-md inline-flex items-center gap-2"
          disabled={loading}
        >
          {currentStep === TOTAL_STEPS ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </>
          ) : (
            'Cancel'
          )}
        </button>

        <div className="flex items-center gap-3">
          {currentStep > 1 && currentStep < TOTAL_STEPS && (
            <button
              type="button"
              onClick={handlePrevious}
              className="btn btn-outline btn-md inline-flex items-center gap-2"
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary btn-md inline-flex items-center gap-2"
              disabled={loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary btn-md"
              disabled={loading}
            >
              {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


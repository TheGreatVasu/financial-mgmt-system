import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { Save, Download, ArrowLeft, FileSpreadsheet, Eye, Printer, HelpCircle, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createApiClient } from '../../services/apiClient'
import ExcelViewer from '../../components/excel/ExcelViewer.jsx'

export default function CustomerPOEntry() {
  const navigate = useNavigate()
  const { token } = useAuthContext()
  const [formError, setFormError] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  
  const validateEmail = (email) => {
    return /@([a-zA-Z0-9-]+\.)?(financialmgmt\.com|gmail\.com)$/.test(email)
  }

  const validatePhone = (phone) => {
    return /^\+?\d{7,15}$/.test(phone || '')
  }
  
  const [formData, setFormData] = useState({
    // Customer Details
    customerName: '',
    customerAddress: '',
    state: '',
    country: '',
    gstNo: '',
    businessType: '',
    segment: '',
    zone: '',
    
    // Contract and Purchase Order Details
    contractAgreementNo: '',
    caDate: '',
    poNo: '',
    poDate: '',
    letterOfIntentNo: '',
    loiDate: '',
    letterOfAwardNo: '',
    loaDate: '',
    tenderReferenceNo: '',
    tenderDate: '',
    description: '',
    
    // Payment and Guarantee Section
    paymentType: '',
    paymentTerms: '',
    insuranceTypes: '',
    advanceBankGuaranteeNo: '',
    abgDate: '',
    performanceBankGuaranteeNo: '',
    pbgDate: '',
    
    // Sales-Related Information
    salesManager: '',
    salesHead: '',
    agentName: '',
    agentCommission: '',
    
    // Additional Fields
    deliverySchedule: '',
    liquidatedDamages: '',
    poSignedConcernName: '',
    boqAsPerPO: '',
    
    // Financial Summary
    totalExWorks: '',
    freightAmount: '',
    gst: '',
    totalPOValue: ''
  })

  const [loading, setLoading] = useState(false)
  const [showExcelView, setShowExcelView] = useState(false)
  
  const initialFormState = {
    customerName: '',
    customerAddress: '',
    state: '',
    country: '',
    gstNo: '',
    businessType: '',
    segment: '',
    zone: '',
    contractAgreementNo: '',
    caDate: '',
    poNo: '',
    poDate: '',
    letterOfIntentNo: '',
    loiDate: '',
    letterOfAwardNo: '',
    loaDate: '',
    tenderReferenceNo: '',
    tenderDate: '',
    description: '',
    paymentType: '',
    paymentTerms: '',
    insuranceTypes: '',
    advanceBankGuaranteeNo: '',
    abgDate: '',
    performanceBankGuaranteeNo: '',
    pbgDate: '',
    salesManager: '',
    salesHead: '',
    agentName: '',
    agentCommission: '',
    deliverySchedule: '',
    liquidatedDamages: '',
    poSignedConcernName: '',
    boqAsPerPO: '',
    totalExWorks: '',
    freightAmount: '',
    gst: '',
    totalPOValue: ''
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    // Validation: check for email and phone fields if present
    if (formData.email && !validateEmail(formData.email)) {
      setFormError('Email must be a valid @financialmgmt.com or @gmail.com address')
      setLoading(false)
      return
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      setFormError('Phone number must contain only digits and be 7-15 digits long')
      setLoading(false)
      return
    }

    try {
      const api = createApiClient(token)

      // Export to Excel
      const response = await api.post('/customers/po-entry/export', formData, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      const poNumber = formData.poNo || 'PO-Entry'
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
      link.href = url
      link.setAttribute('download', `Customer_PO_Entry_${poNumber}_${dateStr}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('PO Entry exported to Excel successfully!')

      // Optionally navigate back or stay on page
      // navigate('/customers')
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to export PO entry')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadTemplate() {
    try {
      const api = createApiClient(token)
      const response = await api.get('/customers/po-entry/template', {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Customer_PO_Entry_Template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Template downloaded successfully!')
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to download template')
    }
  }

  const sections = [
    {
      title: 'Customer Details',
      fields: [
        { name: 'customerName', label: 'Customer Name', required: true },
        { name: 'customerAddress', label: 'Customer Address', required: true, fullWidth: true },
        { name: 'state', label: 'State', required: true },
        { name: 'country', label: 'Country', required: true },
        { name: 'gstNo', label: 'GST No' },
        { name: 'businessType', label: 'Business Type' },
        { name: 'segment', label: 'Segment' },
        { name: 'zone', label: 'Zone' }
      ]
    },
    {
      title: 'Contract and Purchase Order Details',
      fields: [
        { name: 'contractAgreementNo', label: 'Contract Agreement No' },
        { name: 'caDate', label: 'CA Date', type: 'date' },
        { name: 'poNo', label: 'PO No', required: true },
        { name: 'poDate', label: 'PO Date', type: 'date', required: true },
        { name: 'letterOfIntentNo', label: 'Letter of Intent No' },
        { name: 'loiDate', label: 'LOI Date', type: 'date' },
        { name: 'letterOfAwardNo', label: 'Letter of Award No' },
        { name: 'loaDate', label: 'LOA Date', type: 'date' },
        { name: 'tenderReferenceNo', label: 'Tender Reference No' },
        { name: 'tenderDate', label: 'Tender Date', type: 'date' },
        { name: 'description', label: 'Description', type: 'textarea', fullWidth: true }
      ]
    },
    {
      title: 'Payment and Guarantee Section',
      fields: [
        { name: 'paymentType', label: 'Payment Type' },
        { name: 'paymentTerms', label: 'Payment Terms' },
        { name: 'insuranceTypes', label: 'Insurance Types' },
        { name: 'advanceBankGuaranteeNo', label: 'Advance Bank Guarantee No' },
        { name: 'abgDate', label: 'ABG Date', type: 'date' },
        { name: 'performanceBankGuaranteeNo', label: 'Performance Bank Guarantee No' },
        { name: 'pbgDate', label: 'PBG Date', type: 'date' }
      ]
    },
    {
      title: 'Sales-Related Information',
      fields: [
        { name: 'salesManager', label: 'Sales Manager' },
        { name: 'salesHead', label: 'Sales Head' },
        { name: 'agentName', label: 'Agent Name' },
        { name: 'agentCommission', label: 'Agent Commission', type: 'number' }
      ]
    },
    {
      title: 'Additional Fields',
      fields: [
        { name: 'deliverySchedule', label: 'Delivery Schedule', type: 'textarea', fullWidth: true },
        { name: 'liquidatedDamages', label: 'Liquidated Damages' },
        { name: 'poSignedConcernName', label: 'PO Signed Concern Name' },
        { name: 'boqAsPerPO', label: 'BOQ as per PO', type: 'textarea', fullWidth: true }
      ]
    },
    {
      title: 'Financial Summary',
      fields: [
        { name: 'totalExWorks', label: 'Total Ex Works', type: 'number', required: true },
        { name: 'freightAmount', label: 'Freight Amount', type: 'number' },
        { name: 'gst', label: 'GST', type: 'number' },
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
            <h1 className="text-xl font-bold text-gray-900">Customer PO Entry</h1>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </button>
            
            <button
              type="button"
              onClick={() => setShowExcelView(!showExcelView)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                showExcelView 
                  ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500' 
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showExcelView ? 'Hide Excel View' : 'View in Excel'}
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

        {/* Secondary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-gray-200">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            {isSavingDraft ? 'Saving...' : 'Save as Draft'}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Form
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print
          </button>
          
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ml-auto"
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
            Help
          </button>
        </div>

        {showHelp && (
          <div className="p-4 text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-medium text-blue-800">Need help with PO Entry?</h3>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Fill in all required fields marked with *</li>
              <li>Use the Excel template for bulk imports</li>
              <li>Click "Save as Draft" to save your progress</li>
              <li>Contact support for any issues</li>
            </ul>
          </div>
        )}

        {/* Excel Viewer */}
        {showExcelView && (
          <div className="rounded-xl border border-secondary-200 bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Excel View</h2>
            <p className="text-sm text-secondary-600 mb-4">
              View your form data in Excel format. Double-click cells in Column B to edit values.
            </p>
            <ExcelViewer
              initialData={formData}
              onDataChange={(excelData) => {
                // Parse Excel data back to form data
                try {
                  const updatedData = { ...formData }
                  
                  // Find and update values from Excel data
                  excelData.forEach((row, rowIndex) => {
                    if (row && row.length >= 2) {
                      const fieldName = String(row[0] || '').trim()
                      const value = String(row[1] || '').trim()
                      
                      // Map Excel field names to form data keys
                      const fieldMap = {
                        'Customer Name': 'customerName',
                        'Customer Address': 'customerAddress',
                        'State': 'state',
                        'Country': 'country',
                        'GST No': 'gstNo',
                        'Business Type': 'businessType',
                        'Segment': 'segment',
                        'Zone': 'zone',
                        'Contract Agreement No': 'contractAgreementNo',
                        'CA Date': 'caDate',
                        'PO No': 'poNo',
                        'PO Date': 'poDate',
                        'Letter of Intent No': 'letterOfIntentNo',
                        'LOI Date': 'loiDate',
                        'Letter of Award No': 'letterOfAwardNo',
                        'LOA Date': 'loaDate',
                        'Tender Reference No': 'tenderReferenceNo',
                        'Tender Date': 'tenderDate',
                        'Description': 'description',
                        'Payment Type': 'paymentType',
                        'Payment Terms': 'paymentTerms',
                        'Insurance Types': 'insuranceTypes',
                        'Advance Bank Guarantee No': 'advanceBankGuaranteeNo',
                        'ABG Date': 'abgDate',
                        'Performance Bank Guarantee No': 'performanceBankGuaranteeNo',
                        'PBG Date': 'pbgDate',
                        'Sales Manager': 'salesManager',
                        'Sales Head': 'salesHead',
                        'Agent Name': 'agentName',
                        'Agent Commission': 'agentCommission',
                        'Delivery Schedule': 'deliverySchedule',
                        'Liquidated Damages': 'liquidatedDamages',
                        'PO Signed Concern Name': 'poSignedConcernName',
                        'BOQ as per PO': 'boqAsPerPO',
                        'Total Ex Works': 'totalExWorks',
                        'Freight Amount': 'freightAmount',
                        'GST': 'gst',
                        'Total PO Value': 'totalPOValue'
                      }
                      
                      if (fieldMap[fieldName] && value) {
                        updatedData[fieldMap[fieldName]] = value
                      }
                    }
                  })
                  
                  setFormData(updatedData)
                  toast.success('Form data updated from Excel view')
                } catch (error) {
                  console.error('Error parsing Excel data:', error)
                }
              }}
            />
          </div>
        )}

        {/* Form */}
        <form id="po-entry-form" onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="rounded-xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              
              {/* Section Fields */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field, fieldIndex) => {
                    const fieldName = typeof field === 'string' ? field : field.name
                    const fieldLabel = typeof field === 'string' ? field : field.label
                    const fieldType = typeof field === 'string' ? 'text' : (field.type || 'text')
                    const isRequired = typeof field === 'object' && field.required
                    const isFullWidth = typeof field === 'object' && field.fullWidth
                    const colSpan = isFullWidth ? 'md:col-span-2' : ''

                    return (
                      <div key={fieldIndex} className={colSpan}>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          {fieldLabel}
                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {fieldType === 'textarea' ? (
                          <textarea
                            name={fieldName}
                            value={formData[fieldName] || ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required={isRequired}
                          />
                        ) : (
                          <input
                            type={fieldType}
                            name={fieldName}
                            value={formData[fieldName] || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required={isRequired}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}

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
              <FileSpreadsheet className="h-4 w-4" />
              {loading ? 'Exporting...' : 'Export to Excel'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}


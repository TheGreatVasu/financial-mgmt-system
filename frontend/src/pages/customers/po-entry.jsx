import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { Save, Download, ArrowLeft, FileSpreadsheet, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createApiClient } from '../../services/apiClient'
import ExcelViewer from '../../components/excel/ExcelViewer.jsx'

export default function CustomerPOEntry() {
  const navigate = useNavigate()
  const { token } = useAuthContext()
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

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    
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
        { name: 'totalPOValue', label: 'Total PO Value', type: 'number', required: true }
      ]
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/customers')}
              className="inline-flex items-center gap-2 text-sm text-secondary-600 hover:text-secondary-900 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </button>
            <h1 className="text-2xl font-semibold text-secondary-900">Customer Purchase Order Entry</h1>
            <p className="text-sm text-secondary-600 mt-1">Enter customer PO details in a structured format</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExcelView(!showExcelView)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              {showExcelView ? 'Hide Excel View' : 'Show Excel View'}
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-secondary-300 bg-white hover:bg-secondary-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>
        </div>

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
        <form onSubmit={handleSubmit} className="space-y-6">
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


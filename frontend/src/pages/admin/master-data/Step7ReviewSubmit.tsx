import React, { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Step7ReviewSubmitProps {
  onSubmit?: (data: any) => void
  onPrevious?: () => void
  allData?: any
}

export default function Step7ReviewSubmit({
  onSubmit,
  onPrevious,
  allData = {},
}: Step7ReviewSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Validate that all required sections have data
  const validateData = (): boolean => {
    const errors: string[] = []
    
    if (!allData.companyProfile || Object.keys(allData.companyProfile).length === 0) {
      errors.push('Company Profile is required')
    } else {
      // Check for critical company profile fields
      const cp = allData.companyProfile
      if (!cp.companyName || !cp.legalEntityName || !cp.corporateAddress) {
        errors.push('Company Profile: Company name, legal entity name, and corporate address are required')
      }
    }
    
    if (!allData.customerProfile || Object.keys(allData.customerProfile).length === 0) {
      errors.push('Customer Profile is required')
    } else {
      // Check for critical customer profile fields
      const cust = allData.customerProfile
      if (!cust.customerName || !cust.gstNumber) {
        errors.push('Customer Profile: Customer name and GST number are required')
      }
    }
    
    if (!allData.paymentTerms || Object.keys(allData.paymentTerms).length === 0) {
      errors.push('Payment Terms are required')
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async () => {
    // Validate before submitting
    if (!validateData()) {
      toast.error('Please complete all required sections before submitting')
      return
    }

    setIsSubmitting(true)
    setValidationErrors([])
    
    try {
      if (onSubmit) {
        await onSubmit(allData)
      } else {
        console.log('All Master Data:', allData)
        toast.success('Master Data Wizard Completed! Check console for data.')
      }
    } catch (error: any) {
      console.error('Submission error:', error)
      toast.error(error?.message || 'Failed to submit master data. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderSection = (title: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return null

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]: [string, any]) => {
            if (value === null || value === undefined || value === '') return null
            if (typeof value === 'object' && !Array.isArray(value)) {
              return (
                <div key={key} className="col-span-2">
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </p>
                  <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              )
            }
            if (Array.isArray(value)) {
              return (
                <div key={key} className="col-span-2">
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value.length} item(s)
                  </p>
                </div>
              )
            }
            return (
              <div key={key}>
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </p>
                <p className="text-sm text-gray-600 mt-1">{String(value)}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Check which sections are completed
  const sectionsCompleted = {
    companyProfile: allData.companyProfile && Object.keys(allData.companyProfile).length > 0,
    customerProfile: allData.customerProfile && Object.keys(allData.customerProfile).length > 0,
    consigneeProfile: allData.consigneeProfile && Object.keys(allData.consigneeProfile).length > 0,
    payerProfile: allData.payerProfile && Object.keys(allData.payerProfile).length > 0,
    employeeProfile: allData.employeeProfile && Object.keys(allData.employeeProfile).length > 0,
    paymentTerms: allData.paymentTerms && Object.keys(allData.paymentTerms).length > 0,
  }

  const requiredSections = ['companyProfile', 'customerProfile', 'paymentTerms']
  const allRequiredCompleted = requiredSections.every(section => sectionsCompleted[section as keyof typeof sectionsCompleted])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
        <p className="text-gray-600 mb-4">
          Please review all the information you've entered. Click Submit to complete the master data setup.
        </p>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-2">Please complete the following:</h3>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Completion Status */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Configuration Status:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div className={`flex items-center gap-2 ${sectionsCompleted.companyProfile ? 'text-green-700' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 ${sectionsCompleted.companyProfile ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Company Profile</span>
            </div>
            <div className={`flex items-center gap-2 ${sectionsCompleted.customerProfile ? 'text-green-700' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 ${sectionsCompleted.customerProfile ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Customer Profile</span>
            </div>
            <div className={`flex items-center gap-2 ${sectionsCompleted.consigneeProfile ? 'text-green-700' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 ${sectionsCompleted.consigneeProfile ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Consignee Profile</span>
            </div>
            <div className={`flex items-center gap-2 ${sectionsCompleted.payerProfile ? 'text-green-700' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 ${sectionsCompleted.payerProfile ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Payer Profile</span>
            </div>
            <div className={`flex items-center gap-2 ${sectionsCompleted.employeeProfile ? 'text-green-700' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 ${sectionsCompleted.employeeProfile ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Employee Profile</span>
            </div>
            <div className={`flex items-center gap-2 ${sectionsCompleted.paymentTerms ? 'text-green-700' : 'text-gray-500'}`}>
              <CheckCircle className={`h-4 w-4 ${sectionsCompleted.paymentTerms ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Payment Terms</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {renderSection('Company Profile', allData.companyProfile)}
          {renderSection('Customer Profile', allData.customerProfile)}
          {renderSection('Consignee Profile', allData.consigneeProfile)}
          {renderSection('Payer Profile', allData.payerProfile)}
          {renderSection('Employee Profile', allData.employeeProfile)}
          {renderSection('Payment Terms', allData.paymentTerms)}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !allRequiredCompleted}
            className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit & Complete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


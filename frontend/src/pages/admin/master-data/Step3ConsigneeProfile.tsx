import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const consigneeSchema = z.object({
  logo: z.any().optional(),
  consigneeName: z.string().min(1, 'Consignee name is required'),
  consigneeAddress: z.string().min(1, 'Consignee address is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  legalEntityName: z.string().min(1, 'Legal entity name is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  gstNumber: z.string().min(1, 'GST number is required'),
  contactPersonName: z.string().min(1, 'Contact person name is required'),
  designation: z.string().min(1, 'Designation is required'),
  contactNumber: z.string().min(10, 'Contact number is required'),
  emailId: z.string().email('Valid email required'),
})

type ConsigneeFormData = z.infer<typeof consigneeSchema>

interface ConsigneeProfile {
  logo?: string | null
  consigneeName: string
  consigneeAddress: string
  customerName: string
  legalEntityName: string
  city: string
  state: string
  gstNumber: string
  contactPersonName: string
  designation: string
  contactNumber: string
  emailId: string
}

interface Step3ConsigneeProfileProps {
  onNext?: (data: { consignees: ConsigneeProfile[] }) => void
  onPrevious?: () => void
  initialData?: { consignees?: ConsigneeProfile[] }
  customerData?: any
}

export default function Step3ConsigneeProfile({
  onNext,
  onPrevious,
  initialData,
  customerData,
}: Step3ConsigneeProfileProps) {
  // Auto-fill customer data from Step 2 if available
  const getInitialConsignee = (): ConsigneeProfile => {
    const base = {
      logo: null,
      consigneeName: '',
      consigneeAddress: customerData?.corporateOfficeAddress || '',
      customerName: customerData?.customerName || '',
      legalEntityName: customerData?.legalEntityName || '',
      city: '',
      state: customerData?.state || '',
      gstNumber: customerData?.gstNumber || '',
      contactPersonName: customerData?.poIssuingAuthority || '',
      designation: customerData?.designation || '',
      contactNumber: customerData?.contactNumber || '',
      emailId: customerData?.emailId || '',
    }
    return base
  }

  const [consignees, setConsignees] = useState<ConsigneeProfile[]>(
    initialData?.consignees && initialData.consignees.length > 0
      ? initialData.consignees
      : [getInitialConsignee()]
  )
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: { [field: string]: string } }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  // Real-time validation check
  useEffect(() => {
    const checkValidity = () => {
      for (const consignee of consignees) {
        try {
          consigneeSchema.parse(consignee)
        } catch {
          setIsFormValid(false)
          return
        }
      }
      setIsFormValid(consignees.length > 0)
    }
    checkValidity()
  }, [consignees])

  const addConsignee = () => {
    setConsignees([
      ...consignees,
      {
        logo: null,
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
        emailId: '',
      },
    ])
  }

  const removeConsignee = (index: number) => {
    if (consignees.length > 1) {
      setConsignees(consignees.filter((_, i) => i !== index))
    }
  }

  const updateConsignee = (index: number, field: keyof ConsigneeProfile, value: any) => {
    const updated = [...consignees]
    updated[index] = { ...updated[index], [field]: value }
    setConsignees(updated)
  }

  const validateConsignees = (): boolean => {
    const errors: { [key: number]: { [field: string]: string } } = {}
    let isValid = true

    consignees.forEach((consignee, index) => {
      try {
        consigneeSchema.parse(consignee)
        // Clear errors for this consignee if validation passes
        if (errors[index]) {
          delete errors[index]
        }
      } catch (error: any) {
        isValid = false
        const fieldErrors: { [field: string]: string } = {}
        
        if (error.errors) {
          error.errors.forEach((err: any) => {
            const field = err.path[0]
            if (field) {
              fieldErrors[field] = err.message
            }
          })
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          errors[index] = fieldErrors
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate first
    const isValid = validateConsignees()
    
    if (!isValid) {
      const errorCount = Object.keys(validationErrors).length
      toast.error(`Please fill all required fields. ${errorCount} consignee(s) have validation errors.`)
      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-500')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    setIsSubmitting(true)
    
    try {
      if (onNext) {
        onNext({ consignees })
        // Success - component will unmount on navigation, so no need to reset state
      } else {
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error('Error submitting consignee profile:', error)
      toast.error(error?.message || 'Failed to save consignee profile. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200/70 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-2">
          Creation of Consignee Profile
        </h2>
        <p className="text-sm text-secondary-600">
          Add consignee information for your business operations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {consignees.map((consignee, index) => (
          <div
            key={index}
            className="rounded-lg border border-secondary-200 p-4 sm:p-6 space-y-4 bg-secondary-50/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-800">
                Consignee {index + 1}
              </h3>
              {consignees.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeConsignee(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Logo
                </label>
                <div className="rounded-lg border border-dashed border-secondary-300 bg-white p-4 text-center space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-secondary-800">
                      Upload consignee logo
                    </p>
                    <p className="text-xs text-secondary-500">PNG/JPG, max 2MB</p>
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-secondary-300 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors text-sm font-medium">
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
                    <div className="text-xs text-secondary-600 truncate">
                      Selected: {consignee.logo}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Consignee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.consigneeName ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.consigneeName}
                  onChange={(e) => {
                    updateConsignee(index, 'consigneeName', e.target.value)
                    // Clear error when user starts typing
                    if (validationErrors[index]?.consigneeName) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.consigneeName
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter consignee name"
                />
                {validationErrors[index]?.consigneeName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].consigneeName}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Consignee Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full rounded-lg border px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.consigneeAddress ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.consigneeAddress}
                  onChange={(e) => {
                    updateConsignee(index, 'consigneeAddress', e.target.value)
                    if (validationErrors[index]?.consigneeAddress) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.consigneeAddress
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter consignee address"
                />
                {validationErrors[index]?.consigneeAddress && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].consigneeAddress}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.customerName ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.customerName}
                  onChange={(e) => {
                    updateConsignee(index, 'customerName', e.target.value)
                    if (validationErrors[index]?.customerName) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.customerName
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter customer name"
                />
                {validationErrors[index]?.customerName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].customerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Legal Entity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.legalEntityName ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.legalEntityName}
                  onChange={(e) => {
                    updateConsignee(index, 'legalEntityName', e.target.value)
                    if (validationErrors[index]?.legalEntityName) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.legalEntityName
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter legal entity name"
                />
                {validationErrors[index]?.legalEntityName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].legalEntityName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.city ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.city}
                  onChange={(e) => {
                    updateConsignee(index, 'city', e.target.value)
                    if (validationErrors[index]?.city) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.city
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter city"
                />
                {validationErrors[index]?.city && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.state ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.state}
                  onChange={(e) => {
                    updateConsignee(index, 'state', e.target.value)
                    if (validationErrors[index]?.state) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.state
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter state"
                />
                {validationErrors[index]?.state && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].state}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Consignee GST No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.gstNumber ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.gstNumber}
                  onChange={(e) => {
                    updateConsignee(index, 'gstNumber', e.target.value)
                    if (validationErrors[index]?.gstNumber) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.gstNumber
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter GST number"
                />
                {validationErrors[index]?.gstNumber && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].gstNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.contactPersonName ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.contactPersonName}
                  onChange={(e) => {
                    updateConsignee(index, 'contactPersonName', e.target.value)
                    if (validationErrors[index]?.contactPersonName) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.contactPersonName
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter contact person name"
                />
                {validationErrors[index]?.contactPersonName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].contactPersonName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.designation ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.designation}
                  onChange={(e) => {
                    updateConsignee(index, 'designation', e.target.value)
                    if (validationErrors[index]?.designation) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.designation
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter designation"
                />
                {validationErrors[index]?.designation && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].designation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Person Contact No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.contactNumber ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.contactNumber}
                  onChange={(e) => {
                    updateConsignee(index, 'contactNumber', e.target.value)
                    if (validationErrors[index]?.contactNumber) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.contactNumber
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter contact number"
                />
                {validationErrors[index]?.contactNumber && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].contactNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    validationErrors[index]?.emailId ? 'border-red-500' : 'border-secondary-300'
                  }`}
                  value={consignee.emailId}
                  onChange={(e) => {
                    updateConsignee(index, 'emailId', e.target.value)
                    if (validationErrors[index]?.emailId) {
                      const newErrors = { ...validationErrors }
                      delete newErrors[index]?.emailId
                      if (Object.keys(newErrors[index] || {}).length === 0) {
                        delete newErrors[index]
                      }
                      setValidationErrors(newErrors)
                    }
                  }}
                  placeholder="Enter email address"
                />
                {validationErrors[index]?.emailId && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[index].emailId}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addConsignee}
          className="inline-flex items-center gap-2 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Consignee
        </button>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-6 border-t border-secondary-200">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-2.5 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors font-medium"
            >
              Previous
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`px-6 py-2.5 text-white rounded-lg transition-colors font-medium ml-auto flex items-center gap-2 ${
              isFormValid && !isSubmitting
                ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}


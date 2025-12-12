import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'

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
}

export default function Step3ConsigneeProfile({
  onNext,
  onPrevious,
  initialData,
}: Step3ConsigneeProfileProps) {
  const [consignees, setConsignees] = useState<ConsigneeProfile[]>(
    initialData?.consignees && initialData.consignees.length > 0
      ? initialData.consignees
      : [
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
        ]
  )

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
    for (const consignee of consignees) {
      try {
        consigneeSchema.parse(consignee)
      } catch (error) {
        return false
      }
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateConsignees()) {
      if (onNext) {
        onNext({ consignees })
      }
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
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.consigneeName}
                  onChange={(e) =>
                    updateConsignee(index, 'consigneeName', e.target.value)
                  }
                  placeholder="Enter consignee name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Consignee Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.consigneeAddress}
                  onChange={(e) =>
                    updateConsignee(index, 'consigneeAddress', e.target.value)
                  }
                  placeholder="Enter consignee address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.customerName}
                  onChange={(e) =>
                    updateConsignee(index, 'customerName', e.target.value)
                  }
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Legal Entity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.legalEntityName}
                  onChange={(e) =>
                    updateConsignee(index, 'legalEntityName', e.target.value)
                  }
                  placeholder="Enter legal entity name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.city}
                  onChange={(e) => updateConsignee(index, 'city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.state}
                  onChange={(e) => updateConsignee(index, 'state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Consignee GST No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.gstNumber}
                  onChange={(e) =>
                    updateConsignee(index, 'gstNumber', e.target.value)
                  }
                  placeholder="Enter GST number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.contactPersonName}
                  onChange={(e) =>
                    updateConsignee(index, 'contactPersonName', e.target.value)
                  }
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.designation}
                  onChange={(e) =>
                    updateConsignee(index, 'designation', e.target.value)
                  }
                  placeholder="Enter designation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Person Contact No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.contactNumber}
                  onChange={(e) =>
                    updateConsignee(index, 'contactNumber', e.target.value)
                  }
                  placeholder="Enter contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={consignee.emailId}
                  onChange={(e) =>
                    updateConsignee(index, 'emailId', e.target.value)
                  }
                  placeholder="Enter email address"
                />
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
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium ml-auto"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  )
}


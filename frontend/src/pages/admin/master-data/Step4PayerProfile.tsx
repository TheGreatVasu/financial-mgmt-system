import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'

const payerSchema = z.object({
  logo: z.any().optional(),
  payerName: z.string().min(1, 'Payer name is required'),
  payerAddress: z.string().min(1, 'Payer address is required'),
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

type PayerFormData = z.infer<typeof payerSchema>

interface PayerProfile {
  logo?: string | null
  payerName: string
  payerAddress: string
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

interface Step4PayerProfileProps {
  onNext?: (data: { payers: PayerProfile[] }) => void
  onPrevious?: () => void
  initialData?: { payers?: PayerProfile[] }
}

export default function Step4PayerProfile({
  onNext,
  onPrevious,
  initialData,
}: Step4PayerProfileProps) {
  const [payers, setPayers] = useState<PayerProfile[]>(
    initialData?.payers && initialData.payers.length > 0
      ? initialData.payers
      : [
          {
            logo: null,
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
            emailId: '',
          },
        ]
  )

  const addPayer = () => {
    setPayers([
      ...payers,
      {
        logo: null,
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
        emailId: '',
      },
    ])
  }

  const removePayer = (index: number) => {
    if (payers.length > 1) {
      setPayers(payers.filter((_, i) => i !== index))
    }
  }

  const updatePayer = (index: number, field: keyof PayerProfile, value: any) => {
    const updated = [...payers]
    updated[index] = { ...updated[index], [field]: value }
    setPayers(updated)
  }

  const validatePayers = (): boolean => {
    for (const payer of payers) {
      try {
        payerSchema.parse(payer)
      } catch (error) {
        return false
      }
    }
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePayers()) {
      if (onNext) {
        onNext({ payers })
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200/70 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-2">
          Creation of Payer Profile
        </h2>
        <p className="text-sm text-secondary-600">
          Add payer information for your business operations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {payers.map((payer, index) => (
          <div
            key={index}
            className="rounded-lg border border-secondary-200 p-4 sm:p-6 space-y-4 bg-secondary-50/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-800">
                Payer {index + 1}
              </h3>
              {payers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePayer(index)}
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
                      Upload payer logo
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
                        updatePayer(index, 'logo', file?.name || '')
                      }}
                    />
                  </label>
                  {payer.logo && (
                    <div className="text-xs text-secondary-600 truncate">
                      Selected: {payer.logo}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Payer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={payer.payerName}
                  onChange={(e) => updatePayer(index, 'payerName', e.target.value)}
                  placeholder="Enter payer name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Payer Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={payer.payerAddress}
                  onChange={(e) =>
                    updatePayer(index, 'payerAddress', e.target.value)
                  }
                  placeholder="Enter payer address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={payer.customerName}
                  onChange={(e) =>
                    updatePayer(index, 'customerName', e.target.value)
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
                  value={payer.legalEntityName}
                  onChange={(e) =>
                    updatePayer(index, 'legalEntityName', e.target.value)
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
                  value={payer.city}
                  onChange={(e) => updatePayer(index, 'city', e.target.value)}
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
                  value={payer.state}
                  onChange={(e) => updatePayer(index, 'state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Payer GST No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={payer.gstNumber}
                  onChange={(e) =>
                    updatePayer(index, 'gstNumber', e.target.value)
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
                  value={payer.contactPersonName}
                  onChange={(e) =>
                    updatePayer(index, 'contactPersonName', e.target.value)
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
                  value={payer.designation}
                  onChange={(e) =>
                    updatePayer(index, 'designation', e.target.value)
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
                  value={payer.contactNumber}
                  onChange={(e) =>
                    updatePayer(index, 'contactNumber', e.target.value)
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
                  value={payer.emailId}
                  onChange={(e) => updatePayer(index, 'emailId', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addPayer}
          className="inline-flex items-center gap-2 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Payer
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


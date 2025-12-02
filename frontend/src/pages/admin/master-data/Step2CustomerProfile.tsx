import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const customerProfileSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerCode: z.string().min(1, 'Customer code is required'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Valid GSTIN required'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Valid PAN required'),
  companyType: z.enum(['Proprietorship', 'Partnership', 'Pvt Ltd', 'Public Ltd', 'Individual']),
  segment: z.string().min(1, 'Segment is required'),
  region: z.string().min(1, 'Region is required'),
  zone: z.string().min(1, 'Zone is required'),
  billingAddress: z.string().min(1, 'Billing address is required'),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  contactPersonName: z.string().min(1, 'Contact person name is required'),
  contactPersonNumber: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone number required'),
  contactEmailId: z.string().email('Valid email required'),
  creditPeriod: z.string().regex(/^\d+$/, 'Credit period must be a number'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  deliveryTerms: z.string().min(1, 'Delivery terms are required'),
  projectManager: z.string().min(1, 'Project manager is required'),
  anyHold: z.enum(['Yes', 'No']),
  remarks: z.string().optional(),
})

type CustomerProfileFormData = z.infer<typeof customerProfileSchema>

interface Step2CustomerProfileProps {
  onNext?: (data: CustomerProfileFormData) => void
  onPrevious?: () => void
  initialData?: Partial<CustomerProfileFormData>
}

export default function Step2CustomerProfile({
  onNext,
  onPrevious,
  initialData,
}: Step2CustomerProfileProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerProfileFormData>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: initialData || {},
  })

  const onSubmit = (data: CustomerProfileFormData) => {
    if (onNext) {
      onNext(data)
    } else {
      console.log('Customer Profile Data:', data)
    }
  }

  const FormField = ({
    label,
    name,
    type = 'text',
    placeholder,
    isTextarea = false,
    options,
    control: formControl,
    error,
  }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Controller
        name={name}
        control={formControl}
        render={({ field }) =>
          isTextarea ? (
            <textarea
              {...field}
              placeholder={placeholder}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
            />
          ) : options ? (
            <select
              {...field}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select {label}</option>
              {options.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )
        }
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Creation of Customer Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              label="Customer Name"
              name="customerName"
              placeholder="Enter customer name"
              control={control}
              error={errors.customerName}
            />
            <FormField
              label="Customer Code"
              name="customerCode"
              placeholder="Enter customer code"
              control={control}
              error={errors.customerCode}
            />
            <FormField
              label="GSTIN"
              name="gstin"
              placeholder="Enter GSTIN"
              control={control}
              error={errors.gstin}
            />
            <FormField
              label="PAN Number"
              name="panNumber"
              placeholder="Enter PAN"
              control={control}
              error={errors.panNumber}
            />
            <FormField
              label="Company Type"
              name="companyType"
              control={control}
              error={errors.companyType}
              options={['Proprietorship', 'Partnership', 'Pvt Ltd', 'Public Ltd', 'Individual']}
            />
            <FormField
              label="Segment"
              name="segment"
              placeholder="Enter segment"
              control={control}
              error={errors.segment}
            />
            <FormField
              label="Region"
              name="region"
              placeholder="Enter region"
              control={control}
              error={errors.region}
            />
            <FormField
              label="Zone"
              name="zone"
              placeholder="Enter zone"
              control={control}
              error={errors.zone}
            />
            <FormField
              label="Billing Address"
              name="billingAddress"
              placeholder="Enter billing address"
              control={control}
              error={errors.billingAddress}
              isTextarea
            />
            <FormField
              label="Shipping Address"
              name="shippingAddress"
              placeholder="Enter shipping address"
              control={control}
              error={errors.shippingAddress}
              isTextarea
            />
            <FormField
              label="Contact Person Name"
              name="contactPersonName"
              placeholder="Enter contact person name"
              control={control}
              error={errors.contactPersonName}
            />
            <FormField
              label="Contact Person Number"
              name="contactPersonNumber"
              placeholder="Enter 10-digit phone"
              control={control}
              error={errors.contactPersonNumber}
            />
            <FormField
              label="Contact Email ID"
              name="contactEmailId"
              type="email"
              placeholder="Enter email"
              control={control}
              error={errors.contactEmailId}
            />
            <FormField
              label="Credit Period (Days)"
              name="creditPeriod"
              type="number"
              placeholder="Enter credit period"
              control={control}
              error={errors.creditPeriod}
            />
            <FormField
              label="Payment Terms"
              name="paymentTerms"
              placeholder="Enter payment terms"
              control={control}
              error={errors.paymentTerms}
            />
            <FormField
              label="Delivery Terms"
              name="deliveryTerms"
              placeholder="Enter delivery terms"
              control={control}
              error={errors.deliveryTerms}
            />
            <FormField
              label="Project Manager"
              name="projectManager"
              placeholder="Enter project manager"
              control={control}
              error={errors.projectManager}
            />
            <FormField
              label="Any Hold"
              name="anyHold"
              control={control}
              error={errors.anyHold}
              options={['Yes', 'No']}
            />
            <FormField
              label="Remarks"
              name="remarks"
              placeholder="Enter remarks (optional)"
              control={control}
              error={errors.remarks}
              isTextarea
            />
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

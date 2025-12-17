import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const paymentTermsSchema = z.object({
  paymentDocument: z.any().optional(),
  paymentTermName: z.string().min(1, 'Payment term name is required'),
  creditPeriod: z.string().min(1, 'Credit period is required'),
  advanceRequired: z.string().min(1, 'Please select Yes or No'),
  advancePercentage: z.string().optional().or(z.literal('')),
  balancePaymentDueDays: z.string().min(1, 'Balance payment due days is required'),
  latePaymentInterest: z.string().min(1, 'Late payment interest is required'),
  billingCycle: z.string().min(1, 'Billing cycle is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  bankAccountNumber: z.string().min(1, 'Bank account number is required'),
  ifscCode: z.string().min(1, 'IFSC code is required'),
  upiId: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

type PaymentTermsFormData = z.infer<typeof paymentTermsSchema>

interface Step6PaymentTermsProps {
  onNext?: (data: PaymentTermsFormData) => void
  onPrevious?: () => void
  initialData?: Partial<PaymentTermsFormData>
}

export default function Step6PaymentTerms({
  onNext,
  onPrevious,
  initialData,
}: Step6PaymentTermsProps) {
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentTermsFormData>({
    resolver: zodResolver(paymentTermsSchema),
    defaultValues: {
      ...initialData,
      paymentDocument: initialData?.paymentDocument || null,
    },
  })

  const advanceRequired = watch('advanceRequired')
  const paymentMethod = watch('paymentMethod')

  const onSubmit = (data: PaymentTermsFormData) => {
    if (onNext) onNext(data)
  }

  const FormField = ({
    label,
    name,
    type = 'text',
    placeholder,
    isTextarea = false,
    options,
    required = true,
    control: formControl,
    error,
  }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Controller
        name={name}
        control={formControl}
        render={({ field }) => {
          const baseClasses = `px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`
          if (type === 'file') {
            return (
              <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-white flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 overflow-hidden flex items-center justify-center font-semibold text-base">
                  {documentPreview ? (
                    <img src={documentPreview} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-600">{field.value ? 'DOC' : 'Doc'}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800">
                    {documentPreview ? 'Document uploaded' : 'Upload payment document'}
                  </p>
                  <p className="text-xs text-gray-500">PNG/JPG/TIF/PDF, max 5MB</p>
                </div>

                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-700 transition">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.pdf,.tif,.tiff"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => setDocumentPreview(reader.result as string)
                        if (file.type.startsWith('image/')) {
                          reader.readAsDataURL(file)
                        } else if (file.name.endsWith('.pdf')) {
                          setDocumentPreview(null)
                        }
                        field.onChange(file)
                      } else {
                        field.onChange(null)
                        setDocumentPreview(null)
                      }
                    }}
                  />
                </label>

                {field.value && (
                  <span className="text-xs text-gray-600 truncate max-w-full">
                    {typeof field.value === 'string' ? field.value : field.value?.name}
                  </span>
                )}
              </div>
            )
          }

          if (isTextarea) return <textarea {...field} placeholder={placeholder} className={baseClasses} rows={3} />
          if (options) {
            return (
              <select {...field} className={baseClasses}>
                <option value="">Select {label}</option>
                {options.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )
          }

          return <input {...field} type={type} placeholder={placeholder} className={baseClasses} />
        }}
      />

      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Payment Terms</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <FormField
                label="Payment Document"
                name="paymentDocument"
                type="file"
                control={control}
                error={errors.paymentDocument}
              />
            </div>

            <FormField
              label="Payment Term Name"
              name="paymentTermName"
              placeholder="Enter payment term name"
              control={control}
              error={errors.paymentTermName}
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
              label="Advance Required"
              name="advanceRequired"
              control={control}
              error={errors.advanceRequired}
              options={['Yes', 'No']}
            />

            {advanceRequired === 'Yes' && (
              <FormField
                label="Advance Percentage"
                name="advancePercentage"
                type="number"
                placeholder="Enter advance percentage"
                control={control}
                error={errors.advancePercentage}
                required={false}
              />
            )}

            <FormField
              label="Balance Payment Due Days"
              name="balancePaymentDueDays"
              type="number"
              placeholder="Enter due days"
              control={control}
              error={errors.balancePaymentDueDays}
            />

            <FormField
              label="Late Payment Interest %"
              name="latePaymentInterest"
              type="number"
              placeholder="Enter interest percentage"
              control={control}
              error={errors.latePaymentInterest}
            />

            <FormField
              label="Billing Cycle"
              name="billingCycle"
              control={control}
              options={['Monthly', 'Quarterly', 'Yearly']}
              error={errors.billingCycle}
            />

            <FormField
              label="Payment Method"
              name="paymentMethod"
              control={control}
              options={['Bank Transfer', 'UPI', 'Cheque']}
              error={errors.paymentMethod}
            />

            <FormField
              label="Bank Name"
              name="bankName"
              placeholder="Enter bank name"
              control={control}
              error={errors.bankName}
            />

            <FormField
              label="Bank Account Number"
              name="bankAccountNumber"
              placeholder="Enter account number"
              control={control}
              error={errors.bankAccountNumber}
            />

            <FormField
              label="IFSC Code"
              name="ifscCode"
              placeholder="Enter IFSC code"
              control={control}
              error={errors.ifscCode}
            />

            {paymentMethod === 'UPI' && (
              <FormField
                label="UPI ID"
                name="upiId"
                placeholder="Enter UPI ID"
                control={control}
                error={errors.upiId}
                required={false}
              />
            )}

            <div className="col-span-2">
              <FormField
                label="Notes"
                name="notes"
                placeholder="Enter notes (optional)"
                control={control}
                error={errors.notes}
                isTextarea
                required={false}
              />
            </div>
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

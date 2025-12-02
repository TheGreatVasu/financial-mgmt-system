import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const paymentTermsSchema = z.object({
  paymentTermName: z.string().min(1, 'Payment term name is required'),
  creditPeriod: z.string().regex(/^\d+$/, 'Credit period must be a number'),
  advanceRequired: z.enum(['Yes', 'No']),
  advancePercentage: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valid percentage required').optional(),
  balancePaymentDueDays: z.string().regex(/^\d+$/, 'Balance payment due days must be a number'),
  latePaymentInterest: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valid percentage required'),
  billingCycle: z.enum(['Monthly', 'Quarterly', 'Yearly']),
  paymentMethod: z.enum(['Bank Transfer', 'UPI', 'Cheque']),
  bankName: z.string().min(1, 'Bank name is required'),
  bankAccountNumber: z.string().min(1, 'Bank account number is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}[0][A-Z0-9]{6}$/, 'Valid IFSC code required'),
  upiId: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type PaymentTermsFormData = z.infer<typeof paymentTermsSchema>

interface Step3PaymentTermsProps {
  onNext?: (data: PaymentTermsFormData) => void
  onPrevious?: () => void
  initialData?: Partial<PaymentTermsFormData>
}

export default function Step3PaymentTerms({
  onNext,
  onPrevious,
  initialData,
}: Step3PaymentTermsProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentTermsFormData>({
    resolver: zodResolver(paymentTermsSchema),
    defaultValues: initialData || {},
  })

  const advanceRequired = watch('advanceRequired')
  const paymentMethod = watch('paymentMethod')

  const onSubmit = (data: PaymentTermsFormData) => {
    if (onNext) {
      onNext(data)
    } else {
      console.log('Payment Terms Data:', data)
    }
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
        {!required && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
      </label>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Payment Terms</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6">
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
                step="0.01"
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
              step="0.01"
              placeholder="Enter interest percentage"
              control={control}
              error={errors.latePaymentInterest}
            />
            <FormField
              label="Billing Cycle"
              name="billingCycle"
              control={control}
              error={errors.billingCycle}
              options={['Monthly', 'Quarterly', 'Yearly']}
            />
            <FormField
              label="Payment Method"
              name="paymentMethod"
              control={control}
              error={errors.paymentMethod}
              options={['Bank Transfer', 'UPI', 'Cheque']}
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
                type="email"
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

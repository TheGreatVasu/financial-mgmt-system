import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SelectWithOther from '../ui/SelectWithOther'

const paymentMethods = ['Bank Transfer', 'Cheque', 'UPI', 'Cash', 'Other']

const paymentTermsSchema = z.object({
  paymentTermName: z.string().min(1, 'Payment Term Name is required'),
  creditPeriod: z.coerce.number().min(0, 'Credit Period is required'),
  advanceRequired: z.string().min(1, 'Advance Required is required'),
  advancePercentage: z.coerce.number().min(0).max(100),
  balancePaymentDueDays: z.coerce.number().min(0, 'Balance Payment Due Days is required'),
  latePaymentInterest: z.coerce.number().min(0),
  billingCycle: z.string().min(1, 'Billing Cycle is required'),
  paymentMethod: z.string().min(1, 'Payment Method is required'),
  bankName: z.string().min(1, 'Bank Name is required'),
  bankAccountNumber: z.string().min(1, 'Bank Account Number is required'),
  ifscCode: z.string().min(1, 'IFSC Code is required'),
  upiId: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentTermsFormValues = z.infer<typeof paymentTermsSchema>

interface Props {
  defaultValues?: Partial<PaymentTermsFormValues>
  onPrevious: () => void
  onNext: (data: PaymentTermsFormValues) => void
  loading?: boolean
}

const PaymentTermsForm: React.FC<Props> = ({ defaultValues, onPrevious, onNext, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentTermsFormValues>({
    resolver: zodResolver(paymentTermsSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <section className="bg-white rounded-xl shadow-sm border p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Creation of Payment Terms</h2>
      <form onSubmit={handleSubmit(onNext)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Payment Term Name *</label>
            <input className="input" {...register('paymentTermName')} />
            {errors.paymentTermName && <p className="text-danger-600 text-xs mt-1">{errors.paymentTermName.message}</p>}
          </div>
          <div>
            <label className="form-label">Credit Period *</label>
            <input className="input" type="number" {...register('creditPeriod', { valueAsNumber: true })} />
            {errors.creditPeriod && <p className="text-danger-600 text-xs mt-1">{errors.creditPeriod.message}</p>}
          </div>
          <div>
            <label className="form-label">Advance Required *</label>
            <SelectWithOther
              className="input"
              {...register('advanceRequired')}
              options={[
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' }
              ]}
              placeholder="Select"
              otherLabel="Other"
              otherInputPlaceholder="Please specify"
            />
            {errors.advanceRequired && <p className="text-danger-600 text-xs mt-1">{errors.advanceRequired.message}</p>}
          </div>
          <div>
            <label className="form-label">Advance Percentage</label>
            <input className="input" type="number" {...register('advancePercentage', { valueAsNumber: true })} />
            {errors.advancePercentage && <p className="text-danger-600 text-xs mt-1">{errors.advancePercentage.message}</p>}
          </div>
          <div>
            <label className="form-label">Balance Payment Due Days *</label>
            <input className="input" type="number" {...register('balancePaymentDueDays', { valueAsNumber: true })} />
            {errors.balancePaymentDueDays && <p className="text-danger-600 text-xs mt-1">{errors.balancePaymentDueDays.message}</p>}
          </div>
          <div>
            <label className="form-label">Late Payment Interest %</label>
            <input className="input" type="number" {...register('latePaymentInterest', { valueAsNumber: true })} />
            {errors.latePaymentInterest && <p className="text-danger-600 text-xs mt-1">{errors.latePaymentInterest.message}</p>}
          </div>
          <div>
            <label className="form-label">Billing Cycle *</label>
            <input className="input" {...register('billingCycle')} />
            {errors.billingCycle && <p className="text-danger-600 text-xs mt-1">{errors.billingCycle.message}</p>}
          </div>
          <div>
            <label className="form-label">Payment Method *</label>
            <SelectWithOther
              className="input"
              {...register('paymentMethod')}
              options={paymentMethods.filter(m => m !== 'Other').map(m => ({ value: m, label: m }))}
              placeholder="Select"
              otherLabel="Other"
              otherInputPlaceholder="Enter payment method"
            />
            {errors.paymentMethod && <p className="text-danger-600 text-xs mt-1">{errors.paymentMethod.message}</p>}
          </div>
          <div>
            <label className="form-label">Bank Name *</label>
            <input className="input" {...register('bankName')} />
            {errors.bankName && <p className="text-danger-600 text-xs mt-1">{errors.bankName.message}</p>}
          </div>
          <div>
            <label className="form-label">Bank Account Number *</label>
            <input className="input" {...register('bankAccountNumber')} />
            {errors.bankAccountNumber && <p className="text-danger-600 text-xs mt-1">{errors.bankAccountNumber.message}</p>}
          </div>
          <div>
            <label className="form-label">IFSC Code *</label>
            <input className="input" {...register('ifscCode')} />
            {errors.ifscCode && <p className="text-danger-600 text-xs mt-1">{errors.ifscCode.message}</p>}
          </div>
          <div>
            <label className="form-label">UPI ID</label>
            <input className="input" {...register('upiId')} />
            {errors.upiId && <p className="text-danger-600 text-xs mt-1">{errors.upiId.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Notes</label>
            <input className="input" {...register('notes')} />
            {errors.notes && <p className="text-danger-600 text-xs mt-1">{errors.notes.message}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between pt-8 border-t border-secondary-200 mt-8">
          <button
            type="button"
            className="btn btn-outline px-8 py-3 text-base font-semibold rounded-full shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onPrevious}
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            Previous
          </button>
          <button
            type="submit"
            className="btn btn-primary px-10 py-3 text-base font-bold rounded-full shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            Next
          </button>
        </div>
      </form>
    </section>
  )
}

export default PaymentTermsForm

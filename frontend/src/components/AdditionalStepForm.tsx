import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const additionalStepSchema = z.object({
  defaultCurrency: z.string().min(1, 'Default Currency is required'),
  defaultTax: z.coerce.number().min(0, 'Default Tax % is required'),
  invoicePrefix: z.string().min(1, 'Invoice Prefix is required'),
  quotationPrefix: z.string().min(1, 'Quotation Prefix is required'),
  enableBOQ: z.enum(['Yes', 'No'], { required_error: 'Enable BOQ is required' }),
  enableAutoInvoice: z.enum(['Yes', 'No'], { required_error: 'Enable Auto-Invoice is required' }),
  notificationEmail: z.string().email('Notification Email is invalid'),
  smsNotification: z.enum(['Yes', 'No'], { required_error: 'SMS Notification is required' }),
  allowPartialDelivery: z.enum(['Yes', 'No'], { required_error: 'Allow Partial Delivery is required' }),
  serviceCharge: z.coerce.number().min(0, 'Service Charge % is required'),
  remarks: z.string().optional(),
})

type AdditionalStepFormValues = z.infer<typeof additionalStepSchema>

interface Props {
  defaultValues?: Partial<AdditionalStepFormValues>
  onPrevious: () => void
  onSubmit: (data: AdditionalStepFormValues) => void
  loading?: boolean
}

const AdditionalStepForm: React.FC<Props> = ({ defaultValues, onPrevious, onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdditionalStepFormValues>({
    resolver: zodResolver(additionalStepSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <section className="bg-white rounded-xl shadow-sm border p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Additional Step</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Default Currency *</label>
            <input className="input" {...register('defaultCurrency')} />
            {errors.defaultCurrency && <p className="text-danger-600 text-xs mt-1">{errors.defaultCurrency.message}</p>}
          </div>
          <div>
            <label className="form-label">Default Tax % *</label>
            <input className="input" type="number" {...register('defaultTax', { valueAsNumber: true })} />
            {errors.defaultTax && <p className="text-danger-600 text-xs mt-1">{errors.defaultTax.message}</p>}
          </div>
          <div>
            <label className="form-label">Invoice Prefix *</label>
            <input className="input" {...register('invoicePrefix')} />
            {errors.invoicePrefix && <p className="text-danger-600 text-xs mt-1">{errors.invoicePrefix.message}</p>}
          </div>
          <div>
            <label className="form-label">Quotation Prefix *</label>
            <input className="input" {...register('quotationPrefix')} />
            {errors.quotationPrefix && <p className="text-danger-600 text-xs mt-1">{errors.quotationPrefix.message}</p>}
          </div>
          <div>
            <label className="form-label">Enable BOQ *</label>
            <select className="input" {...register('enableBOQ')}>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.enableBOQ && <p className="text-danger-600 text-xs mt-1">{errors.enableBOQ.message}</p>}
          </div>
          <div>
            <label className="form-label">Enable Auto-Invoice *</label>
            <select className="input" {...register('enableAutoInvoice')}>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.enableAutoInvoice && <p className="text-danger-600 text-xs mt-1">{errors.enableAutoInvoice.message}</p>}
          </div>
          <div>
            <label className="form-label">Notification Email *</label>
            <input className="input" type="email" {...register('notificationEmail')} />
            {errors.notificationEmail && <p className="text-danger-600 text-xs mt-1">{errors.notificationEmail.message}</p>}
          </div>
          <div>
            <label className="form-label">SMS Notification *</label>
            <select className="input" {...register('smsNotification')}>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.smsNotification && <p className="text-danger-600 text-xs mt-1">{errors.smsNotification.message}</p>}
          </div>
          <div>
            <label className="form-label">Allow Partial Delivery *</label>
            <select className="input" {...register('allowPartialDelivery')}>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.allowPartialDelivery && <p className="text-danger-600 text-xs mt-1">{errors.allowPartialDelivery.message}</p>}
          </div>
          <div>
            <label className="form-label">Service Charge % *</label>
            <input className="input" type="number" {...register('serviceCharge', { valueAsNumber: true })} />
            {errors.serviceCharge && <p className="text-danger-600 text-xs mt-1">{errors.serviceCharge.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Remarks</label>
            <input className="input" {...register('remarks')} />
            {errors.remarks && <p className="text-danger-600 text-xs mt-1">{errors.remarks.message}</p>}
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
            className="btn btn-success px-10 py-3 text-base font-bold rounded-full shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
            style={{ minWidth: 120 }}
          >
            Submit
          </button>
        </div>
      </form>
    </section>
  )
}

export default AdditionalStepForm

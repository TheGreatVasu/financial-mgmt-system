import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SelectWithOther from '../ui/SelectWithOther'

const companyTypes = [
  'Private Limited',
  'Public Limited',
  'Partnership',
  'Proprietorship',
  'LLP',
  'Other',
]
const yesNo = ['Yes', 'No']

const customerProfileSchema = z.object({
  customerName: z.string().min(1, 'Customer Name is required'),
  customerCode: z.string().min(1, 'Customer Code is required'),
  gstin: z.string().min(1, 'GSTIN is required'),
  panNumber: z.string().min(1, 'PAN Number is required'),
  companyType: z.string().min(1, 'Company Type is required'),
  segment: z.string().min(1, 'Segment is required'),
  region: z.string().min(1, 'Region is required'),
  zone: z.string().min(1, 'Zone is required'),
  billingAddress: z.string().min(1, 'Billing Address is required'),
  shippingAddress: z.string().min(1, 'Shipping Address is required'),
  contactPersonName: z.string().min(1, 'Contact Person Name is required'),
  contactPersonNumber: z.string().min(1, 'Contact Person Number is required'),
  contactEmailId: z.string().email('Invalid email'),
  creditPeriod: z.coerce.number().min(0, 'Credit Period is required'),
  paymentTerms: z.string().min(1, 'Payment Terms is required'),
  deliveryTerms: z.string().min(1, 'Delivery Terms is required'),
  businessUnit: z.string().min(1, 'Business Unit is required'),
  projectName: z.string().optional(),
  projectManager: z.string().optional(),
  anyHold: z.enum(['Yes', 'No'], { required_error: 'Any Hold is required' }),
  remarks: z.string().optional(),
})

type CustomerProfileFormValues = z.infer<typeof customerProfileSchema>

interface Props {
  defaultValues?: Partial<CustomerProfileFormValues>
  onPrevious: () => void
  onNext: (data: CustomerProfileFormValues) => void
  loading?: boolean
}

const CustomerProfileForm: React.FC<Props> = ({ defaultValues, onPrevious, onNext, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <section className="bg-white rounded-xl shadow-sm border p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Creation of Customer Profile</h2>
      <form onSubmit={handleSubmit(onNext)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Customer Name *</label>
            <input className="input" {...register('customerName')} />
            {errors.customerName && <p className="text-danger-600 text-xs mt-1">{errors.customerName.message}</p>}
          </div>
          <div>
            <label className="form-label">Customer Code *</label>
            <input className="input" {...register('customerCode')} />
            {errors.customerCode && <p className="text-danger-600 text-xs mt-1">{errors.customerCode.message}</p>}
          </div>
          <div>
            <label className="form-label">GSTIN *</label>
            <input className="input" {...register('gstin')} />
            {errors.gstin && <p className="text-danger-600 text-xs mt-1">{errors.gstin.message}</p>}
          </div>
          <div>
            <label className="form-label">PAN Number *</label>
            <input className="input" {...register('panNumber')} />
            {errors.panNumber && <p className="text-danger-600 text-xs mt-1">{errors.panNumber.message}</p>}
          </div>
          <div>
            <label className="form-label">Company Type *</label>
            <SelectWithOther
              className="input"
              {...register('companyType')}
              options={companyTypes.filter(type => type !== 'Other').map(type => ({ value: type, label: type }))}
              placeholder="Select"
              otherLabel="Other"
              otherInputPlaceholder="Enter company type"
            />
            {errors.companyType && <p className="text-danger-600 text-xs mt-1">{errors.companyType.message}</p>}
          </div>
          <div>
            <label className="form-label">Segment *</label>
            <input className="input" {...register('segment')} />
            {errors.segment && <p className="text-danger-600 text-xs mt-1">{errors.segment.message}</p>}
          </div>
          <div>
            <label className="form-label">Region *</label>
            <input className="input" {...register('region')} />
            {errors.region && <p className="text-danger-600 text-xs mt-1">{errors.region.message}</p>}
          </div>
          <div>
            <label className="form-label">Zone *</label>
            <input className="input" {...register('zone')} />
            {errors.zone && <p className="text-danger-600 text-xs mt-1">{errors.zone.message}</p>}
          </div>
          <div>
            <label className="form-label">Billing Address *</label>
            <input className="input" {...register('billingAddress')} />
            {errors.billingAddress && <p className="text-danger-600 text-xs mt-1">{errors.billingAddress.message}</p>}
          </div>
          <div>
            <label className="form-label">Shipping Address *</label>
            <input className="input" {...register('shippingAddress')} />
            {errors.shippingAddress && <p className="text-danger-600 text-xs mt-1">{errors.shippingAddress.message}</p>}
          </div>
          <div>
            <label className="form-label">Contact Person Name *</label>
            <input className="input" {...register('contactPersonName')} />
            {errors.contactPersonName && <p className="text-danger-600 text-xs mt-1">{errors.contactPersonName.message}</p>}
          </div>
          <div>
            <label className="form-label">Contact Person Number *</label>
            <input className="input" {...register('contactPersonNumber')} />
            {errors.contactPersonNumber && <p className="text-danger-600 text-xs mt-1">{errors.contactPersonNumber.message}</p>}
          </div>
          <div>
            <label className="form-label">Contact Email ID *</label>
            <input className="input" type="email" {...register('contactEmailId')} />
            {errors.contactEmailId && <p className="text-danger-600 text-xs mt-1">{errors.contactEmailId.message}</p>}
          </div>
          <div>
            <label className="form-label">Credit Period (Days) *</label>
            <input className="input" type="number" {...register('creditPeriod', { valueAsNumber: true })} />
            {errors.creditPeriod && <p className="text-danger-600 text-xs mt-1">{errors.creditPeriod.message}</p>}
          </div>
          <div>
            <label className="form-label">Payment Terms *</label>
            <input className="input" {...register('paymentTerms')} />
            {errors.paymentTerms && <p className="text-danger-600 text-xs mt-1">{errors.paymentTerms.message}</p>}
          </div>
          <div>
            <label className="form-label">Delivery Terms *</label>
            <input className="input" {...register('deliveryTerms')} />
            {errors.deliveryTerms && <p className="text-danger-600 text-xs mt-1">{errors.deliveryTerms.message}</p>}
          </div>
          <div>
            <label className="form-label">Business Unit *</label>
            <input className="input" {...register('businessUnit')} />
            {errors.businessUnit && <p className="text-danger-600 text-xs mt-1">{errors.businessUnit.message}</p>}
          </div>
          <div>
            <label className="form-label">Project Name</label>
            <input className="input" {...register('projectName')} />
            {errors.projectName && <p className="text-danger-600 text-xs mt-1">{errors.projectName.message}</p>}
          </div>
          <div>
            <label className="form-label">Project Manager</label>
            <input className="input" {...register('projectManager')} />
            {errors.projectManager && <p className="text-danger-600 text-xs mt-1">{errors.projectManager.message}</p>}
          </div>
          <div>
            <label className="form-label">Any Hold *</label>
            <SelectWithOther
              className="input"
              {...register('anyHold')}
              options={yesNo.map(v => ({ value: v, label: v }))}
              placeholder="Select"
              otherLabel="Other"
              otherInputPlaceholder="Please specify"
            />
            {errors.anyHold && <p className="text-danger-600 text-xs mt-1">{errors.anyHold.message}</p>}
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

export default CustomerProfileForm

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const businessTypes = ['Private Limited', 'Public Limited', 'Partnership', 'Proprietorship', 'LLP', 'Other']

const companyProfileSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  legalEntityName: z.string().min(1, 'Legal Entity Name is required'),
  corporateOfficeAddress: z.string().min(1, 'Corporate Office Address is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pinCode: z.string().min(1, 'Pin Code is required'),
  correspondenceAddress: z.string().min(1, 'Correspondence Address is required'),
  gstin: z.string().min(1, 'GSTIN is required'),
  panNumber: z.string().min(1, 'PAN Number is required'),
  cinNumber: z.string().min(1, 'CIN Number is required'),
  businessType: z.string().min(1, 'Business Type is required'),
  businessUnit: z.string().min(1, 'Business Unit is required'),
  website: z.string().url('Website must be a valid URL'),
  emailId: z.string().email('Email is invalid'),
  contactNumber: z.string().min(1, 'Contact Number is required'),
})

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>

interface Props {
  defaultValues?: Partial<CompanyProfileFormValues>
  onPrevious: () => void
  onNext: (data: CompanyProfileFormValues) => void
  loading?: boolean
}

const CompanyProfileForm: React.FC<Props> = ({ defaultValues, onPrevious, onNext, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <section className="bg-white rounded-xl shadow-sm border p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Creation of Company Profile</h2>
      <form onSubmit={handleSubmit(onNext)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Company Name *</label>
            <input className="input" {...register('companyName')} />
            {errors.companyName && <p className="text-danger-600 text-xs mt-1">{errors.companyName.message}</p>}
          </div>
          <div>
            <label className="form-label">Legal Entity Name *</label>
            <input className="input" {...register('legalEntityName')} />
            {errors.legalEntityName && <p className="text-danger-600 text-xs mt-1">{errors.legalEntityName.message}</p>}
          </div>
          <div>
            <label className="form-label">Corporate Office Address *</label>
            <input className="input" {...register('corporateOfficeAddress')} />
            {errors.corporateOfficeAddress && <p className="text-danger-600 text-xs mt-1">{errors.corporateOfficeAddress.message}</p>}
          </div>
          <div>
            <label className="form-label">District *</label>
            <input className="input" {...register('district')} />
            {errors.district && <p className="text-danger-600 text-xs mt-1">{errors.district.message}</p>}
          </div>
          <div>
            <label className="form-label">State *</label>
            <input className="input" {...register('state')} />
            {errors.state && <p className="text-danger-600 text-xs mt-1">{errors.state.message}</p>}
          </div>
          <div>
            <label className="form-label">Country *</label>
            <input className="input" {...register('country')} />
            {errors.country && <p className="text-danger-600 text-xs mt-1">{errors.country.message}</p>}
          </div>
          <div>
            <label className="form-label">Pin Code *</label>
            <input className="input" {...register('pinCode')} />
            {errors.pinCode && <p className="text-danger-600 text-xs mt-1">{errors.pinCode.message}</p>}
          </div>
          <div>
            <label className="form-label">Correspondence Address *</label>
            <input className="input" {...register('correspondenceAddress')} />
            {errors.correspondenceAddress && <p className="text-danger-600 text-xs mt-1">{errors.correspondenceAddress.message}</p>}
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
            <label className="form-label">CIN Number *</label>
            <input className="input" {...register('cinNumber')} />
            {errors.cinNumber && <p className="text-danger-600 text-xs mt-1">{errors.cinNumber.message}</p>}
          </div>
          <div>
            <label className="form-label">Business Type *</label>
            <select className="input" {...register('businessType')}>
              <option value="">Select</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.businessType && <p className="text-danger-600 text-xs mt-1">{errors.businessType.message}</p>}
          </div>
          <div>
            <label className="form-label">Business Unit *</label>
            <input className="input" {...register('businessUnit')} />
            {errors.businessUnit && <p className="text-danger-600 text-xs mt-1">{errors.businessUnit.message}</p>}
          </div>
          <div>
            <label className="form-label">Website *</label>
            <input className="input" {...register('website')} />
            {errors.website && <p className="text-danger-600 text-xs mt-1">{errors.website.message}</p>}
          </div>
          <div>
            <label className="form-label">Email ID *</label>
            <input className="input" type="email" {...register('emailId')} />
            {errors.emailId && <p className="text-danger-600 text-xs mt-1">{errors.emailId.message}</p>}
          </div>
          <div>
            <label className="form-label">Contact Number *</label>
            <input className="input" {...register('contactNumber')} />
            {errors.contactNumber && <p className="text-danger-600 text-xs mt-1">{errors.contactNumber.message}</p>}
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

export default CompanyProfileForm

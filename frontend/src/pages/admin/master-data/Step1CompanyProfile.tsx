import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const companyProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  legalEntityName: z.string().min(1, 'Legal entity name is required'),
  corporateOfficeAddress: z.string().min(1, 'Corporate address is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pinCode: z.string().regex(/^\d{5,6}$/, 'Valid pin code required'),
  correspondenceAddress: z.string().min(1, 'Correspondence address is required'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Valid GSTIN required'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Valid PAN required'),
  cinNumber: z.string().min(1, 'CIN number is required'),
  businessType: z.enum(['Proprietorship', 'Partnership', 'Pvt Ltd', 'Public Ltd']),
  businessUnit: z.string().min(1, 'Business unit is required'),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  emailId: z.string().email('Valid email required'),
  contactNumber: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone number required'),
})

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>

interface Step1CompanyProfileProps {
  onNext?: (data: CompanyProfileFormData) => void
  onPrevious?: () => void
  initialData?: Partial<CompanyProfileFormData>
}

export default function Step1CompanyProfile({
  onNext,
  onPrevious,
  initialData,
}: Step1CompanyProfileProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: initialData || {},
  })

  const onSubmit = (data: CompanyProfileFormData) => {
    if (onNext) {
      onNext(data)
    } else {
      console.log('Company Profile Data:', data)
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
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Creation of Company Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              label="Company Name"
              name="companyName"
              placeholder="Enter company name"
              control={control}
              error={errors.companyName}
            />
            <FormField
              label="Legal Entity Name"
              name="legalEntityName"
              placeholder="Enter legal entity name"
              control={control}
              error={errors.legalEntityName}
            />
            <FormField
              label="Corporate Office Address"
              name="corporateOfficeAddress"
              placeholder="Enter corporate address"
              control={control}
              error={errors.corporateOfficeAddress}
              isTextarea
            />
            <FormField
              label="Correspondence Address"
              name="correspondenceAddress"
              placeholder="Enter correspondence address"
              control={control}
              error={errors.correspondenceAddress}
              isTextarea
            />
            <FormField
              label="District"
              name="district"
              placeholder="Enter district"
              control={control}
              error={errors.district}
            />
            <FormField
              label="State"
              name="state"
              placeholder="Enter state"
              control={control}
              error={errors.state}
            />
            <FormField
              label="Country"
              name="country"
              placeholder="Enter country"
              control={control}
              error={errors.country}
            />
            <FormField
              label="Pin Code"
              name="pinCode"
              placeholder="Enter pin code"
              control={control}
              error={errors.pinCode}
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
              label="CIN Number"
              name="cinNumber"
              placeholder="Enter CIN"
              control={control}
              error={errors.cinNumber}
            />
            <FormField
              label="Business Type"
              name="businessType"
              control={control}
              error={errors.businessType}
              options={['Proprietorship', 'Partnership', 'Pvt Ltd', 'Public Ltd']}
            />
            <FormField
              label="Business Unit"
              name="businessUnit"
              placeholder="Enter business unit"
              control={control}
              error={errors.businessUnit}
            />
            <FormField
              label="Website"
              name="website"
              type="url"
              placeholder="https://example.com"
              control={control}
              error={errors.website}
            />
            <FormField
              label="Email ID"
              name="emailId"
              type="email"
              placeholder="Enter email"
              control={control}
              error={errors.emailId}
            />
            <FormField
              label="Contact Number"
              name="contactNumber"
              placeholder="Enter 10-digit phone"
              control={control}
              error={errors.contactNumber}
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

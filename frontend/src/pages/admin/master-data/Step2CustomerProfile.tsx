import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const phoneRegex = /^\+?\d{7,15}$/
const pinCodeRegex = /^\d{4,10}$/

const customerProfileSchema = z.object({
  logo: z.any().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  legalEntityName: z.string().min(1, 'Legal entity name is required'),
  corporateOfficeAddress: z.string().min(1, 'Corporate office address is required'),
  correspondenceAddress: z.string().min(1, 'Correspondence address is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pinCode: z.string().regex(pinCodeRegex, 'Pin code must be 4-10 digits'),
  segment: z.enum(['Domestic', 'Export']),
  gstNumber: z.string().min(1, 'GST No is required'),
  poIssuingAuthority: z.string().min(1, 'PO Issuing Authority / Contact Person Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  contactNumber: z.string().regex(phoneRegex, 'Enter a valid contact number'),
  emailId: z.string().email('Valid email required'),
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerProfileFormData>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      ...initialData,
      logo: initialData?.logo || null,
    },
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
      <label className="text-sm font-medium text-gray-700">
        {label}
        {name === 'logo' && <span className="text-red-500 ml-1">*</span>}
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
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600">
                      {field.value ? 'LO' : 'Logo'}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800">
                    {logoPreview ? 'Logo uploaded' : 'Upload customer logo'}
                  </p>
                  <p className="text-xs text-gray-500">PNG/JPG/TIF, max 2MB</p>
                </div>
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-700 transition">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.tif,.tiff"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setLogoPreview(reader.result as string)
                        }
                        if (file.type.startsWith('image/') || 
                            file.name.toLowerCase().endsWith('.tif') || 
                            file.name.toLowerCase().endsWith('.tiff')) {
                          reader.readAsDataURL(file)
                        } else {
                          // For unsupported file types, still store the file but show a placeholder
                          setLogoPreview(null)
                        }
                        field.onChange(file)
                      } else {
                        setLogoPreview(null)
                        field.onChange(null)
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

          if (isTextarea) {
            return (
              <textarea
                {...field}
                placeholder={placeholder}
                className={baseClasses}
                rows={3}
              />
            )
          }

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

          return (
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              className={baseClasses}
            />
          )
        }}
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Creation of Customer Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Logo"
              name="logo"
              type="file"
              placeholder="Upload logo"
              control={control}
              error={errors.logo}
            />
            <FormField
              label="Customer Name"
              name="customerName"
              placeholder="Enter customer name"
              control={control}
              error={errors.customerName}
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
              placeholder="Enter corporate office address"
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
              label="Segment"
              name="segment"
              control={control}
              error={errors.segment}
              options={['Domestic', 'Export']}
            />
            <FormField
              label="GST No"
              name="gstNumber"
              placeholder="Enter GST number"
              control={control}
              error={errors.gstNumber}
            />
            <FormField
              label="PO Issuing Authority / Contact Person Name"
              name="poIssuingAuthority"
              placeholder="Enter PO issuing authority or contact person"
              control={control}
              error={errors.poIssuingAuthority}
            />
            <FormField
              label="Designation"
              name="designation"
              placeholder="Enter designation"
              control={control}
              error={errors.designation}
            />
            <FormField
              label="Contact Person Contact No"
              name="contactNumber"
              placeholder="Enter contact number"
              control={control}
              error={errors.contactNumber}
            />
            <FormField
              label="Email ID"
              name="emailId"
              type="email"
              placeholder="Enter email"
              control={control}
              error={errors.emailId}
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

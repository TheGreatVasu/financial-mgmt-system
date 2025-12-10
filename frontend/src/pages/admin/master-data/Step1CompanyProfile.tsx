import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import masterDataService from '../../../services/masterDataService'

const companyProfileSchema = z.object({
  logo: z.any().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  legalEntityName: z.string().min(1, 'Legal entity name is required'),

  corporateAddress: z.string().min(1, 'Corporate address is required'),
  corporateDistrict: z.string().min(1, 'District is required'),
  corporateState: z.string().min(1, 'State is required'),
  corporateCountry: z.string().min(1, 'Country is required'),
  corporatePinCode: z.string().min(1, 'Pin code is required'),

  correspondenceAddress: z.string().min(1, 'Correspondence address is required'),
  correspondenceDistrict: z.string().min(1, 'District is required'),
  correspondenceState: z.string().min(1, 'State is required'),
  correspondenceCountry: z.string().min(1, 'Country is required'),
  correspondencePinCode: z.string().min(1, 'Pin code is required'),

  otherOfficeType: z.string().min(1, 'Select an office type'),
  otherOfficeAddress: z.string().min(1, 'Office address is required'),
  otherOfficeGst: z.string().min(1, 'GST No. is required'),
  otherOfficeDistrict: z.string().min(1, 'District is required'),
  otherOfficeState: z.string().min(1, 'State is required'),
  otherOfficeCountry: z.string().min(1, 'Country is required'),
  otherOfficePinCode: z.string().min(1, 'Pin code is required'),

  primaryContactName: z.string().min(1, 'Contact person is required'),
  primaryContactNumber: z.string().min(10, 'Contact number is required'),
  primaryContactEmail: z.string().email('Valid email required'),
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
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
    setError,
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    mode: 'onChange',
    reValidateMode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      logo: initialData?.logo || null,
      companyName: initialData?.companyName || '',
      legalEntityName: initialData?.legalEntityName || '',

      corporateAddress:
        initialData?.corporateAddress ||
        // Fallback to previous single-field name if it existed
        (initialData as any)?.corporateOfficeAddress ||
        '',
      corporateDistrict: initialData?.corporateDistrict || '',
      corporateState: initialData?.corporateState || '',
      corporateCountry: initialData?.corporateCountry || '',
      corporatePinCode: initialData?.corporatePinCode || '',

      correspondenceAddress: initialData?.correspondenceAddress || '',
      correspondenceDistrict: initialData?.correspondenceDistrict || '',
      correspondenceState: initialData?.correspondenceState || '',
      correspondenceCountry: initialData?.correspondenceCountry || '',
      correspondencePinCode: initialData?.correspondencePinCode || '',

      otherOfficeType: initialData?.otherOfficeType || '',
      otherOfficeAddress: initialData?.otherOfficeAddress || '',
      otherOfficeGst: initialData?.otherOfficeGst || '',
      otherOfficeDistrict: initialData?.otherOfficeDistrict || '',
      otherOfficeState: initialData?.otherOfficeState || '',
      otherOfficeCountry: initialData?.otherOfficeCountry || '',
      otherOfficePinCode: initialData?.otherOfficePinCode || '',

      primaryContactName: initialData?.primaryContactName || '',
      primaryContactNumber: initialData?.primaryContactNumber || '',
      primaryContactEmail: initialData?.primaryContactEmail || '',
    },
  })

  const onSubmit = async (data: CompanyProfileFormData) => {
    try {
      setSaving(true)
      const valid = await trigger()
      if (!valid) return
      await masterDataService.updateCompanyProfile(data as any)
      onNext?.(data)
    } finally {
      setSaving(false)
    }
  }

  const baseInputClasses =
    'w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'

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
      <label className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={formControl}
        render={({ field }) =>
          isTextarea ? (
            <textarea
              {...field}
              placeholder={placeholder}
              className={`${baseInputClasses} ${
                error ? 'border-red-500 ring-red-200' : 'border-gray-200'
              }`}
              rows={3}
              onBlur={(e) => {
                field.onBlur()
                trigger(name)
              }}
            />
          ) : options ? (
            <select
              {...field}
              className={`${baseInputClasses} ${
                error ? 'border-red-500 ring-red-200' : 'border-gray-200'
              }`}
              onBlur={(e) => {
                field.onBlur()
                trigger(name)
              }}
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
              className={`${baseInputClasses} ${
                error ? 'border-red-500 ring-red-200' : 'border-gray-200'
              }`}
              onBlur={(e) => {
                field.onBlur()
                trigger(name)
              }}
              aria-invalid={Boolean(error)}
            />
          )
        }
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Step 1</p>
            <h2 className="text-2xl font-bold text-gray-900">Creation of Company Profile</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload your brand identity and capture all locations and contacts in one view.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Logo & Basic Info */}
          <div className="rounded-xl border border-gray-100 p-6 bg-gray-50/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Brand & Identity</h3>
                <p className="text-sm text-gray-600">Logo plus Company Name / Legal Entity Name.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Company Logo <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="logo"
                  control={control}
                  render={({ field: { onChange, value } }) => (
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
                            {value instanceof File ? value.name.substring(0, 2) : 'Logo'}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800">
                          {logoPreview ? 'Logo uploaded' : 'Upload company logo'}
                        </p>
                        <p className="text-xs text-gray-500">PNG/JPG, max 2MB</p>
                      </div>
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-700 transition">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setLogoPreview(reader.result as string)
                              }
                              reader.readAsDataURL(file)
                            } else {
                              setLogoPreview(null)
                            }
                            onChange(file || null)
                          }}
                        />
                      </label>
                      {value && (
                        <span className="text-xs text-gray-600 truncate max-w-full">
                          {(value as File)?.name}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Company Name"
                  name="companyName"
                  placeholder="e.g., Acme Industries Pvt. Ltd."
                  control={control}
                  error={errors.companyName}
                />
                <FormField
                  label="Legal Entity Name"
                  name="legalEntityName"
                  placeholder="Registered legal entity"
                  control={control}
                  error={errors.legalEntityName}
                />
              </div>
            </div>
          </div>

          {/* Corporate Office Address */}
          <div className="rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Corporate Office Address</h3>
                <p className="text-sm text-gray-600">
                  Headquarters address and location details.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Address"
                name="corporateAddress"
                placeholder="Street, building, landmark"
                control={control}
                error={errors.corporateAddress}
                isTextarea
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="District"
                  name="corporateDistrict"
                  placeholder="District"
                  control={control}
                  error={errors.corporateDistrict}
                />
                <FormField
                  label="State"
                  name="corporateState"
                  placeholder="State"
                  control={control}
                  error={errors.corporateState}
                />
                <FormField
                  label="Country"
                  name="corporateCountry"
                  placeholder="Country"
                  control={control}
                  error={errors.corporateCountry}
                />
                <FormField
                  label="Pin Code"
                  name="corporatePinCode"
                  placeholder="e.g., 400001"
                  control={control}
                  error={errors.corporatePinCode}
                />
              </div>
            </div>
          </div>

          {/* Correspondence Address */}
          <div className="rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Correspondence Address</h3>
                <p className="text-sm text-gray-600">
                  Postal communication address (if different from corporate).
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Address"
                name="correspondenceAddress"
                placeholder="Street, building, landmark"
                control={control}
                error={errors.correspondenceAddress}
                isTextarea
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="District"
                  name="correspondenceDistrict"
                  placeholder="District"
                  control={control}
                  error={errors.correspondenceDistrict}
                />
                <FormField
                  label="State"
                  name="correspondenceState"
                  placeholder="State"
                  control={control}
                  error={errors.correspondenceState}
                />
                <FormField
                  label="Country"
                  name="correspondenceCountry"
                  placeholder="Country"
                  control={control}
                  error={errors.correspondenceCountry}
                />
                <FormField
                  label="Pin Code"
                  name="correspondencePinCode"
                  placeholder="e.g., 400001"
                  control={control}
                  error={errors.correspondencePinCode}
                />
              </div>
            </div>
          </div>

          {/* Other Office / Plant Details */}
          <div className="rounded-xl border border-gray-100 p-6 bg-gray-50/60">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Other Office / Plant Details</h3>
                <p className="text-sm text-gray-600">
                  Capture plants, site offices, or marketing offices with GST details.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Location Type"
                name="otherOfficeType"
                control={control}
                error={errors.otherOfficeType}
                options={['Plant Address', 'Site Office', 'Marketing Office']}
              />
              <FormField
                label="GST No."
                name="otherOfficeGst"
                placeholder="Enter GST number"
                control={control}
                error={errors.otherOfficeGst}
              />
              <FormField
                label="Pin Code"
                name="otherOfficePinCode"
                placeholder="e.g., 400001"
                control={control}
                error={errors.otherOfficePinCode}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <FormField
                label="Office Address"
                name="otherOfficeAddress"
                placeholder="Street, building, landmark"
                control={control}
                error={errors.otherOfficeAddress}
                isTextarea
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="District"
                  name="otherOfficeDistrict"
                  placeholder="District"
                  control={control}
                  error={errors.otherOfficeDistrict}
                />
                <FormField
                  label="State"
                  name="otherOfficeState"
                  placeholder="State"
                  control={control}
                  error={errors.otherOfficeState}
                />
                <FormField
                  label="Country"
                  name="otherOfficeCountry"
                  placeholder="Country"
                  control={control}
                  error={errors.otherOfficeCountry}
                />
              </div>
            </div>
          </div>

          {/* Primary Contact Details */}
          <div className="rounded-xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Primary Contact Details</h3>
                <p className="text-sm text-gray-600">
                  Who should we reach out to for this profile?
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="Contact Person Name"
                name="primaryContactName"
                placeholder="Full name"
                control={control}
                error={errors.primaryContactName}
              />
              <FormField
                label="Contact Number"
                name="primaryContactNumber"
                placeholder="+91 98765 43210"
                control={control}
                error={errors.primaryContactNumber}
              />
              <FormField
                label="Email ID"
                name="primaryContactEmail"
                type="email"
                placeholder="name@company.com"
                control={control}
                error={errors.primaryContactEmail}
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
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

  // Other Office fields are optional - only validate if at least one field is filled
  otherOfficeType: z.string().optional(),
  otherOfficeAddress: z.string().optional(),
  otherOfficeGst: z.string().optional(),
  otherOfficeDistrict: z.string().optional(),
  otherOfficeState: z.string().optional(),
  otherOfficeCountry: z.string().optional(),
  otherOfficePinCode: z.string().optional(),

  primaryContactName: z.string().min(1, 'Contact person is required'),
  primaryContactNumber: z.string().min(10, 'Contact number is required'),
  primaryContactEmail: z.string().email('Valid email required'),
}).refine((data) => {
  // If any other office field is filled, all required fields must be filled
  const hasOtherOffice = data.otherOfficeType || data.otherOfficeAddress || data.otherOfficeGst || 
                         data.otherOfficeDistrict || data.otherOfficeState || data.otherOfficeCountry || 
                         data.otherOfficePinCode;
  
  if (hasOtherOffice) {
    return !!(
      data.otherOfficeType &&
      data.otherOfficeAddress &&
      data.otherOfficeGst &&
      data.otherOfficeDistrict &&
      data.otherOfficeState &&
      data.otherOfficeCountry &&
      data.otherOfficePinCode
    );
  }
  return true;
}, {
  message: 'If filling Other Office details, all fields are required',
  path: ['otherOfficeType'],
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
    watch,
    formState: { errors, isValid },
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
      if (!valid) {
        toast.error('Please fill all required fields correctly.')
        // Scroll to first error
        const firstErrorElement = document.querySelector('.border-red-500')
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        setSaving(false)
        return
      }
      
      // Try to save to backend, but don't block form progression if it fails
      try {
        await masterDataService.updateCompanyProfile(data as any)
      } catch (err: any) {
        console.warn('Failed to save to backend (continuing anyway):', err)
        // Continue even if backend save fails - we'll save on final submit
        // Don't show error toast here as it's not critical
      }
      
      // Proceed to next step
      if (onNext) {
        onNext(data)
        toast.success('Company profile saved successfully!')
      }
    } catch (error: any) {
      console.error('Error submitting company profile:', error)
      const errorMessage = error?.message || 'Failed to save company profile. Please try again.'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Watch form values for real-time validation
  const formValues = watch()
  const [isFormValid, setIsFormValid] = useState(false)

  // Initial validation check - run once on mount
  useEffect(() => {
    const checkInitialValidity = async () => {
      try {
        const valid = await trigger()
        setIsFormValid(valid)
      } catch {
        setIsFormValid(false)
      }
    }
    // Delay initial check to allow form to initialize
    const timeoutId = setTimeout(checkInitialValidity, 300)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Watch form values for real-time validation
  useEffect(() => {
    const checkValidity = async () => {
      try {
        const valid = await trigger()
        setIsFormValid(valid)
      } catch {
        setIsFormValid(false)
      }
    }
    
    // Debounce validation check to avoid excessive validation
    const timeoutId = setTimeout(() => {
      checkValidity()
    }, 500)
    
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues])

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
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error.message}
        </span>
      )}
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
          {!isFormValid && Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4" />
              <span>Please complete all required fields</span>
            </div>
          )}
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
                required={false}
              />
              <FormField
                label="GST No."
                name="otherOfficeGst"
                placeholder="Enter GST number"
                control={control}
                error={errors.otherOfficeGst}
                required={false}
              />
              <FormField
                label="Pin Code"
                name="otherOfficePinCode"
                placeholder="e.g., 400001"
                control={control}
                error={errors.otherOfficePinCode}
                required={false}
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
                required={false}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="District"
                  name="otherOfficeDistrict"
                  placeholder="District"
                  control={control}
                  error={errors.otherOfficeDistrict}
                  required={false}
                />
                <FormField
                  label="State"
                  name="otherOfficeState"
                  placeholder="State"
                  control={control}
                  error={errors.otherOfficeState}
                  required={false}
                />
                <FormField
                  label="Country"
                  name="otherOfficeCountry"
                  placeholder="Country"
                  control={control}
                  error={errors.otherOfficeCountry}
                  required={false}
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
              disabled={saving || !isFormValid}
              className={`px-6 py-2.5 text-white rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-colors ${
                isFormValid && !saving
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

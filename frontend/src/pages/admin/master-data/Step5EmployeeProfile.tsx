import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const employeeProfileSchema = z.object({
  profilePhoto: z.any().optional(),
  teamMemberName: z.string().min(1, 'Employee name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  contactNumber: z.string().min(1, 'Phone number is required'),
  emailId: z.string().email('Valid email required'),
  reportingManager: z.string().min(1, 'Reporting manager is required'),
  location: z.string().min(1, 'Location is required'),
  accessLevel: z.string().min(1, 'Access level is required'),
  remarks: z.string().optional().or(z.literal('')),
})

type EmployeeProfileFormData = z.infer<typeof employeeProfileSchema>

interface Step5EmployeeProfileProps {
  onNext?: (data: EmployeeProfileFormData) => void
  onPrevious?: () => void
  initialData?: Partial<EmployeeProfileFormData>
}

export default function Step5EmployeeProfile({
  onNext,
  onPrevious,
  initialData,
}: Step5EmployeeProfileProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeProfileFormData>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: {
      ...initialData,
      profilePhoto: initialData?.profilePhoto || null,
    },
  })

  const onSubmit = (data: EmployeeProfileFormData) => {
    if (onNext) {
      onNext(data)
    } else {
      console.log('Employee Profile Data:', data)
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
        {name === 'profilePhoto' && <span className="text-red-500 ml-1">*</span>}
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
                <div className="w-20 h-20 rounded-full bg-blue-50 overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 text-2xl">
                      {field.value ? field.value.toString().substring(0, 2).toUpperCase() : 'PH'}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800">
                    {photoPreview ? 'Photo uploaded' : 'Upload profile photo'}
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
                          setPhotoPreview(reader.result as string)
                        }
                        if (file.type.startsWith('image/') || 
                            file.name.toLowerCase().endsWith('.tif') || 
                            file.name.toLowerCase().endsWith('.tiff')) {
                          reader.readAsDataURL(file)
                        } else {
                          setPhotoPreview(null)
                        }
                        field.onChange(file)
                      } else {
                        setPhotoPreview(null)
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
              <select
                {...field}
                className={baseClasses}
              >
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
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Creation of Employee Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField
                label="Profile Photo"
                name="profilePhoto"
                type="file"
                control={control}
                error={errors.profilePhoto}
              />
            </div>
            <FormField
              label="Employee Name"
              name="teamMemberName"
              placeholder="Enter employee name"
              control={control}
              error={errors.teamMemberName}
            />
            <FormField
              label="Employee ID"
              name="employeeId"
              placeholder="Enter employee ID"
              control={control}
              error={errors.employeeId}
            />
            <FormField
              label="Role"
              name="role"
              control={control}
              error={errors.role}
              options={['Manager', 'Accountant', 'Sales', 'Operations']}
            />
            <FormField
              label="Department"
              name="department"
              placeholder="Enter department"
              control={control}
              error={errors.department}
            />
            <FormField
              label="Contact Number"
              name="contactNumber"
              placeholder="Enter 10-digit phone"
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
            <FormField
              label="Reporting Manager"
              name="reportingManager"
              placeholder="Enter reporting manager"
              control={control}
              error={errors.reportingManager}
            />
            <FormField
              label="Location"
              name="location"
              placeholder="Enter location"
              control={control}
              error={errors.location}
            />
            <FormField
              label="Access Level"
              name="accessLevel"
              control={control}
              error={errors.accessLevel}
              options={['Admin', 'Standard', 'Viewer']}
            />
            <div>
              <FormField
                label="Remarks"
                name="remarks"
                placeholder="Enter remarks (optional)"
                control={control}
                error={errors.remarks}
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


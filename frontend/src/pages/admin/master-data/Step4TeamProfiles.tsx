import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const teamProfileSchema = z.object({
  teamMemberName: z.string().min(1, 'Team member name is required'),
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

type TeamProfileFormData = z.infer<typeof teamProfileSchema>

interface Step4TeamProfilesProps {
  onNext?: (data: TeamProfileFormData) => void
  onPrevious?: () => void
  initialData?: Partial<TeamProfileFormData>
}

export default function Step4TeamProfiles({
  onNext,
  onPrevious,
  initialData,
}: Step4TeamProfilesProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamProfileFormData>({
    resolver: zodResolver(teamProfileSchema),
    defaultValues: initialData || {},
  })

  const onSubmit = (data: TeamProfileFormData) => {
    if (onNext) {
      onNext(data)
    } else {
      console.log('Team Profile Data:', data)
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
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Team Profiles</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6">
            <FormField
              label="Team Member Name"
              name="teamMemberName"
              placeholder="Enter team member name"
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

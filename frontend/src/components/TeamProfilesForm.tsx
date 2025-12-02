import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const accessLevels = ['Admin', 'Manager', 'User', 'Viewer']

const teamProfileSchema = z.object({
  teamMemberName: z.string().min(1, 'Team Member Name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  contactNumber: z.string().min(1, 'Contact Number is required'),
  emailId: z.string().email('Email is invalid'),
  reportingManager: z.string().min(1, 'Reporting Manager is required'),
  location: z.string().min(1, 'Location is required'),
  accessLevel: z.string().min(1, 'Access Level is required'),
  remarks: z.string().optional(),
})

type TeamProfileFormValues = z.infer<typeof teamProfileSchema>

interface Props {
  defaultValues?: Partial<TeamProfileFormValues>
  onPrevious: () => void
  onNext: (data: TeamProfileFormValues) => void
  loading?: boolean
}

const TeamProfilesForm: React.FC<Props> = ({ defaultValues, onPrevious, onNext, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamProfileFormValues>({
    resolver: zodResolver(teamProfileSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <section className="bg-white rounded-xl shadow-sm border p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Team Profiles</h2>
      <form onSubmit={handleSubmit(onNext)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Team Member Name *</label>
            <input className="input" {...register('teamMemberName')} />
            {errors.teamMemberName && <p className="text-danger-600 text-xs mt-1">{errors.teamMemberName.message}</p>}
          </div>
          <div>
            <label className="form-label">Employee ID *</label>
            <input className="input" {...register('employeeId')} />
            {errors.employeeId && <p className="text-danger-600 text-xs mt-1">{errors.employeeId.message}</p>}
          </div>
          <div>
            <label className="form-label">Role *</label>
            <input className="input" {...register('role')} />
            {errors.role && <p className="text-danger-600 text-xs mt-1">{errors.role.message}</p>}
          </div>
          <div>
            <label className="form-label">Department *</label>
            <input className="input" {...register('department')} />
            {errors.department && <p className="text-danger-600 text-xs mt-1">{errors.department.message}</p>}
          </div>
          <div>
            <label className="form-label">Contact Number *</label>
            <input className="input" {...register('contactNumber')} />
            {errors.contactNumber && <p className="text-danger-600 text-xs mt-1">{errors.contactNumber.message}</p>}
          </div>
          <div>
            <label className="form-label">Email ID *</label>
            <input className="input" type="email" {...register('emailId')} />
            {errors.emailId && <p className="text-danger-600 text-xs mt-1">{errors.emailId.message}</p>}
          </div>
          <div>
            <label className="form-label">Reporting Manager *</label>
            <input className="input" {...register('reportingManager')} />
            {errors.reportingManager && <p className="text-danger-600 text-xs mt-1">{errors.reportingManager.message}</p>}
          </div>
          <div>
            <label className="form-label">Location *</label>
            <input className="input" {...register('location')} />
            {errors.location && <p className="text-danger-600 text-xs mt-1">{errors.location.message}</p>}
          </div>
          <div>
            <label className="form-label">Access Level *</label>
            <select className="input" {...register('accessLevel')}>
              <option value="">Select</option>
              {accessLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.accessLevel && <p className="text-danger-600 text-xs mt-1">{errors.accessLevel.message}</p>}
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

export default TeamProfilesForm

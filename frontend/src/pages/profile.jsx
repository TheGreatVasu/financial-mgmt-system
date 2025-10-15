import { useAuthContext } from '../context/AuthContext.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'

export default function Profile() {
  const { user } = useAuthContext()

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-secondary-600 mt-1">Manage your account details</p>
      </div>
      <div className="max-w-3xl space-y-4">
        <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-secondary-500">First name</div>
              <div className="font-medium">{user?.firstName || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-secondary-500">Last name</div>
              <div className="font-medium">{user?.lastName || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-secondary-500">Email</div>
              <div className="font-medium">{user?.email || '-'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-medium">Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="input" placeholder="Current password" type="password" />
            <input className="input" placeholder="New password" type="password" />
            <button className="btn btn-primary">Update</button>
          </div>
          <div className="text-xs text-secondary-500">This is a placeholder UI.</div>
        </div>
      </div>
    </DashboardLayout>
  )
}



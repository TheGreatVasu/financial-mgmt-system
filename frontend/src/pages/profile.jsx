import { useAuthContext } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user } = useAuthContext()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">My Profile</h1>
      <div className="card p-6 space-y-3">
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

      <div className="card p-6 space-y-3">
        <h2 className="font-medium">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Current password" type="password" />
          <input className="input" placeholder="New password" type="password" />
          <button className="btn btn-primary">Update</button>
        </div>
        <div className="text-xs text-secondary-500">This is a placeholder UI.</div>
      </div>
    </div>
  )
}



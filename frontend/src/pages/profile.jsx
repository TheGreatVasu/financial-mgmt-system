import { useEffect, useState } from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { changePasswordApi } from '../services/authService'
import { useToast } from '../components/ui/Toast.jsx'

export default function Profile() {
  const { user, updateProfile, token } = useAuthContext()
  const toast = useToast()
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' })
  const [pwdSaving, setPwdSaving] = useState(false)

  useEffect(() => {
    setProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    })
  }, [user])

  function onChange(e) {
    const { name, value } = e.target
    setProfile((s) => ({ ...s, [name]: value }))
  }

  async function onSave(e) {
    e.preventDefault()
    if (!profile.firstName || !profile.lastName || !profile.email) {
      toast.add('All fields are required', 'error')
      return
    }
    setSaving(true)
    try {
      await updateProfile(profile)
      toast.add('Profile updated', 'success')
    } catch (err) {
      toast.add('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function onChangePassword(e) {
    e.preventDefault()
    if (!pwd.currentPassword || !pwd.newPassword) {
      toast.add('Enter both current and new password', 'error')
      return
    }
    if (pwd.newPassword.length < 6) {
      toast.add('New password must be at least 6 characters', 'error')
      return
    }
    setPwdSaving(true)
    try {
      await changePasswordApi(token, pwd)
      setPwd({ currentPassword: '', newPassword: '' })
      toast.add('Password changed', 'success')
    } catch {
      toast.add('Failed to change password', 'error')
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-secondary-600 mt-1">Manage your account details</p>
      </div>
      <div className="max-w-3xl space-y-4">
        <form onSubmit={onSave} className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-secondary-500">First name</label>
              <input name="firstName" className="input mt-1" value={profile.firstName} onChange={onChange} placeholder="First name" />
            </div>
            <div>
              <label className="text-sm text-secondary-500">Last name</label>
              <input name="lastName" className="input mt-1" value={profile.lastName} onChange={onChange} placeholder="Last name" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-secondary-500">Email</label>
              <input name="email" type="email" className="input mt-1" value={profile.email} onChange={onChange} placeholder="Email" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            <div className="text-xs text-secondary-500">Profile information is used across invoices and notifications.</div>
          </div>
        </form>

        <form onSubmit={onChangePassword} className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-medium">Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="input" placeholder="Current password" type="password" value={pwd.currentPassword} onChange={(e)=>setPwd((s)=>({...s, currentPassword: e.target.value}))} />
            <input className="input" placeholder="New password" type="password" value={pwd.newPassword} onChange={(e)=>setPwd((s)=>({...s, newPassword: e.target.value}))} />
            <button type="submit" className="btn btn-primary" disabled={pwdSaving}>{pwdSaving ? 'Updating…' : 'Update'}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}



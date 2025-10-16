import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { changePasswordApi } from '../services/authService'
import { useToast } from '../components/ui/Toast.jsx'
import { Camera, Eye, EyeOff, ShieldCheck, ShieldAlert, Smartphone, Mail, LogOut } from 'lucide-react'

export default function Profile() {
  const { user, updateProfile, token } = useAuthContext()
  const toast = useToast()
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '' })
  const [saving, setSaving] = useState(false)
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false })
  const [avatar, setAvatar] = useState('')
  const [prefs, setPrefs] = useState({ emailNotifs: true, autoBackups: false, showTips: true })
  const [themePreview, setThemePreview] = useState(() => (localStorage.getItem('theme') || 'light'))
  const fileRef = useRef(null)
  const [sessions, setSessions] = useState(() => ([
    { id: 'sess-1', device: 'Chrome on macOS', last: '2 hours ago', current: true },
    { id: 'sess-2', device: 'Safari on iPhone', last: 'Yesterday 9:13 PM', current: false },
  ]))

  useEffect(() => {
    setProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
    })
    // mock avatar fallback using initials
    setAvatar(user?.avatar || '')
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
    if (pwd.newPassword !== pwd.confirmPassword) {
      toast.add('Passwords do not match', 'error')
      return
    }
    setPwdSaving(true)
    try {
      await changePasswordApi(token, pwd)
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.add('Password changed', 'success')
    } catch {
      toast.add('Failed to change password', 'error')
    } finally {
      setPwdSaving(false)
    }
  }

  function onReset() {
    setProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
    })
  }

  function onAvatarPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatar(url)
  }

  function applyTheme(value) {
    setThemePreview(value)
    if (value === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', value)
  }

  const passwordStrength = useMemo(() => {
    const v = pwd.newPassword || ''
    let score = 0
    if (v.length >= 8) score++
    if (/[A-Z]/.test(v)) score++
    if (/[0-9]/.test(v)) score++
    if (/[^A-Za-z0-9]/.test(v)) score++
    return score
  }, [pwd.newPassword])

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-secondary-600 mt-1">Manage your account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile header */}
          <div className="card p-6 flex items-start gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary-600 text-white grid place-items-center text-xl font-semibold overflow-hidden">
                {avatar ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" /> : initials(user)}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 -right-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-white dark:bg-[#1E293B] border border-secondary-300 dark:border-secondary-700 shadow">
                <Camera className="h-3.5 w-3.5" /> Change
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold">{user?.firstName} {user?.lastName}</div>
              <div className="text-sm text-secondary-600">{user?.email}</div>
              <div className="mt-1 inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-primary-50 text-primary-700 border border-primary-200">Finance Admin</div>
            </div>
          </div>

          {/* Personal details */}
          <form onSubmit={onSave} className="card p-6 space-y-5">
            <div className="text-sm font-medium">Personal Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput label="First Name" name="firstName" value={profile.firstName} onChange={onChange} />
              <FloatingInput label="Last Name" name="lastName" value={profile.lastName} onChange={onChange} />
              <FloatingInput label="Email" type="email" name="email" value={profile.email} onChange={onChange} />
              <FloatingInput label="Phone Number" name="phone" value={profile.phone} onChange={onChange} />
              <FloatingInput label="Company Name" name="company" value={profile.company} onChange={onChange} className="md:col-span-2" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn btn-primary btn-md" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              <button type="button" onClick={onReset} className="btn btn-outline btn-md">Reset</button>
            </div>
          </form>

          {/* Security & Password */}
          <form onSubmit={onChangePassword} className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Security & Password</div>
              <div className="text-xs text-secondary-500">Last changed: 32 days ago</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PasswordInput label="Current Password" value={pwd.currentPassword} onChange={(v)=>setPwd((s)=>({...s, currentPassword: v}))} visible={showPwd.current} onToggle={()=>setShowPwd((s)=>({...s, current: !s.current}))} />
              <PasswordInput label="New Password" value={pwd.newPassword} onChange={(v)=>setPwd((s)=>({...s, newPassword: v}))} visible={showPwd.next} onToggle={()=>setShowPwd((s)=>({...s, next: !s.next}))} />
              <PasswordInput label="Confirm Password" value={pwd.confirmPassword} onChange={(v)=>setPwd((s)=>({...s, confirmPassword: v}))} visible={showPwd.confirm} onToggle={()=>setShowPwd((s)=>({...s, confirm: !s.confirm}))} />
            </div>
            <PasswordStrength score={passwordStrength} />
            <div className="flex items-center gap-3">
              <button type="submit" className="btn btn-primary btn-md" disabled={pwdSaving}>{pwdSaving ? 'Updating…' : 'Update Password'}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <ToggleRow label="Two-Factor Authentication (2FA)" hint="Adds an extra security step on login" />
              <div className="space-y-2">
                <div className="text-xs text-secondary-600">2FA Method</div>
                <div className="flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2"><input type="radio" name="twofa" defaultChecked /> <Mail className="h-4 w-4" /> Email OTP</label>
                  <label className="inline-flex items-center gap-2"><input type="radio" name="twofa" /> <Smartphone className="h-4 w-4" /> Authenticator App</label>
                </div>
              </div>
            </div>
          </form>

          {/* Preferences & Theme */}
          <div className="card p-6 space-y-5">
            <div className="text-sm font-medium">Account Preferences</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CheckboxRow label="Receive Email Notifications" checked={prefs.emailNotifs} onChange={(v)=>setPrefs((s)=>({...s, emailNotifs: v}))} />
              <CheckboxRow label="Enable Auto Backups" checked={prefs.autoBackups} onChange={(v)=>setPrefs((s)=>({...s, autoBackups: v}))} />
              <CheckboxRow label="Show Dashboard Tips" checked={prefs.showTips} onChange={(v)=>setPrefs((s)=>({...s, showTips: v}))} />
            </div>

            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Theme Settings</div>
              <div className="inline-flex items-center gap-3 p-2 rounded-lg border border-secondary-200 dark:border-secondary-700">
                <button onClick={()=>applyTheme('light')} className={`px-3 py-1.5 rounded-md text-sm ${themePreview==='light' ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-[#1E293B]'}`}>Light</button>
                <button onClick={()=>applyTheme('dark')} className={`px-3 py-1.5 rounded-md text-sm ${themePreview==='dark' ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-[#1E293B]'}`}>Dark</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6">
            <div className="text-sm font-medium">Activity Overview</div>
            <div className="mt-3 space-y-3 text-sm">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-md border border-secondary-200 dark:border-secondary-700">
                  <div>
                    <div className="font-medium">{s.device} {s.current ? <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">Current</span> : null}</div>
                    <div className="text-xs text-secondary-600">Last active: {s.last}</div>
                  </div>
                  <button className="text-xs text-danger-600 hover:underline">Log out</button>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full inline-flex items-center justify-center gap-2 btn btn-outline"><LogOut className="h-4 w-4" /> Log Out from All Devices</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
function FloatingInput({ label, className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <input {...props} className={`input peer placeholder-transparent focus:bg-primary-50/40`} placeholder={label} />
      <label className="pointer-events-none absolute left-3 top-2.5 bg-white dark:bg-[#1E293B] px-1 text-xs text-secondary-500 transition-all
        peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm
        peer-focus:top-[-10px] peer-focus:text-xs
        peer-[&:not(:placeholder-shown)]:top-[-10px] peer-[&:not(:placeholder-shown)]:text-xs">
        {label}
      </label>
    </div>
  )
}

function PasswordInput({ label, value, onChange, visible, onToggle }) {
  return (
    <div className="relative">
      <input className="input pr-9" placeholder={label} type={visible ? 'text' : 'password'} value={value} onChange={(e)=>onChange(e.target.value)} />
      <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700">
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function PasswordStrength({ score }) {
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-danger-400','bg-warning-400','bg-primary-500','bg-success-500']
  const pct = (score/4)*100
  return (
    <div>
      <div className="h-2 rounded bg-secondary-200 overflow-hidden">
        <div className={`h-full ${colors[Math.max(0, score-1)]}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-secondary-600">Strength: {labels[Math.max(0, score-1)] || 'Weak'}</div>
    </div>
  )
}

function ToggleRow({ label, hint }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex items-center justify-between p-3 rounded-md border border-secondary-200 dark:border-secondary-700">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint ? <div className="text-xs text-secondary-600">{hint}</div> : null}
      </div>
      <button type="button" onClick={()=>setChecked((v)=>!v)} className={`w-10 h-6 rounded-full p-0.5 transition-colors ${checked ? 'bg-primary-600' : 'bg-secondary-300'}`}>
        <span className={`h-5 w-5 bg-white rounded-full block transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function initials(user) {
  const f = user?.firstName?.[0] || 'U'
  const l = user?.lastName?.[0] || 'N'
  return (f + l).toUpperCase()
}



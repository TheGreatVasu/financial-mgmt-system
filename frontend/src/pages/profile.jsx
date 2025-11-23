import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { changePasswordApi, uploadProfileImage, updatePreferences } from '../services/authService'
import { useToast } from '../components/ui/Toast.jsx'
import { Camera, Eye, EyeOff, ShieldCheck, ShieldAlert, Smartphone, Mail, LogOut } from 'lucide-react'
import { initializeSocket, disconnectSocket, getSocket } from '../services/socketService'
import { getSessions, logoutSession, logoutAllSessions, updateSessionActivity, formatTimeAgo } from '../services/sessionService'

// Helper function to get role display name
function getRoleDisplayName(role) {
  const roleMap = {
    'business_user': 'Business User',
    'company_admin': 'Company Admin',
    'system_admin': 'System Admin',
    'admin': 'System Admin',
    'user': 'Business User'
  }
  return roleMap[role] || role || 'User'
}

// Helper function to generate initials
function getInitials(user) {
  const f = user?.firstName?.[0] || 'U'
  const l = user?.lastName?.[0] || 'N'
  return (f + l).toUpperCase()
}

// Helper function to get profile image URL
function getProfileImageUrl(profileImageUrl, baseUrl = '') {
  if (!profileImageUrl) return null
  if (profileImageUrl.startsWith('http')) return profileImageUrl
  // If it starts with /, it's already a full path from backend
  if (profileImageUrl.startsWith('/')) {
    // If baseUrl is set and doesn't end with /, use it as-is
    if (baseUrl && !baseUrl.endsWith('/')) {
      return `${baseUrl}${profileImageUrl}`
    }
    // Otherwise, if baseUrl ends with / or is empty, construct properly
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    return cleanBase ? `${cleanBase}${profileImageUrl}` : profileImageUrl
  }
  // Fallback: construct path
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return cleanBase ? `${cleanBase}/uploads/profile/${profileImageUrl}` : `/uploads/profile/${profileImageUrl}`
}

export default function Profile() {
  const { user, updateProfile, token, refresh } = useAuthContext()
  const toast = useToast()
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false)
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false })
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [prefs, setPrefs] = useState({ 
    emailNotifications: true, 
    autoBackups: false, 
    showTips: true,
    theme: 'light',
    twoFactorEnabled: false,
    twoFactorMethod: 'email'
  })
  const [themePreview, setThemePreview] = useState('light')
  const fileRef = useRef(null)
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [currentToken, setCurrentToken] = useState(null)
  const activityIntervalRef = useRef(null)

  // Get API base URL for profile image
  const apiBaseUrl = import.meta?.env?.VITE_API_BASE_URL || ''

  // Initialize Socket.io and load sessions
  useEffect(() => {
    if (!token || !user) return

    setCurrentToken(token)

    // Initialize Socket.io
    const socket = initializeSocket(token)

    // Set up session update listener
    socket.on('sessions:update', (updatedSessions) => {
      setSessions(updatedSessions || [])
      setLoadingSessions(false)
    })

    // Handle logout all event
    socket.on('sessions:logout-all', () => {
      // User was logged out from all devices
      toast.add('You have been logged out from all devices', 'info')
      // The AuthContext should handle the logout
    })

    // Load initial sessions
    loadSessions()

    // Set up periodic activity updates (every 30 seconds)
    activityIntervalRef.current = setInterval(() => {
      updateSessionActivity(token).catch(() => {
        // Silently fail
      })
    }, 30000)

    // Cleanup
    return () => {
      socket.off('sessions:update')
      socket.off('sessions:logout-all')
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
      }
    }
  }, [token, user])

  // Update socket token when it changes
  useEffect(() => {
    if (token && token !== currentToken) {
      const socket = getSocket()
      if (socket) {
        socket.auth.token = token
        socket.disconnect()
        socket.connect()
      }
      setCurrentToken(token)
    }
  }, [token, currentToken])

  async function loadSessions() {
    if (!token) return
    try {
      setLoadingSessions(true)
      const sessionData = await getSessions(token)
      setSessions(sessionData || [])
    } catch (err) {
      console.error('Failed to load sessions:', err)
      toast.add('Failed to load sessions', 'error')
    } finally {
      setLoadingSessions(false)
    }
  }

  async function handleLogoutSession(sessionToken) {
    if (!token) return
    try {
      await logoutSession(token, sessionToken)
      toast.add('Session logged out successfully', 'success')
      // Socket.io will update sessions automatically
    } catch (err) {
      toast.add(err.message || 'Failed to logout session', 'error')
    }
  }

  async function handleLogoutAll() {
    if (!token) return
    try {
      await logoutAllSessions(token)
      toast.add('Logged out from all devices successfully', 'success')
      // Socket.io will update sessions automatically
      // Note: Current session will also be logged out, so user will be redirected
    } catch (err) {
      toast.add(err.message || 'Failed to logout all sessions', 'error')
    }
  }

  // Sync profile data from user context
  useEffect(() => {
    if (user) {
    setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      })
      
      // Set profile image URL (check both avatarUrl and profileImageUrl for backward compatibility)
      const imageUrl = user.profileImageUrl || user.avatarUrl
      if (imageUrl) {
        const fullUrl = getProfileImageUrl(imageUrl, apiBaseUrl)
        setProfileImageUrl(fullUrl)
      } else {
        setProfileImageUrl('')
      }

      // Sync preferences from user data
      if (user.preferences) {
        const userPrefs = typeof user.preferences === 'string' 
          ? JSON.parse(user.preferences) 
          : user.preferences
        setPrefs(prev => ({
          ...prev,
          ...userPrefs
        }))
        if (userPrefs.theme) {
          setThemePreview(userPrefs.theme)
          if (userPrefs.theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          localStorage.setItem('theme', userPrefs.theme)
        }
      } else {
        // Load theme from localStorage if not in preferences
        const savedTheme = localStorage.getItem('theme') || 'light'
        setThemePreview(savedTheme)
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }, [user, apiBaseUrl])

  function onChange(e) {
    const { name, value } = e.target
    setProfile((s) => ({ ...s, [name]: value }))
  }

  async function onSave(e) {
    e.preventDefault()
    if (!profile.firstName || !profile.lastName || !profile.email) {
      toast.add('First name, last name, and email are required', 'error')
      return
    }
    setSaving(true)
    try {
      await updateProfile({ 
        firstName: profile.firstName, 
        lastName: profile.lastName, 
        email: profile.email,
        phoneNumber: profile.phoneNumber
      })
      // Refresh user data to get latest from backend
      await refresh()
      toast.add('Profile updated successfully', 'success')
    } catch (err) {
      toast.add(err.message || 'Failed to update profile', 'error')
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
      await changePasswordApi(token, { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.add('Password changed successfully', 'success')
    } catch (err) {
      toast.add(err.message || 'Failed to change password', 'error')
    } finally {
      setPwdSaving(false)
    }
  }

  function onReset() {
    if (user) {
    setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
    })
    }
  }

  async function onProfileImagePick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.add('Please select an image file', 'error')
      return
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.add('Image size must be less than 5MB', 'error')
      return
    }

    setUploadingProfileImage(true)
    try {
      const updatedUser = await uploadProfileImage(token, file)
      // Update profile image URL immediately
      const imageUrl = updatedUser.profileImageUrl || updatedUser.avatarUrl
      if (imageUrl) {
        const fullUrl = getProfileImageUrl(imageUrl, apiBaseUrl)
        setProfileImageUrl(fullUrl)
      }
      // Refresh user data
      await refresh()
      toast.add('Profile image uploaded successfully', 'success')
    } catch (err) {
      toast.add(err.message || 'Failed to upload profile image', 'error')
    } finally {
      setUploadingProfileImage(false)
      // Reset file input
      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }

  async function applyTheme(value) {
    setThemePreview(value)
    if (value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', value)
    
    // Save to backend
    try {
      await updatePreferences(token, { theme: value })
      await refresh()
    } catch (err) {
      console.error('Failed to save theme preference:', err)
    }
  }

  async function handlePreferenceChange(key, value) {
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)
    
    // Save to backend
    try {
      await updatePreferences(token, { [key]: value })
      await refresh()
    } catch (err) {
      console.error('Failed to save preference:', err)
      // Revert on error
      setPrefs(prefs)
    }
  }

  async function handle2FAChange(enabled) {
    await handlePreferenceChange('twoFactorEnabled', enabled)
  }

  async function handle2FAMethodChange(method) {
    await handlePreferenceChange('twoFactorMethod', method)
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
          <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm flex items-start gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary-600 text-white grid place-items-center text-xl font-semibold overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'grid'
                  }} />
                ) : null}
                <div className={`h-full w-full grid place-items-center ${profileImageUrl ? 'hidden' : ''}`}>
                  {getInitials(user)}
                </div>
              </div>
              <button 
                onClick={() => fileRef.current?.click()} 
                disabled={uploadingProfileImage}
                className="absolute -bottom-2 -right-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs bg-white dark:bg-[#1E293B] border border-secondary-300 dark:border-secondary-700 shadow hover:bg-secondary-50 dark:hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed">
                <Camera className="h-3.5 w-3.5" /> {uploadingProfileImage ? 'Uploading...' : 'Change'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onProfileImagePick} />
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold">{user?.firstName || ''} {user?.lastName || ''}</div>
              <div className="text-sm text-secondary-600">{user?.email || ''}</div>
              <div className="mt-1 inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700">
                {getRoleDisplayName(user?.role)}
              </div>
            </div>
          </div>

          {/* Personal details */}
          <form onSubmit={onSave} className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm space-y-5">
            <div className="text-sm font-medium">Personal Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput label="First Name" name="firstName" value={profile.firstName} onChange={onChange} required />
              <FloatingInput label="Last Name" name="lastName" value={profile.lastName} onChange={onChange} required />
              <FloatingInput label="Email" type="email" name="email" value={profile.email} onChange={onChange} required />
              <FloatingInput label="Phone Number" name="phoneNumber" value={profile.phoneNumber} onChange={onChange} />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn btn-primary btn-md" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              <button type="button" onClick={onReset} className="btn btn-outline btn-md">Reset</button>
            </div>
          </form>

          {/* Security & Password */}
          <form onSubmit={onChangePassword} className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Security & Password</div>
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
              <ToggleRow 
                label="Two-Factor Authentication (2FA)" 
                hint="Adds an extra security step on login" 
                checked={prefs.twoFactorEnabled}
                onChange={handle2FAChange}
              />
              <div className="space-y-2">
                <div className="text-xs text-secondary-600">2FA Method</div>
                <div className="flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="twofa" 
                      value="email"
                      checked={prefs.twoFactorMethod === 'email'}
                      onChange={() => handle2FAMethodChange('email')}
                    /> 
                    <Mail className="h-4 w-4" /> Email OTP
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="twofa" 
                      value="app"
                      checked={prefs.twoFactorMethod === 'app'}
                      onChange={() => handle2FAMethodChange('app')}
                    /> 
                    <Smartphone className="h-4 w-4" /> Authenticator App
                  </label>
                </div>
              </div>
            </div>
          </form>

          {/* Preferences & Theme */}
          <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm space-y-5">
            <div className="text-sm font-medium">Account Preferences</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CheckboxRow 
                label="Receive Email Notifications" 
                checked={prefs.emailNotifications} 
                onChange={(v)=>handlePreferenceChange('emailNotifications', v)} 
              />
              <CheckboxRow 
                label="Enable Auto Backups" 
                checked={prefs.autoBackups} 
                onChange={(v)=>handlePreferenceChange('autoBackups', v)} 
              />
              <CheckboxRow 
                label="Show Dashboard Tips" 
                checked={prefs.showTips} 
                onChange={(v)=>handlePreferenceChange('showTips', v)} 
              />
            </div>

            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Theme Settings</div>
              <div className="inline-flex items-center gap-3 p-2 rounded-lg border border-secondary-200 dark:border-secondary-700">
                <button 
                  onClick={()=>applyTheme('light')} 
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${themePreview==='light' ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-[#1E293B] hover:bg-secondary-200 dark:hover:bg-secondary-700'}`}
                >
                  Light
                </button>
                <button 
                  onClick={()=>applyTheme('dark')} 
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${themePreview==='dark' ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-[#1E293B] hover:bg-secondary-200 dark:hover:bg-secondary-700'}`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
            <div className="text-sm font-medium">Activity Overview</div>
            {loadingSessions ? (
              <div className="mt-3 text-sm text-secondary-600">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="mt-3 text-sm text-secondary-600">No active sessions</div>
            ) : (
            <div className="mt-3 space-y-3 text-sm">
                {sessions.map((s) => {
                  const deviceName = `${s.browser} on ${s.os}`
                  const isCurrent = s.isCurrent
                  const lastActive = formatTimeAgo(s.lastActive)
                  
                  return (
                    <div 
                      key={s.id} 
                      className="flex items-center justify-between p-3 rounded-md border border-secondary-200 dark:border-secondary-700 transition-all hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
                    >
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {deviceName}
                          {isCurrent && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-secondary-600 mt-1">
                          Last active: {lastActive}
                        </div>
                        {s.ipAddress && (
                          <div className="text-xs text-secondary-500 mt-0.5">
                            IP: {s.ipAddress}
                          </div>
                        )}
                  </div>
                      {!isCurrent && (
                        <button 
                          onClick={() => handleLogoutSession(s.sessionToken)}
                          className="text-xs text-danger-600 hover:underline ml-2"
                        >
                          Log out
                        </button>
                      )}
                </div>
                  )
                })}
            </div>
            )}
            <button 
              onClick={handleLogoutAll}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 btn btn-outline"
              disabled={loadingSessions || sessions.length === 0}
            >
              <LogOut className="h-4 w-4" /> Log Out from All Devices
            </button>
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

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md border border-secondary-200 dark:border-secondary-700">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint ? <div className="text-xs text-secondary-600">{hint}</div> : null}
      </div>
      <button 
        type="button" 
        onClick={() => onChange(!checked)} 
        className={`w-10 h-6 rounded-full p-0.5 transition-colors ${checked ? 'bg-primary-600' : 'bg-secondary-300'}`}
      >
        <span className={`h-5 w-5 bg-white rounded-full block transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e)=>onChange(e.target.checked)} />
      {label}
    </label>
  )
}

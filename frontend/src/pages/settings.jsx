import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { fetchSettings, updateSettings } from '../services/apiService'
import { useToast } from '../components/ui/Toast.jsx'
import Button from '../components/ui/Button.jsx'
import { 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Mail, 
  Globe, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Loader2,
  Settings as SettingsIcon,
  CreditCard,
  Palette,
  Webhook,
  ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const { token, user } = useAuthContext()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [form, setForm] = useState({
    theme: 'system',
    notifications: {
      product: true,
      payments: true,
      reports: false,
      invoices: true,
      customers: false,
      system: true
    },
    email: {
      invoiceReminders: true,
      paymentConfirmations: true,
      weeklyReports: false
    },
    general: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR'
    }
  })

  useEffect(() => {
    let mounted = true
    async function loadSettings() {
      setLoading(true)
      try {
        const settings = await fetchSettings(token)
        if (mounted) {
          setForm(settings)
          // Apply theme immediately
          applyTheme(settings.theme)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        toast.add('Failed to load settings', 'error')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadSettings()
    return () => { mounted = false }
  }, [token, toast])

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (form.theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyTheme('system')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [form.theme])

  // Apply theme to document
  function applyTheme(theme) {
    const root = document.documentElement
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    let actualTheme = theme
    if (theme === 'system') {
      actualTheme = systemPrefersDark ? 'dark' : 'light'
    }
    
    if (actualTheme === 'dark') {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    
    // Dispatch custom event to sync with other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme, actualTheme } }))
  }

  // Handle theme change
  function handleThemeChange(theme) {
    setForm(prev => ({ ...prev, theme }))
    setHasChanges(true)
    applyTheme(theme)
  }

  // Handle notification toggle
  function handleNotificationToggle(key, value) {
    setForm(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
    setHasChanges(true)
  }

  // Handle email preference toggle
  function handleEmailToggle(key, value) {
    setForm(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }))
    setHasChanges(true)
  }

  // Handle general settings change
  function handleGeneralChange(key, value) {
    setForm(prev => ({
      ...prev,
      general: { ...prev.general, [key]: value }
    }))
    setHasChanges(true)
  }

  // Save settings
  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateSettings(token, form)
      setForm(updated)
      setHasChanges(false)
      toast.add('Settings saved successfully', 'success')
      // Apply theme after save
      applyTheme(updated.theme)
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.add('Failed to save settings. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Quick action handlers
  function handleQuickAction(action) {
    switch (action) {
      case 'subscription':
        navigate('/subscription')
        break
      case 'branding':
        toast.add('Company branding feature coming soon', 'info')
        break
      case 'webhooks':
        toast.add('Webhook configuration coming soon', 'info')
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-secondary-600 mt-1">Personalize your experience and manage your preferences</p>
        </div>
      </div>

        <form onSubmit={onSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appearance Section */}
              <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Choose how the application looks</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: Sun, desc: 'Use light mode' },
                    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Use dark mode' },
                    { value: 'system', label: 'System', icon: Monitor, desc: 'Use system mode' }
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <label
                      key={value}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                        form.theme === value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={value}
                        className="sr-only"
                        checked={form.theme === value}
                        onChange={() => handleThemeChange(value)}
                      />
                      <div className="flex flex-col items-center text-center">
                        <Icon className={`w-8 h-8 mb-2 ${form.theme === value ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className={`font-semibold mb-1 ${form.theme === value ? 'text-blue-900' : 'text-gray-900'}`}>
                          {label}
                        </div>
                        <div className="text-xs text-gray-600">{desc}</div>
                      </div>
                      {form.theme === value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notifications Section */}
              <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Manage what notifications you receive</p>
                <div className="space-y-4">
                  {[
                    { key: 'product', label: 'Product updates', desc: 'Get notified about new features and updates' },
                    { key: 'payments', label: 'Payment events', desc: 'Notifications for payments and transactions' },
                    { key: 'invoices', label: 'Invoice alerts', desc: 'Alerts when invoices are created or updated' },
                    { key: 'reports', label: 'Report readiness', desc: 'Get notified when reports are ready' },
                    { key: 'customers', label: 'Customer updates', desc: 'Notifications about customer activities' },
                    { key: 'system', label: 'System notifications', desc: 'Important system alerts and maintenance' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{label}</div>
                        <div className="text-sm text-gray-600">{desc}</div>
                      </div>
                      <ToggleSwitch
                        checked={form.notifications[key]}
                        onChange={(checked) => handleNotificationToggle(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Preferences Section */}
              <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Email Preferences</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Control which emails you receive</p>
                <div className="space-y-4">
                  {[
                    { key: 'invoiceReminders', label: 'Invoice reminders', desc: 'Receive email reminders for overdue invoices' },
                    { key: 'paymentConfirmations', label: 'Payment confirmations', desc: 'Get confirmation emails when payments are received' },
                    { key: 'weeklyReports', label: 'Weekly reports', desc: 'Receive weekly summary reports via email' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{label}</div>
                        <div className="text-sm text-gray-600">{desc}</div>
                      </div>
                      <ToggleSwitch
                        checked={form.email[key]}
                        onChange={(checked) => handleEmailToggle(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* General Settings Section */}
              <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">Configure your application preferences</p>
                <div className="space-y-5">
                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={form.general.language}
                      onChange={(e) => handleGeneralChange('language', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={form.general.timezone}
                      onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>

                  {/* Date Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                        { value: 'DD MMM YYYY', label: 'DD MMM YYYY' }
                      ].map(({ value, label }) => (
                        <label
                          key={value}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            form.general.dateFormat === value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="dateFormat"
                            value={value}
                            checked={form.general.dateFormat === value}
                            onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                            className="sr-only"
                          />
                          <Calendar className={`w-4 h-4 ${form.general.dateFormat === value ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${form.general.dateFormat === value ? 'text-blue-900' : 'text-gray-700'}`}>
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={form.general.currency}
                      onChange={(e) => handleGeneralChange('currency', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="INR">₹ Indian Rupee (INR)</option>
                      <option value="USD">$ US Dollar (USD)</option>
                      <option value="EUR">€ Euro (EUR)</option>
                      <option value="GBP">£ British Pound (GBP)</option>
                      <option value="AED">د.إ UAE Dirham (AED)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Quick Actions & Save */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAction('subscription')}
                    className="btn btn-outline w-full justify-start gap-3 px-4 py-3"
                  >
                    <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">Manage Subscription</div>
                      <div className="text-xs text-gray-600">View and update your plan</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAction('branding')}
                    className="btn btn-outline w-full justify-start gap-3 px-4 py-3"
                  >
                    <Palette className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">Company Branding</div>
                      <div className="text-xs text-gray-600">Customize your branding</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAction('webhooks')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
                  >
                    <Webhook className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Configure Webhooks</div>
                      <div className="text-xs text-gray-600">Set up integrations</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Changes</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {hasChanges ? 'You have unsaved changes' : 'All changes are saved'}
                </p>
                <Button
                  type="submit"
                  disabled={saving || !hasChanges}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={saving}
                  icon={saving ? undefined : CheckCircle2}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>
        </form>
    </DashboardLayout>
  )
}

// Toggle Switch Component
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

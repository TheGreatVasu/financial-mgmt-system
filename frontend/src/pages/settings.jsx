import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { fetchSettings, updateSettings } from '../services/settingsService'
import { useToast } from '../components/ui/Toast.jsx'

export default function SettingsPage() {
  const { token } = useAuthContext()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ theme: 'system', notifications: { product: true, payments: true, reports: false } })

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      const s = await fetchSettings(token)
      if (mounted) setForm(s)
      setLoading(false)
    }
    run()
    return () => { mounted = false }
  }, [token])

  function setNotif(key, value) {
    setForm((f) => ({ ...f, notifications: { ...f.notifications, [key]: value } }))
  }

  async function onSave(e) {
    e.preventDefault()
    setSaving(true)
    const updated = await updateSettings(token, form)
    setForm(updated)
    setSaving(false)
    toast.add('Settings saved', 'success')
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-secondary-600 mt-1">Personalize your experience</p>
      </div>
      {loading ? (
        <div className="mt-6 text-sm text-secondary-600">Loading…</div>
      ) : (
        <form onSubmit={onSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-secondary-700 mb-4">Appearance</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['light','dark','system'].map((t) => (
                  <label key={t} className={`rounded-lg border p-4 text-sm cursor-pointer ${form.theme===t? 'border-primary-300 bg-primary-50':'border-secondary-200/70 bg-white'}`}>
                    <input type="radio" name="theme" value={t} className="hidden" checked={form.theme===t} onChange={()=>setForm((f)=>({...f, theme: t}))} />
                    <div className="font-medium capitalize">{t}</div>
                    <div className="text-xs text-secondary-600">Use {t} mode</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-secondary-700 mb-4">Notifications</div>
              <div className="space-y-3 text-sm">
                <Toggle label="Product updates" checked={form.notifications.product} onChange={(v)=>setNotif('product', v)} />
                <Toggle label="Payment events" checked={form.notifications.payments} onChange={(v)=>setNotif('payments', v)} />
                <Toggle label="Report readiness" checked={form.notifications.reports} onChange={(v)=>setNotif('reports', v)} />
              </div>
            </div>
          </div>
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-secondary-700 mb-2">Shortcuts</div>
              <ul className="text-sm text-secondary-700 space-y-2">
                <li>Manage subscription</li>
                <li>Set company branding</li>
                <li>Configure webhooks</li>
              </ul>
            </div>
            <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-secondary-700 mb-2">Save</div>
              <button type="submit" className="btn btn-primary w-full" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
            </div>
          </aside>
        </form>
      )}
    </DashboardLayout>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between">
      <span>{label}</span>
      <button type="button" onClick={()=>onChange(!checked)} className={`h-6 w-11 rounded-full relative transition-colors ${checked ? 'bg-primary-600' : 'bg-secondary-300'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  )
}



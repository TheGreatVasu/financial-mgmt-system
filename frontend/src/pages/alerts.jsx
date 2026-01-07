import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { listAlerts, markRead, snoozeAlerts, dismissAlerts } from '../services/apiService'
import { useToast } from '../components/ui/Toast.jsx'

const typeToColors = {
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  info: 'bg-primary-50 text-primary-700 border-primary-200',
}

export default function AlertsPage() {
  const { token } = useAuthContext()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [selected, setSelected] = useState({})
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      const res = await listAlerts(token)
      if (mounted) setAlerts(res)
      setLoading(false)
    }
    run()
    return () => { mounted = false }
  }, [token])

  const filtered = useMemo(() => {
    return alerts.filter(a => (filter === 'all') || (filter === 'unread' ? !a.read : a.type === filter))
  }, [alerts, filter])

  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected])

  function toggle(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  async function doMarkRead() {
    if (selectedIds.length === 0) return
    setBusy(true)
    await markRead(token, selectedIds)
    setAlerts((arr) => arr.map(a => selectedIds.includes(a.id) ? { ...a, read: true } : a))
    setSelected({})
    setBusy(false)
    toast.add('Marked as read', 'success')
  }

  async function doDismiss() {
    if (selectedIds.length === 0) return
    setBusy(true)
    await dismissAlerts(token, selectedIds)
    setAlerts((arr) => arr.filter(a => !selectedIds.includes(a.id)))
    setSelected({})
    setBusy(false)
    toast.add('Dismissed', 'success')
  }

  async function doSnooze() {
    if (selectedIds.length === 0) return
    setBusy(true)
    await snoozeAlerts(token, selectedIds, 60)
    setSelected({})
    setBusy(false)
    toast.add('Snoozed for 60 minutes', 'success')
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-secondary-600 mt-1">Monitor issues, payments, and system notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input" value={filter} onChange={(e)=>setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="danger">Critical</option>
            <option value="warning">Warnings</option>
            <option value="info">Information</option>
            <option value="success">Success</option>
          </select>
          <button className="btn btn-outline btn-md" onClick={doSnooze} disabled={busy || selectedIds.length===0}>Snooze 1h</button>
          <button className="btn btn-secondary btn-md" onClick={doMarkRead} disabled={busy || selectedIds.length===0}>Mark read</button>
          <button className="btn btn-primary btn-md" onClick={doDismiss} disabled={busy || selectedIds.length===0}>Dismiss</button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-secondary-600">Loading alerts…</div>
      ) : (
        <div className="rounded-xl border border-secondary-200/70 bg-white p-2 shadow-sm divide-y">
          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-secondary-600">No alerts</div>
          ) : (
            filtered.map((a) => (
              <div key={a.id} className={`p-4 flex items-start gap-4 ${a.read ? 'opacity-80' : ''}`}>
                <input type="checkbox" className="mt-1" checked={Boolean(selected[a.id])} onChange={()=>toggle(a.id)} />
                <div className={`px-2 py-1 rounded border text-[11px] ${typeToColors[a.type] || typeToColors.info}`}>{a.type}</div>
                <div className="flex-1">
                  <div className="font-medium">{a.title}</div>
                  {a.detail ? <div className="text-sm text-secondary-600">{a.detail}</div> : null}
                </div>
                <div className="text-xs text-secondary-500 whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  )
}



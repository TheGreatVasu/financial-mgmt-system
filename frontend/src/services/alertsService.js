import { createApiClient } from './apiClient'

const MOCK_ALERTS = [
  { id: 'a1', type: 'danger', title: '2 invoices overdue 30+ days', detail: 'INV20250012, INV20250018', createdAt: new Date().toISOString(), read: false },
  { id: 'a2', type: 'warning', title: 'Payment promise broken', detail: 'Globex missed promise date', createdAt: new Date().toISOString(), read: false },
  { id: 'a3', type: 'success', title: 'Payment received: ₹45,000', detail: 'From Initech', createdAt: new Date().toISOString(), read: true },
  { id: 'a4', type: 'info', title: 'New report is ready', detail: 'Aging report generated', createdAt: new Date().toISOString(), read: false },
]

export async function listAlerts(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get('/notifications')
    if (!data?.success) throw new Error(data?.message || 'Failed to load alerts')
    return data.data
  } catch {
    return MOCK_ALERTS
  }
}

export async function markRead(token, ids) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/notifications/mark-read', { ids })
    if (!data?.success) throw new Error(data?.message || 'Failed to mark read')
    return true
  } catch {
    return true
  }
}

export async function dismissAlerts(token, ids) {
  // Placeholder: Would call API in real setup
  return true
}

export async function snoozeAlerts(token, ids, minutes = 60) {
  // Placeholder: Would call API in real setup
  return { until: new Date(Date.now() + minutes * 60 * 1000).toISOString() }
}



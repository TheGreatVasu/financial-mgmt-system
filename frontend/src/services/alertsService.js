import { createApiClient } from './apiClient'

export async function listAlerts(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get('/notifications')
    if (!data?.success) throw new Error(data?.message || 'Failed to load alerts')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to load alerts'
    throw new Error(errorMessage)
  }
}

export async function markRead(token, ids) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/notifications/mark-read', { ids })
    if (!data?.success) throw new Error(data?.message || 'Failed to mark read')
    return true
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to mark read'
    throw new Error(errorMessage)
  }
}

export async function dismissAlerts(token, ids) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/notifications/dismiss', { ids })
    if (!data?.success) throw new Error(data?.message || 'Failed to dismiss alerts')
    return true
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to dismiss alerts'
    throw new Error(errorMessage)
  }
}

export async function snoozeAlerts(token, ids, minutes = 60) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/notifications/snooze', { ids, minutes })
    if (!data?.success) throw new Error(data?.message || 'Failed to snooze alerts')
    return data.data || { until: new Date(Date.now() + minutes * 60 * 1000).toISOString() }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to snooze alerts'
    throw new Error(errorMessage)
  }
}



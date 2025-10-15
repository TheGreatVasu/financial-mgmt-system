import { createApiClient } from './apiClient'

const MOCK_SETTINGS = {
  theme: 'system',
  notifications: {
    product: true,
    payments: true,
    reports: false,
  },
}

export async function fetchSettings(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get('/settings')
    if (!data?.success) throw new Error('Failed')
    return data.data
  } catch {
    return MOCK_SETTINGS
  }
}

export async function updateSettings(token, payload) {
  const api = createApiClient(token)
  try {
    const { data } = await api.put('/settings', payload)
    if (!data?.success) throw new Error('Failed')
    return data.data
  } catch {
    return { ...MOCK_SETTINGS, ...payload, notifications: { ...MOCK_SETTINGS.notifications, ...(payload.notifications||{}) } }
  }
}



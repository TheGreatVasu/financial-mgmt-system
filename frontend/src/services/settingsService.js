import { createApiClient } from './apiClient'

const DEFAULT_SETTINGS = {
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
}

export async function fetchSettings(token) {
  if (!token) {
    return DEFAULT_SETTINGS
  }

  const api = createApiClient(token)
  try {
    const { data } = await api.get('/settings')
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch settings')
    return data.data || DEFAULT_SETTINGS
  } catch (err) {
    // If settings endpoint doesn't exist yet, return defaults
    if (err.response?.status === 404) {
      return DEFAULT_SETTINGS
    }
    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch settings'
    throw new Error(errorMessage)
  }
}

export async function updateSettings(token, payload) {
  if (!token) {
    throw new Error('Authentication required')
  }

  const api = createApiClient(token)
  try {
    const { data } = await api.put('/settings', payload)
    if (!data?.success) throw new Error(data?.message || 'Failed to update settings')
    return data.data || payload
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to update settings'
    throw new Error(errorMessage)
  }
}



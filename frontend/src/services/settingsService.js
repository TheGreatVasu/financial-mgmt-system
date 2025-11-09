import { createApiClient } from './apiClient'

const MOCK_SETTINGS = {
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
    // Return default settings if no token
    return MOCK_SETTINGS
  }

  const api = createApiClient(token)
  try {
    const { data } = await api.get('/settings')
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch settings')
    return data.data || MOCK_SETTINGS
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Return mock settings as fallback
    return MOCK_SETTINGS
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
  } catch (error) {
    console.error('Error updating settings:', error)
    // Merge with existing settings as fallback
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update settings'
    throw new Error(errorMessage)
  }
}



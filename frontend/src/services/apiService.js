/**
 * Consolidated API Service
 * Combines all small API services into one file for easier maintenance
 */

import { createApiClient } from './apiClient'

// ============================================================================
// ALERTS / NOTIFICATIONS
// ============================================================================

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

// ============================================================================
// CONTACT
// ============================================================================

export function createContactService(token) {
  const api = createApiClient(token)
  return {
    submit: (payload) => api.post('/contact', payload).then(r => r.data),
  }
}

// ============================================================================
// MOM (MINUTES OF MEETING)
// ============================================================================

export function createMOMService(token) {
  const api = createApiClient(token)
  return {
    list: (params = {}) => api.get('/mom', { params }).then(r => r.data),
    get: (id) => api.get(`/mom/${id}`).then(r => r.data),
    create: (payload) => api.post('/mom', payload).then(r => r.data),
    update: (id, payload) => api.put(`/mom/${id}`, payload).then(r => r.data),
    remove: (id) => api.delete(`/mom/${id}`).then(r => r.data),
  }
}

// ============================================================================
// SESSIONS
// ============================================================================

export async function getSessions(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get('/auth/sessions')
    if (!data?.success) throw new Error(data?.message || 'Failed to fetch sessions')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch sessions'
    throw new Error(errorMessage)
  }
}

export async function logoutSession(token, sessionToken) {
  const api = createApiClient(token)
  try {
    const { data } = await api.delete(`/auth/sessions/${sessionToken}`)
    if (!data?.success) throw new Error(data?.message || 'Failed to logout session')
    return true
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to logout session'
    throw new Error(errorMessage)
  }
}

export async function logoutAllSessions(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.delete('/auth/sessions')
    if (!data?.success) throw new Error(data?.message || 'Failed to logout all sessions')
    return true
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to logout all sessions'
    throw new Error(errorMessage)
  }
}

export async function updateSessionActivity(token) {
  const api = createApiClient(token)
  try {
    await api.post('/auth/sessions/activity')
  } catch (err) {
    // Silently fail - activity updates are not critical
    console.warn('Failed to update session activity:', err)
  }
}

export function formatTimeAgo(dateString) {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

// ============================================================================
// SUBSCRIPTION / BILLING
// ============================================================================

export async function fetchSubscription(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get('/billing/subscription')
    if (!data?.success) throw new Error(data?.message || 'Failed to load subscription')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to load subscription'
    throw new Error(errorMessage)
  }
}

export async function fetchUsageStats(token, recalculate = false) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get(`/billing/usage${recalculate ? '?recalculate=true' : ''}`)
    if (!data?.success) throw new Error(data?.message || 'Failed to load usage stats')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch usage stats'
    throw new Error(errorMessage)
  }
}

export async function changePlan(token, planId) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/billing/change-plan', { planId })
    if (!data?.success) throw new Error(data?.message || 'Failed to change plan')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to change plan'
    throw new Error(errorMessage)
  }
}

export async function cancelSubscription(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/billing/cancel')
    if (!data?.success) throw new Error(data?.message || 'Failed to cancel subscription')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel subscription'
    throw new Error(errorMessage)
  }
}

export async function resumeSubscription(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/billing/resume')
    if (!data?.success) throw new Error(data?.message || 'Failed to resume subscription')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to resume subscription'
    throw new Error(errorMessage)
  }
}

export async function updatePaymentMethod(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/billing/payment-method')
    if (!data?.success) throw new Error(data?.message || 'Failed to update payment method')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to update payment method'
    throw new Error(errorMessage)
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

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

// ============================================================================
// DATABASE (ADMIN)
// ============================================================================

export async function getDatabaseStatus(token) {
  const api = createApiClient(token)
  const response = await api.get('/admin/database/status')
  return response.data
}

export async function runMigrations(token) {
  const api = createApiClient(token)
  const response = await api.post('/admin/database/migrations/run', {})
  return response.data
}

export async function rollbackMigrations(token) {
  const api = createApiClient(token)
  const response = await api.post('/admin/database/migrations/rollback', {})
  return response.data
}

export async function runSeeds(token) {
  const api = createApiClient(token)
  const response = await api.post('/admin/database/seeds/run', {})
  return response.data
}

export async function getTableStructure(token, tableName) {
  const api = createApiClient(token)
  const response = await api.get(`/admin/database/tables/${tableName}/structure`)
  return response.data
}

// ============================================================================
// SEARCH
// ============================================================================

export function createSearchService(token) {
  const api = createApiClient(token)

  return {
    async search(field, q, options = {}) {
      const params = {
        field,
        q,
        limit: options.limit || 20,
      }
      const { data } = await api.get('/search/suggestions', { params })
      const payload = data?.data || {}
      return {
        field: payload.field || field,
        suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : [],
      }
    },
  }
}


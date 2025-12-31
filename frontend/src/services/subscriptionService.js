import { createApiClient } from './apiClient'

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

// Get quick usage stats (lightweight for frequent polling)
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



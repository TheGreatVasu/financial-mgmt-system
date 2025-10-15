import { createApiClient } from './apiClient'

const MOCK_SUBSCRIPTION = {
  currentPlan: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'mo',
    quotaGb: 5,
    features: [
      'Up to 5GB storage',
      'Basic dashboards',
      'Email support',
    ],
  },
  usage: {
    storageGb: 3.1,
    storageLimitGb: 5,
    invoicesThisMonth: 18,
    invoiceLimit: 50,
  },
  billing: {
    status: 'active',
    renewsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 27).toISOString(),
    paymentMethod: {
      brand: 'Visa',
      last4: '4242',
      expires: '12/27',
    },
  },
}

const CATALOG = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'mo',
    popular: false,
    features: ['5GB storage', 'Basic dashboards', 'Community support'],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    interval: 'mo',
    popular: true,
    features: ['25GB storage', 'Reports & exports', 'Priority email support'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1499,
    interval: 'mo',
    popular: false,
    features: ['200GB storage', 'Advanced analytics', 'SLA + phone support'],
  },
]

export async function fetchSubscription(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get('/billing/subscription')
    if (!data?.success) throw new Error(data?.message || 'Failed to load subscription')
    return data.data
  } catch {
    return { subscription: MOCK_SUBSCRIPTION, catalog: CATALOG }
  }
}

export async function changePlan(token, planId) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/billing/change-plan', { planId })
    if (!data?.success) throw new Error(data?.message || 'Failed to change plan')
    return data.data
  } catch {
    const next = CATALOG.find(p => p.id === planId) || CATALOG[0]
    return {
      subscription: {
        ...MOCK_SUBSCRIPTION,
        currentPlan: {
          id: next.id,
          name: next.name,
          price: next.price,
          interval: next.interval,
          quotaGb: next.id === 'free' ? 5 : next.id === 'basic' ? 25 : 200,
          features: next.features,
        },
      },
      catalog: CATALOG,
    }
  }
}

export async function cancelSubscription(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/billing/cancel')
    if (!data?.success) throw new Error(data?.message || 'Failed to cancel subscription')
    return data.data
  } catch {
    return {
      subscription: {
        ...MOCK_SUBSCRIPTION,
        billing: { ...MOCK_SUBSCRIPTION.billing, status: 'cancels_at_period_end' },
      },
      catalog: CATALOG,
    }
  }
}

export async function resumeSubscription(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/billing/resume')
    if (!data?.success) throw new Error(data?.message || 'Failed to resume subscription')
    return data.data
  } catch {
    return {
      subscription: {
        ...MOCK_SUBSCRIPTION,
        billing: { ...MOCK_SUBSCRIPTION.billing, status: 'active' },
      },
      catalog: CATALOG,
    }
  }
}

export async function updatePaymentMethod(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/billing/payment-method')
    if (!data?.success) throw new Error(data?.message || 'Failed to update payment method')
    return data.data
  } catch {
    return {
      subscription: {
        ...MOCK_SUBSCRIPTION,
      },
      catalog: CATALOG,
    }
  }
}



import { createApiClient } from './apiClient'

export function createCustomerService(token) {
  const api = createApiClient(token)
  return {
    list: (params = {}) => api.get('/customers', { params }).then(r => r.data),
    create: (payload) => api.post('/customers', payload).then(r => r.data),
  }
}


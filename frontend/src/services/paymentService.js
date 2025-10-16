import { createApiClient } from './apiClient'

export function createPaymentService(token) {
  const api = createApiClient(token)
  return {
    list: (params = {}) => api.get('/payments', { params }).then(r => r.data),
    create: (payload) => api.post('/payments', payload).then(r => r.data),
  }
}

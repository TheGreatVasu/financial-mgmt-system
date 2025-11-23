import { createApiClient } from './apiClient'

export function createPaymentService(token) {
  const api = createApiClient(token)
  return {
    list: (params = {}) => api.get('/payments', { params }).then(r => r.data),
    get: (id) => api.get(`/payments/${id}`).then(r => r.data),
    create: (payload) => api.post('/payments', payload).then(r => r.data),
    update: (id, payload) => api.put(`/payments/${id}`, payload).then(r => r.data),
    remove: (id) => api.delete(`/payments/${id}`).then(r => r.data),
  }
}

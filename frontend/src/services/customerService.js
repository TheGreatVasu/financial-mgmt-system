import { createApiClient } from './apiClient'

export function createCustomerService(token) {
  const api = createApiClient(token)
  return {
    list: (params = {}) => api.get('/customers', { params }).then(r => r.data),
    get: (id) => api.get(`/customers/${id}`).then(r => r.data),
    create: (payload) => api.post('/customers', payload).then(r => r.data),
    update: (id, payload) => api.put(`/customers/${id}`, payload).then(r => r.data),
    remove: (id) => api.delete(`/customers/${id}`).then(r => r.data),
  }
}


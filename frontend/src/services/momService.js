import { createApiClient } from './apiClient'

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



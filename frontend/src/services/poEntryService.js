import { createApiClient } from './apiClient'

export function createPOEntryService(token) {
  const api = createApiClient(token)

  return {
    list: (params = {}) => api.get('/po-entry', { params }).then((r) => r.data),
    get: (id) => api.get(`/po-entry/${id}`).then((r) => r.data),
    create: (payload) => api.post('/po-entry', payload).then((r) => r.data),
    update: (id, payload) => api.put(`/po-entry/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`/po-entry/${id}`).then((r) => r.data)
  }
}



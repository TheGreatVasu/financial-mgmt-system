import { createApiClient } from './apiClient'

export function createInvoiceService(token) {
  const api = createApiClient(token)
  return {
    list: (params = {}) => api.get('/invoices', { params }).then(r => r.data),
    get: (id) => api.get(`/invoices/${id}`).then(r => r.data),
    create: (payload) => api.post('/invoices', payload).then(r => r.data),
    update: (id, payload) => api.put(`/invoices/${id}`, payload).then(r => r.data),
    remove: (id) => api.delete(`/invoices/${id}`).then(r => r.data),
  }
}



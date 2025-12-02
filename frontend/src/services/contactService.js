import { createApiClient } from './apiClient'

export function createContactService(token) {
  const api = createApiClient(token)
  return {
    submit: (payload) => api.post('/contact', payload).then(r => r.data),
  }
}


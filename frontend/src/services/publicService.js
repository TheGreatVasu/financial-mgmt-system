import { createApiClient } from './apiClient'

const api = createApiClient()

export function submitContact(payload) {
  return api.post('/contact', payload).then((r) => r.data)
}



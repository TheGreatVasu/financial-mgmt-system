import { createApiClient } from './apiClient'

export async function downloadDashboardReport(token, payload = {}) {
  const api = createApiClient(token)
  const response = await api.post('/reports/pdf', payload, {
    responseType: 'blob',
  })
  return response.data
}



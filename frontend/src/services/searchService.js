import { createApiClient } from './apiClient'

// Factory that returns a small client for the universal search API.
// Usage:
//   const searchApi = createSearchService(token)
//   const { suggestions } = await searchApi.search('customerName', 'acme')
export function createSearchService(token) {
  const api = createApiClient(token)

  return {
    async search(field, q, options = {}) {
      const params = {
        field,
        q,
        limit: options.limit || 20,
      }
      const { data } = await api.get('/search/suggestions', { params })
      const payload = data?.data || {}
      return {
        field: payload.field || field,
        suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : [],
      }
    },
  }
}



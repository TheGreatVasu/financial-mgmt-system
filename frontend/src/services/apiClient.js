import axios from 'axios'

export function createApiClient(token) {
  const envBaseUrl = import.meta?.env?.VITE_API_BASE_URL
  const baseURL = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl : '/api'

  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  })

  instance.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  })

  return instance
}



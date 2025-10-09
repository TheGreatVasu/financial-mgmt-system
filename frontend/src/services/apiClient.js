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
    return config
  })

  return instance
}



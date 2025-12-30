import axios from 'axios'

export function createApiClient(token) {
  // Use the Vite env directly. Do NOT fallback to '/api' or auto-append paths.

  const baseURL = typeof import.meta?.env?.VITE_API_BASE_URL === 'string' ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '') : undefined;
  if (!baseURL) {
    throw new Error('VITE_API_BASE_URL must be set (non-empty string) for API requests.');
  }
  if (import.meta.env.DEV) {
    console.log('🔧 API Client baseURL:', baseURL);
  }

  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  })

  instance.interceptors.request.use((config) => {
    // CRITICAL: Ensure method is always explicitly set
    if (!config.method) {
      config.method = 'POST' // Default to POST if not set
    }
    
    // Log request for debugging (only in development or for specific routes)
    if (config.url?.includes('google-login')) {
      console.log('🌐 API Request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        fullURL: config.baseURL ? `${config.baseURL.replace(/\/$/, '')}${config.url}` : config.url,
        hasData: !!config.data,
        dataType: typeof config.data
      })
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    // CRITICAL: Ensure POST requests have proper headers
    if (config.method.toUpperCase() === 'POST' && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  })

  return instance
}



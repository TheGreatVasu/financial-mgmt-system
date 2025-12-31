import axios from 'axios'

/**
 * Gets the API base URL from environment variables.
 * Validates lazily and logs warnings instead of throwing at module scope.
 * @returns {string|undefined} The API base URL or undefined if not set
 */
function getApiBaseUrl() {
  const baseURL = typeof import.meta?.env?.VITE_API_BASE_URL === 'string' 
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '') 
    : undefined;
  
  if (!baseURL && import.meta.env.DEV) {
    console.warn('⚠️  VITE_API_BASE_URL is not set. Using Vite proxy for development.');
  }
  if (!baseURL) {
    return undefined;
  }
  
  return baseURL;
}

/**
 * Creates an Axios instance configured for API requests.
 * Validates environment variables lazily - only throws when actually called.
 * @param {string|null} token - Optional JWT token for authentication
 * @returns {import('axios').AxiosInstance} Configured Axios instance
 * @throws {Error} If VITE_API_BASE_URL is not set (only when function is called)
 */
export function createApiClient(token) {
  // Lazy validation - only throws when function is actually called
  const baseURL = getApiBaseUrl();
  if (!baseURL) {
    throw new Error('VITE_API_BASE_URL must be set (non-empty string) for API requests. Check your environment variables and rebuild the application.');
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



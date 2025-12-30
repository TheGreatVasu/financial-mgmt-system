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
  
  if (!baseURL) {
    console.error('❌ VITE_API_BASE_URL is not set. API requests will fail.');
    console.error('   Set VITE_API_BASE_URL in your .env file before building.');
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

  // Only log in development, never in production
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
    
    // Log request for debugging (only in development)
    if (import.meta.env.DEV && config.url?.includes('google-login')) {
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



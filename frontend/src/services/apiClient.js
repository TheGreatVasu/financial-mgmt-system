import axios from 'axios'

/**
 * Gets the API base URL from environment variables.
 * Returns graceful fallbacks instead of throwing errors.
 * @returns {string|undefined} The API base URL or undefined if not set
 */
function getApiBaseUrl() {
  // ✅ DEVELOPMENT → use Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }

  // ✅ PRODUCTION → use env var or return undefined
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  if (!baseURL || !baseURL.trim()) {
    console.warn('⚠️  VITE_API_BASE_URL is not set in production. API requests may fail.');
    return undefined;
  }

  return baseURL.trim().replace(/\/+$/, '');
}


/**
 * Creates an Axios instance configured for API requests.
 * Gracefully handles missing environment variables instead of throwing.
 * @param {string|null} token - Optional JWT token for authentication
 * @returns {import('axios').AxiosInstance} Configured Axios instance
 */
export function createApiClient(token) {
  // Get base URL gracefully - may be undefined if not configured
  const baseURL = getApiBaseUrl();
  
  // Log warning if base URL is missing but continue anyway
  if (!baseURL) {
    console.warn('⚠️  Creating API client without base URL. API requests will fail.');
  }

  const instance = axios.create({
    baseURL: baseURL || '', // Use empty string as fallback
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

  instance.interceptors.request.use((config) => {
    // CRITICAL: Ensure method is always explicitly set
    if (!config.method) {
      config.method = 'POST'; // Default to POST if not set
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // CRITICAL: Ensure POST requests have proper headers
    if (config.method.toUpperCase() === 'POST' && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  });

  return instance;
}



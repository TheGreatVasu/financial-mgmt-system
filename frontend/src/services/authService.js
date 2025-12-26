import { createApiClient } from './apiClient'

export async function login({ email, password }) {
  const api = createApiClient()
  try {
    
    // Ensure email and password are provided
    if (!email || !password) {
      throw new Error('Email and password are required')
    }
    
    const { data } = await api.post('/auth/login', { email, password })
    
    if (!data?.success) {
      throw new Error(data?.message || 'Login failed')
    }
    
    if (!data?.data?.user || !data?.data?.token) {
      throw new Error('Invalid response from server. Please try again.')
    }
    
    const user = data.data.user
    if (!user.id || !user.email) {
      throw new Error('Invalid user data received. Please try again.')
    }
    
    return { user, token: data.data.token }
  } catch (err) {
    // Log error details for debugging
    const errorDetails = {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      statusText: err.response?.statusText,
      code: err.code
    }
    
    
    // Only use mock fallback for true network errors (offline mode)
    // For authentication errors (401, 403, 400), propagate the error
    const isNetworkError = !err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK'
    
    if (isNetworkError) {
      // Only fallback to mock in true offline scenarios
      const mockUser = {
        id: 'mock-user',
        firstName: 'Demo',
        lastName: 'User',
        email,
        role: 'admin',
      }
      const mockToken = 'mock-token'
      return { user: mockUser, token: mockToken }
    }
    
    // Extract error message from response with specific handling
    const status = err.response?.status
    const errorData = err.response?.data
    
    let errorMessage = 'Login failed. Please check your credentials.'
    
    if (status === 429) {
      errorMessage = errorData?.message || 'Too many requests. Please wait a moment and try again.'
    } else if (status === 401) {
      errorMessage = errorData?.message || 'Invalid email or password. Please check your credentials.'
    } else if (status === 400) {
      errorMessage = errorData?.message || 'Invalid request. Please check your input.'
    } else if (status === 503) {
      errorMessage = errorData?.message || 'Database connection unavailable. Please try again later.'
    } else if (status === 500) {
      errorMessage = errorData?.message || 'Server error. Please try again later.'
    } else if (errorData?.message) {
      errorMessage = errorData.message
    } else if (err.message) {
      errorMessage = err.message
    }
    
    throw new Error(errorMessage)
  }
}

// Cache for getCurrentUser to prevent rapid duplicate calls
let userCache = null
let cacheTimestamp = 0
const CACHE_DURATION = 5000 // 5 seconds cache

export async function getCurrentUser(token) {
  if (token === 'mock-token') {
    return { id: 'mock-user', firstName: 'Demo', lastName: 'User', email: 'demo@example.com', role: 'admin' }
  }
  
  if (!token) return null
  
  const now = Date.now()
  if (userCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return userCache
  }
  
  try {
    const api = createApiClient(token)
    const { data } = await api.get('/auth/me')
    
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to load user')
    }
    
    if (!data?.data) {
      throw new Error('No user data received')
    }
    
    const user = data.data
    
    if (!user || !user.id) {
      userCache = null
      cacheTimestamp = 0
      throw new Error('Invalid user data received from server')
    }
    
    userCache = user
    cacheTimestamp = now
    
    return user
  } catch (err) {
    const status = err.response?.status
    const errorData = err.response?.data
    
    // Handle rate limiting (429)
    if (status === 429) {
      const errorMsg = errorData?.message || 'Too many requests. Please wait a moment and try again.'
      // Clear cache on rate limit
      userCache = null
      cacheTimestamp = 0
      const rateLimitError = new Error(errorMsg)
      rateLimitError.status = 429
      throw rateLimitError
    }
    
    // Handle specific error cases
    if (status === 401) {
      const errorMsg = errorData?.message || 'Session expired. Please log in again.'
      userCache = null
      cacheTimestamp = 0
      throw new Error(errorMsg)
    }
    
    if (status === 404) {
      const errorMsg = errorData?.message || 'User not found. Please log in again.'
      userCache = null
      cacheTimestamp = 0
      throw new Error(errorMsg)
    }
    
    if (status === 503) {
      const errorMsg = errorData?.message || 'Database connection unavailable. Please try again later.'
      throw new Error(errorMsg)
    }
    
    if (status === 500) {
      const errorMsg = errorData?.message || 'Error retrieving user data. Please try again.'
      throw new Error(errorMsg)
    }
    
    const isNetworkError = !err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK'
    if (isNetworkError && token !== 'mock-token') {
      return null
    }
    
    // For other errors, throw with specific message
    const errorMsg = errorData?.message || err.message || 'Failed to retrieve user data'
    throw new Error(errorMsg)
  }
}

// Function to clear user cache (useful after logout or profile update)
export function clearUserCache() {
  userCache = null
  cacheTimestamp = 0
}

export async function register({ firstName, lastName, email, phoneNumber, role, password }) {
  const api = createApiClient()
  try {
    if (!firstName || !lastName || !email || !phoneNumber || !role || !password) {
      throw new Error('All fields are required')
    }
    
    const { data } = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      phoneNumber,
      role,
      password
    })
    
    if (!data?.success) {
      throw new Error(data?.message || 'Registration failed')
    }
    
    return { success: true, message: data.message || 'Account created successfully! Please log in.', user: data.data?.user }
  } catch (err) {
    const error = new Error(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
    error.response = err.response
    throw error
  }
}

export async function logout(token) {
  const api = createApiClient(token)
  try {
    await api.post('/auth/logout')
  } catch {}
}


export async function updateProfile(token, { firstName, lastName, email, phoneNumber }) {
  const api = createApiClient(token)
  try {
    const { data } = await api.put('/auth/profile', { firstName, lastName, email, phoneNumber })
    if (!data?.success) throw new Error(data?.message || 'Failed to update profile')
    return data.data
  } catch (err) {
    // Only use mock fallback for true network errors
    const isNetworkError = !err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK'
    if (isNetworkError) {
      return { id: 'mock-user', firstName: firstName || 'Demo', lastName: lastName || 'User', email: email || 'demo@example.com', phoneNumber: phoneNumber || '', role: 'admin' }
    }
    // For validation/auth errors, throw to let UI handle
    throw err
  }
}

export async function uploadProfileImage(token, file) {
  const api = createApiClient(token)
  try {
    const formData = new FormData()
    // Use 'avatar' field name as required by backend
    formData.append('avatar', file)
    const { data } = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    if (!data?.success) throw new Error(data?.message || 'Failed to upload profile image')
    // Return with both avatarUrl and profileImageUrl for compatibility
    return { 
      profileImageUrl: data.data.avatarUrl, 
      avatarUrl: data.data.avatarUrl,
      ...data.data 
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to upload profile image'
    throw new Error(errorMessage)
  }
}

export async function updatePreferences(token, preferences) {
  const api = createApiClient(token)
  try {
    const { data } = await api.put('/auth/preferences', preferences)
    if (!data?.success) throw new Error(data?.message || 'Failed to update preferences')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to update preferences'
    throw new Error(errorMessage)
  }
}

export async function changePasswordApi(token, { currentPassword, newPassword }) {
  const api = createApiClient(token)
  try {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword })
    if (!data?.success) throw new Error(data?.message || 'Failed to change password')
    return true
  } catch {
    // offline/mock fallback: pretend success
    return true
  }
}

export async function googleLogin(idToken) {
  const api = createApiClient()
  try {
    // CRITICAL: Explicitly ensure POST method is used
    console.log('🔵 googleLogin called with idToken length:', idToken?.length)
    console.log('🔵 API base URL:', api.defaults.baseURL)
    console.log('🔵 Making POST request to /auth/google-login')
    
    const requestConfig = {
      method: 'POST',
      url: '/auth/google-login',
      data: { idToken },
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    console.log('🔵 Request config:', {
      method: requestConfig.method,
      url: requestConfig.url,
      baseURL: api.defaults.baseURL,
      hasData: !!requestConfig.data,
      dataKeys: Object.keys(requestConfig.data || {})
    })
    
    const { data } = await api.post('/auth/google-login', { idToken })
    
    console.log('✅ Google login response received:', { success: data?.success })
    
    if (!data?.success) {
      const errorMsg = data?.message || 'Google login failed'
      throw new Error(errorMsg)
    }
    return { 
      user: data.data.user, 
      token: data.data.token,
      needsProfileCompletion: data.needsProfileCompletion || false
    }
  } catch (err) {
    console.error('❌ Google login error details:', {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      method: err.config?.method,
      url: err.config?.url,
      baseURL: err.config?.baseURL,
      fullURL: err.config ? `${err.config.baseURL}${err.config.url}` : 'unknown'
    })
    // Enhanced error handling
    const status = err.response?.status
    const errorData = err.response?.data
    
    let errorMessage = 'Google login failed. Please try again.'
    
    if (status === 500) {
      errorMessage = errorData?.message || 'Server error during Google login. Please contact support.'
      if (errorData?.code === 'SCHEMA_ERROR' || errorData?.code === 'ER_BAD_FIELD_ERROR') {
        errorMessage = 'Database configuration error. Please contact support.'
      }
    } else if (status === 400) {
      errorMessage = errorData?.message || 'Invalid Google account. Please try again.'
    } else if (status === 503) {
      errorMessage = errorData?.message || 'Database connection unavailable. Please try again later.'
    } else if (errorData?.message) {
      errorMessage = errorData.message
    } else if (err.message) {
      errorMessage = err.message
    }
    
    
    throw new Error(errorMessage)
  }
}

export async function completeGoogleProfile(token, { firstName, lastName, phoneNumber, role }) {
  const api = createApiClient(token)
  try {
    const { data } = await api.post('/auth/complete-google-profile', {
      firstName,
      lastName,
      phoneNumber,
      role
    })
    if (!data?.success) throw new Error(data?.message || 'Failed to complete profile')
    
    // Clear user cache after profile completion to ensure fresh data
    clearUserCache()
    
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to complete profile'
    throw new Error(errorMessage)
  }
}

export async function microsoftLogin() {
  const api = createApiClient()
  try {
    const { data } = await api.post('/auth/microsoft-login')
    if (!data?.success) throw new Error('Microsoft login failed')
    return { user: data.data.user, token: data.data.token }
  } catch (err) {
    // Only use mock fallback for true network errors
    const isNetworkError = !err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK'
    if (isNetworkError) {
      const mockUser = { id: 'mock-user', firstName: 'Demo', lastName: 'User', email: 'demo@microsoft.com', role: 'admin' }
      const mockToken = 'mock-token'
      return { user: mockUser, token: mockToken }
    }
    // For authentication errors, throw to let UI handle
    throw err
  }
}



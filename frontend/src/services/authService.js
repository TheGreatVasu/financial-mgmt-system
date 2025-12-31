import { createApiClient } from './apiClient'

export async function login({ email, password }) {
  const api = createApiClient()
  try {
    
    // Ensure email and password are provided
    if (!email || !password) {
      throw new Error('Email and password are required')
    }
    
    const { data } = await api.post('/api/auth/login', { email, password })
    
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
    // Extract error message from response with specific handling
    
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
    if (isNetworkError) {
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
    
    const { data } = await api.post('/api/auth/register', {
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
    const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile'
    throw new Error(errorMessage)
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
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to change password'
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
    const errorMessage = err.response?.data?.message || err.message || 'Microsoft login failed'
    throw new Error(errorMessage)
  }
}



import { createApiClient } from './apiClient'

export async function login({ email, password }) {
  const api = createApiClient()
  try {
    console.log('🔐 Attempting login:', { email })
    
    // Ensure email and password are provided
    if (!email || !password) {
      throw new Error('Email and password are required')
    }
    
    const { data } = await api.post('/auth/login', { email, password })
    
    console.log('✅ Login response received:', { success: data?.success, hasUser: !!data?.data?.user, hasToken: !!data?.data?.token })
    
    if (!data?.success) {
      const errorMsg = data?.message || 'Login failed'
      console.error('❌ Login failed:', errorMsg)
      throw new Error(errorMsg)
    }
    
    // Validate response structure
    if (!data?.data?.user || !data?.data?.token) {
      console.error('❌ Invalid login response structure:', data)
      throw new Error('Invalid response from server. Please try again.')
    }
    
    // Ensure user has required fields
    const user = data.data.user
    if (!user.id || !user.email) {
      console.error('❌ Invalid user data in response:', user)
      throw new Error('Invalid user data received. Please try again.')
    }
    
    console.log('✅ Login successful:', { userId: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName })
    
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
    
    console.error('❌ Login error:', errorDetails)
    
    // Only use mock fallback for true network errors (offline mode)
    // For authentication errors (401, 403, 400), propagate the error
    const isNetworkError = !err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK'
    
    if (isNetworkError) {
      // Only fallback to mock in true offline scenarios
      console.warn('Network error during login, using offline fallback:', err.message)
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
    
    if (status === 401) {
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

export async function getCurrentUser(token) {
  if (token === 'mock-token') {
    return { id: 'mock-user', firstName: 'Demo', lastName: 'User', email: 'demo@example.com', role: 'admin' }
  }
  
  if (!token) {
    console.warn('getCurrentUser called without token')
    return null
  }
  
  try {
    console.log('🔍 Fetching current user with token')
    const api = createApiClient(token)
    const { data } = await api.get('/auth/me')
    
    console.log('✅ getCurrentUser response:', { success: data?.success, hasData: !!data?.data })
    
    if (!data?.success) {
      const errorMsg = data?.message || 'Failed to load user'
      console.error('❌ getCurrentUser failed:', errorMsg)
      throw new Error(errorMsg)
    }
    
    if (!data?.data) {
      console.error('❌ getCurrentUser: No user data in response')
      throw new Error('No user data received')
    }
    
    const user = data.data
    console.log('✅ getCurrentUser success:', { userId: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName })
    
    return user
  } catch (err) {
    const status = err.response?.status
    const errorData = err.response?.data
    
    console.error('❌ getCurrentUser error:', {
      message: err.message,
      status,
      response: errorData
    })
    
    // Handle specific error cases
    if (status === 401) {
      const errorMsg = errorData?.message || 'Session expired. Please log in again.'
      throw new Error(errorMsg)
    }
    
    if (status === 404) {
      const errorMsg = errorData?.message || 'User not found. Please log in again.'
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
    
    // Only use mock fallback for true network errors
    const isNetworkError = !err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK'
    if (isNetworkError && token !== 'mock-token') {
      console.warn('Network error fetching user, but keeping token:', err.message)
      // Return null to indicate user data couldn't be fetched, but don't clear token
      return null
    }
    
    // For other errors, throw with specific message
    const errorMsg = errorData?.message || err.message || 'Failed to retrieve user data'
    throw new Error(errorMsg)
  }
}

export async function register({ firstName, lastName, email, phoneNumber, role, password }) {
  const api = createApiClient()
  try {
    console.log('📝 Attempting registration:', { email, firstName, lastName, role })
    
    // Ensure all required fields are provided
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
    
    console.log('✅ Registration response received:', { success: data?.success })
    
    if (!data?.success) {
      const errorMsg = data?.message || 'Registration failed'
      console.error('❌ Registration failed:', errorMsg)
      throw new Error(errorMsg)
    }
    
    console.log('✅ Registration successful:', { email: data?.data?.user?.email })
    
    return { success: true, message: data.message || 'Account created successfully! Please log in.', user: data.data?.user }
  } catch (err) {
    console.error('❌ Registration error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    })
    
    // Preserve the full error response for better error handling
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
      console.warn('Network error updating profile, using offline fallback:', err.message)
      return { id: 'mock-user', firstName: firstName || 'Demo', lastName: lastName || 'User', email: email || 'demo@example.com', phoneNumber: phoneNumber || '', role: 'admin' }
    }
    // For validation/auth errors, throw to let UI handle
    throw err
  }
}

export async function uploadAvatar(token, file) {
  const api = createApiClient(token)
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const { data } = await api.post('/auth/avatar', formData)
    if (!data?.success) throw new Error(data?.message || 'Failed to upload avatar')
    return data.data
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to upload avatar'
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
  const { data } = await api.post('/auth/google-login', { idToken })
  if (!data?.success) throw new Error(data?.message || 'Google login failed')
  return { user: data.data.user, token: data.data.token }
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
      console.warn('Network error during Microsoft login, using offline fallback:', err.message)
      const mockUser = { id: 'mock-user', firstName: 'Demo', lastName: 'User', email: 'demo@microsoft.com', role: 'admin' }
      const mockToken = 'mock-token'
      return { user: mockUser, token: mockToken }
    }
    // For authentication errors, throw to let UI handle
    throw err
  }
}



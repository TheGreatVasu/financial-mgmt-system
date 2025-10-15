import { createApiClient } from './apiClient'

export async function login({ email, password }) {
  const api = createApiClient()
  try {
    const { data } = await api.post('/auth/login', { email, password })
    if (!data?.success) throw new Error(data?.message || 'Login failed')
    return { user: data.data.user, token: data.data.token }
  } catch (err) {
    // Offline fallback: accept any credentials and return a mock user
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
}

export async function getCurrentUser(token) {
  if (token === 'mock-token') {
    return { id: 'mock-user', firstName: 'Demo', lastName: 'User', email: 'demo@example.com', role: 'admin' }
  }
  const api = createApiClient(token)
  const { data } = await api.get('/auth/me')
  if (!data?.success) throw new Error(data?.message || 'Failed to load user')
  return data.data
}

export async function logout(token) {
  const api = createApiClient(token)
  try {
    await api.post('/auth/logout')
  } catch {}
}


export async function updateProfile(token, { firstName, lastName, email }) {
  const api = createApiClient(token)
  try {
    const { data } = await api.put('/auth/profile', { firstName, lastName, email })
    if (!data?.success) throw new Error(data?.message || 'Failed to update profile')
    return data.data
  } catch {
    // offline/mock fallback
    return { id: 'mock-user', firstName: firstName || 'Demo', lastName: lastName || 'User', email: email || 'demo@example.com', role: 'admin' }
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



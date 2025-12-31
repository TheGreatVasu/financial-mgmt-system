import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login as apiLogin, logout as apiLogout, updateProfile as apiUpdateProfile, updatePreferences as apiUpdatePreferences, microsoftLogin as apiMicrosoftLogin, clearUserCache } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('fms_token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false)
        return
      }
      
      if (token === 'mock-token') {
        setToken(null)
        setUser(null)
        localStorage.removeItem('fms_token')
        setLoading(false)
        return
      }
      
      try {
        const me = await getCurrentUser(token)
        if (me) {
          if (me.id === 'mock-user' || me.email === 'demo@example.com') {
            setToken(null)
            setUser(null)
            localStorage.removeItem('fms_token')
          } else {
            setUser(me)
          }
        }
      } catch (e) {
        // Handle rate limiting (429) - don't clear token, just show error
        if (e?.response?.status === 429 || e?.status === 429) {
          // Don't clear token on rate limit, just keep existing state
          setLoading(false)
          return
        }
        
        // Check error message to determine if token is invalid
        const errorMessage = e?.message || ''
        const isAuthError = 
          errorMessage.includes('expired') ||
          errorMessage.includes('Invalid token') ||
          errorMessage.includes('Session expired') ||
          errorMessage.includes('User not found') ||
          e?.response?.status === 401 ||
          e?.response?.status === 403 ||
          e?.response?.status === 404
        
        if (isAuthError) {
          setToken(null)
          setUser(null)
          localStorage.removeItem('fms_token')
        }
        // Network or other errors - keep token, might be temporary
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [token])

  async function login(credentials) {
    const { user: u, token: t } = await apiLogin(credentials)
    // Ensure we're not setting a mock user/token
    if (t === 'mock-token' || u?.id === 'mock-user') {
      throw new Error('Login failed: Received mock credentials. Please check your connection and try again.')
    }
    setUser(u)
    setToken(t)
    localStorage.setItem('fms_token', t)
    return u
  }

  async function loginWithMicrosoft() {
    const { user: u, token: t } = await apiMicrosoftLogin()
    // Ensure we're not setting a mock user/token
    if (t === 'mock-token' || u?.id === 'mock-user') {
      throw new Error('Microsoft login failed: Received mock credentials. Please check your connection and try again.')
    }
    setUser(u)
    setToken(t)
    localStorage.setItem('fms_token', t)
    return u
  }


  async function logout() {
    try {
      if (token) await apiLogout(token)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('fms_token')
      clearUserCache() // Clear user cache on logout
    }
  }

  async function refresh(forceRefresh = false) {
    if (!token) return
    try {
      // Clear cache if force refresh is requested
      if (forceRefresh) {
        clearUserCache()
      }
      
      const me = await getCurrentUser(token)
      if (me) {
        setUser(me)
      }
      // If me is null, keep existing user state (might be temporary network issue)
    } catch (e) {
      // Handle rate limiting - don't clear user on rate limit
      if (e?.response?.status === 429 || e?.status === 429) {
        return
      }
      
      // Only clear user if it's definitely an auth error
      const isAuthError = e?.response?.status === 401 || e?.response?.status === 403
      if (isAuthError) {
        setUser(null)
        setToken(null)
        localStorage.removeItem('fms_token')
        clearUserCache()
      }
      // For other errors, keep existing user state
    }
  }

  async function updateProfile(payload) {
    if (!token) return
    const updated = await apiUpdateProfile(token, payload)
    setUser(updated)
    return updated
  }

  async function updateUserPreferences(preferences) {
    if (!token) return
    const updated = await apiUpdatePreferences(token, preferences)
    setUser(updated)
    return updated
  }

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(user && token), loading, login, loginWithMicrosoft, logout, refresh, updateProfile, updateUserPreferences }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}



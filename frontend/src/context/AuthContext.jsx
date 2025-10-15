import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login as apiLogin, logout as apiLogout, updateProfile as apiUpdateProfile } from '../services/authService'

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
      try {
        const me = await getCurrentUser(token)
        setUser(me)
      } catch (e) {
        setToken(null)
        localStorage.removeItem('fms_token')
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [token])

  async function login(credentials) {
    const { user: u, token: t } = await apiLogin(credentials)
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
    }
  }

  async function refresh() {
    if (!token) return
    const me = await getCurrentUser(token)
    setUser(me)
  }

  async function updateProfile(payload) {
    if (!token) return
    const updated = await apiUpdateProfile(token, payload)
    setUser(updated)
    return updated
  }

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(user && token), loading, login, logout, refresh, updateProfile }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}



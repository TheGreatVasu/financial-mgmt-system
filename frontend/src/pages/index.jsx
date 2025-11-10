import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage)
      if (location.state?.email) {
        setEmail(location.state.email)
      }
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [location])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')
    try {
      await login({ email, password })
      // Show success message before redirecting
      setSuccessMessage('Login successful! Redirecting to dashboard...')
      // Wait a moment to show the success message, then redirect
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      // Handle rate limiting (429)
      if (err?.response?.status === 429 || err?.message?.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a moment and try again.')
        setLoading(false)
        return
      }
      
      // Check if error indicates user needs to register first
      const errorMsg = err?.message || 'Login failed'
      if (errorMsg.toLowerCase().includes('not found') || 
          errorMsg.toLowerCase().includes('must register') ||
          errorMsg.toLowerCase().includes('create account')) {
        setError('Account not found. Please create an account first.')
      } else {
        setError(errorMsg)
      }
      setLoading(false)
    }
  }

  // Load Google Identity Services with cache-busting and clear diagnostics
  useEffect(() => {
    const clientId =
      import.meta?.env?.VITE_GOOGLE_CLIENT_ID ||
      (document.querySelector('meta[name="google-client-id"]')?.getAttribute('content') || '').trim() ||
      (typeof window !== 'undefined' ? (window.__APP_CONFIG__?.googleClientId || localStorage.getItem('VITE_GOOGLE_CLIENT_ID') || '') : '')
    if (!clientId) {
      console.error('[Google Sign-In] Missing VITE_GOOGLE_CLIENT_ID in frontend/.env')
      setError('Google sign-in is not configured. Missing client ID.')
      return
    }
    function onLoad() {
      /* global google */
      if (!window.google) {
        console.error('[Google Sign-In] GIS script loaded but window.google is undefined')
        setError('Google sign-in failed to initialize.')
        return
      }
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setLoading(true)
              setError('')
              setSuccessMessage('')
              await loginWithGoogle({ idToken: response.credential })
              setSuccessMessage('Login successful! Redirecting to dashboard...')
              setTimeout(() => {
                navigate('/dashboard')
              }, 1500)
            } catch (e) {
              console.error('[Google Sign-In] Verification error:', e)
              setError(e?.message || 'Google login failed')
              setLoading(false)
            }
          },
        })
      } catch (e) {
        console.error('[Google Sign-In] initialize() failed:', e)
        setError('Google sign-in failed to initialize.')
      }
    }
    // Remove any existing script to force reload from network
    const existing = document.getElementById('gis')
    if (existing) existing.remove()
    const s = document.createElement('script')
    s.src = `https://accounts.google.com/gsi/client?cbust=${Date.now()}`
    s.async = true
    s.defer = true
    s.id = 'gis'
    s.onload = onLoad
    s.onerror = () => {
      console.error('[Google Sign-In] Failed to load GIS script (network/cache)')
      setError('Failed to load Google sign-in script. Check your connection.')
    }
    document.head.appendChild(s)
    // No cleanup necessary beyond script removal on next effect run
  }, [loginWithGoogle, navigate])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Single Centered Box */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Side - Minimal with Background */}
            <div className="relative p-8 lg:p-12 flex flex-col justify-center min-h-[400px] lg:min-h-auto overflow-hidden">
              {/* Professional Financial Background Pattern */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%),
                    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      rgba(59, 130, 246, 0.03) 10px,
                      rgba(59, 130, 246, 0.03) 20px
                    )
                  `,
                  backgroundSize: '100% 100%, 100% 100%, 100% 100%, 40px 40px'
                }}
              />
              
              {/* Financial Chart Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%),
                    linear-gradient(0deg, transparent 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)
                  `,
                  backgroundSize: '200px 200px, 200px 200px',
                  backgroundPosition: '0 0, 100px 100px'
                }}
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-primary-900/50 to-indigo-900/60" />
              
              {/* Content */}
              <div className="relative z-10 space-y-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">S</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Startup Project
                    </h1>
                    <p className="text-sm text-white/80">Financial Management System</p>
                  </div>
                </div>
                
                {/* Short Catchy Heading */}
                <div>
                  <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
                    Your Finance Dashboard
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-sm text-gray-600">Sign in to your financial workspace</p>
                </div>

                {/* Messages */}
                {successMessage && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700">{error}</p>
                      {error.toLowerCase().includes('account not found') && (
                        <Link to="/signup" className="text-xs text-red-600 hover:text-red-700 underline mt-1 inline-block">
                          Create an account
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-gray-300" 
                      placeholder="you@company.com" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input 
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white hover:border-gray-300" 
                        placeholder="••••••••" 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2 select-none cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={remember} 
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                      />
                      <span className="text-gray-700">Remember me</span>
                    </label>
                    <Link 
                      className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors" 
                      to="#"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <button 
                    className="w-full h-12 rounded-xl text-white text-base font-semibold bg-gradient-to-r from-primary-600 via-primary-600 to-indigo-600 hover:from-primary-700 hover:via-primary-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      type="button" 
                      onClick={async ()=>{ 
                        const clientId =
                          import.meta?.env?.VITE_GOOGLE_CLIENT_ID ||
                          (document.querySelector('meta[name="google-client-id"]')?.getAttribute('content') || '').trim() ||
                          (typeof window !== 'undefined' ? (window.__APP_CONFIG__?.googleClientId || localStorage.getItem('VITE_GOOGLE_CLIENT_ID') || '') : '')
                        if (!clientId) {
                          console.error('[Google Sign-In] Missing VITE_GOOGLE_CLIENT_ID')
                          setError('Google sign-in is not configured (missing client ID).')
                          return
                        }
                        if (!window.google) {
                          console.error('[Google Sign-In] GIS not loaded (window.google undefined)')
                          setError('Google sign-in library not loaded. Hard refresh and try again.')
                          return
                        }
                        try {
                          setLoading(true)
                          setError('')
                          window.google.accounts.id.prompt((notification) => {
                            // Diagnostic hook for common origin/consent issues
                            if (notification?.isNotDisplayed()) {
                              console.error('[Google Sign-In] Prompt not displayed:', notification?.getNotDisplayedReason?.())
                            }
                            if (notification?.isSkippedMoment()) {
                              console.warn('[Google Sign-In] Prompt skipped:', notification?.getSkippedReason?.())
                            }
                            if (notification?.isDismissedMoment()) {
                              console.warn('[Google Sign-In] Prompt dismissed:', notification?.getDismissedReason?.())
                            }
                          })
                        } finally {
                          setLoading(false)
                        }
                      }} 
                      className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm font-medium px-4 hover:bg-gray-50 transition-colors transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  New to Startup Project?{' '}
                  <Link className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors" to="/signup">
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

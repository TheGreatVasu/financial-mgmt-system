import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'

export default function LoginPage() {
  const { login } = useAuthContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar />

      {/* Main */}
      <main className="grid grid-cols-1 lg:grid-cols-2 flex-1 pt-16">
      {/* Left - Informational / Branding */}
      <div className="relative overflow-hidden order-1 lg:order-none flex items-center justify-center py-16 px-8 animate-fade-left">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 to-secondary-800" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="relative max-w-xl text-white">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">All Your Finances. Clear Insight. Confident Decisions.</h1>
          <p className="mt-4 text-white/80 text-base md:text-lg">RM Project brings every transaction, report, and forecast into a single, intuitive workspace. so you can monitor cash flow, reduce risk, and move faster with real time visibility across your business.</p>
          <ul className="mt-8 space-y-3">
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary-400" />
              <span>Live analytics and configurable dashboards for KPIs that matter</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary-400" />
              <span>Bank grade security, role based access, and full audit trail</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary-400" />
              <span>Automated invoicing, collections, and payment reconciliation</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary-400" />
              <span>Budgeting, cash flow forecasts, and scenario planning</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary-400" />
              <span>Accessible anywhere desktop or mobile with seamless team collaboration</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex items-center justify-center px-6 py-12 animate-fade-right">
        <div className="w-full max-w-md">
          {/* Logo + Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-primary-600 text-white shadow-soft">
              <span className="text-xl font-semibold">R</span>
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">RM Project</div>
          </div>

          {/* Copy */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold">Welcome Back</h2>
            <p className="text-sm text-secondary-600">Log in to access your personalized financial dashboard.</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-secondary-200 bg-white shadow-soft">
            <div className="p-6 space-y-4">
              {error ? (
                <div className="text-danger-700 bg-danger-100 border border-danger-200 rounded p-2 text-sm">{error}</div>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm">Email address</label>
                  <input className="input" placeholder="you@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm">Password</label>
                  <input className="input" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 select-none">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    <span>Remember me</span>
                  </label>
                  <Link className="text-primary-600 hover:underline" to="#">Forgot Password?</Link>
                </div>

                <button className="btn btn-primary btn-md w-full rounded-2xl transition-transform hover:-translate-y-0.5 hover:shadow-soft" disabled={loading}>
                  {loading ? 'Signing in...' : 'Login'}
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-secondary-200" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-secondary-500">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="btn btn-outline btn-md w-full rounded-2xl">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.6 3.6-5.4 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.9 2.4 2.7 6.6 2.7 11.7S6.9 21 12 21c6 0 9.9-4.2 9.9-10.1 0-.7-.1-1.2-.2-1.7H12z"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" className="btn btn-outline btn-md w-full rounded-2xl">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#F25022" d="M11 11H3V3h8z"/>
                      <path fill="#7FBA00" d="M21 11h-8V3h8z"/>
                      <path fill="#00A4EF" d="M11 21H3v-8h8z"/>
                      <path fill="#FFB900" d="M21 21h-8v-8h8z"/>
                    </svg>
                    Microsoft
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  )
}


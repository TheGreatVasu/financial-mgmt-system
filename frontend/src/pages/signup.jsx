import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { useToast } from '../components/ui/Toast.jsx'

export default function SignupPage() {
  const { login } = useAuthContext()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const emailValid = /.+@.+\..+/.test(email)
      if (!name || !emailValid || password.length < 6) {
        setLoading(false)
        setError('Please provide name, a valid email, and 6+ char password.')
        toast.add('Fix validation errors and try again.', 'error')
        return
      }
      // For demo purposes reuse login to set auth
      await login({ email, password })
      toast.add('Account created! Redirecting...', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Signup failed')
      toast.add('Signup failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="pt-16 grid grid-cols-1 lg:grid-cols-2 flex-1">
        {/* Left: Brand story */}
        <div className="relative overflow-hidden order-1 lg:order-none flex items-center justify-center py-16 px-8 animate-fade-left">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-indigo-700 to-sky-600" />
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative max-w-xl text-white">
            <div className="text-sm uppercase tracking-widest text-white/70">FinFlow</div>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold leading-tight">Create your FinFlow account and start managing your finances effortlessly.</h1>
            <p className="mt-4 text-white/85 text-base md:text-lg">Forecast cash flow, track receivables, and automate collections in one modern workspace.</p>
            <img src="/product-hero.svg" alt="Workspace" className="mt-8 w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>

        {/* Right: Signup card */}
        <div className="flex items-center justify-center px-6 py-12 animate-fade-right">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-soft">
                <span className="text-xl font-semibold">F</span>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">FinFlow</div>
            </div>

            <div className="rounded-3xl border border-secondary-200/70 bg-white/80 backdrop-blur-md shadow-[0_20px_60px_-20px_rgba(2,6,23,0.15)]">
              <div className="p-6 space-y-4">
                {error ? (
                  <div className="text-danger-700 bg-danger-100 border border-danger-200 rounded p-2 text-sm">{error}</div>
                ) : null}

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm">Full name</label>
                    <input className="input rounded-xl" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm">Email address</label>
                    <input className="input rounded-xl" placeholder="you@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm">Password</label>
                    <input className="input rounded-xl" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <button className="w-full h-11 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-primary-600 via-indigo-600 to-sky-600 shadow-[0_12px_40px_-10px_rgba(37,99,235,0.6)] hover:shadow-[0_16px_50px_-10px_rgba(37,99,235,0.75)] transition-all" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
                </form>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-secondary-200" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-secondary-500">Or continue with</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="btn btn-outline btn-md w-full rounded-xl">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.6 3.6-5.4 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.9 2.4 2.7 6.6 2.7 11.7S6.9 21 12 21c6 0 9.9-4.2 9.9-10.1 0-.7-.1-1.2-.2-1.7H12z"/></svg>
                    Google
                  </button>
                  <button type="button" className="btn btn-outline btn-md w-full rounded-xl">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#F25022" d="M11 11H3V3h8z"/><path fill="#7FBA00" d="M21 11h-8V3h8z"/><path fill="#00A4EF" d="M11 21H3v-8h8z"/><path fill="#FFB900" d="M21 21h-8v-8h8z"/></svg>
                    Microsoft
                  </button>
                </div>

                <div className="text-sm text-center">
                  Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}



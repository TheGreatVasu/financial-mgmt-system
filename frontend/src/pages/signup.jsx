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
        <div className="relative overflow-hidden order-1 lg:order-none flex items-center justify-center py-16 px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 to-secondary-800" />
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
          <div className="relative max-w-xl text-white">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">Start managing your finances today.</h1>
            <p className="mt-4 text-white/80 text-base md:text-lg">Create your account to unlock analytics, automation, and reporting—built for speed and clarity.</p>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-primary-600 text-white shadow-soft">
                <span className="text-xl font-semibold">R</span>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">RM Project</div>
            </div>

            <div className="rounded-2xl border border-secondary-200 bg-white shadow-soft">
              <div className="p-6 space-y-4">
                {error ? (
                  <div className="text-danger-700 bg-danger-100 border border-danger-200 rounded p-2 text-sm">{error}</div>
                ) : null}

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm">Full name</label>
                    <input className="input" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm">Email address</label>
                    <input className="input" placeholder="you@company.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm">Password</label>
                    <input className="input" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <button className="btn btn-primary btn-md w-full rounded-2xl" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
                </form>

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



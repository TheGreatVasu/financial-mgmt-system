import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuthContext()
  const [status, setStatus] = React.useState('processing') // processing | success | error | no-token
  const [message, setMessage] = React.useState('')

  React.useEffect(() => {
    async function handle() {
      try {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        const next = params.get('next') || '/'

        if (!token) {
          setStatus('no-token')
          setMessage('No token found in callback URL.')
          return
        }

        // Store token and fetch user
        setStatus('processing')
        await loginWithToken(token)
        setStatus('success')
        setMessage('Login successful — redirecting...')

        // remove token from URL for cleanliness
        try { 
          const url = new URL(window.location.href)
          url.searchParams.delete('token')
          url.searchParams.delete('next')
          window.history.replaceState({}, document.title, url.pathname + url.search)
        } catch (e) {
          // ignore
        }

        // Short delay to show success then redirect
        setTimeout(() => {
          // If frontend asked for a specific next path, respect it (must be internal)
          const safeNext = next.startsWith('/') ? next : '/' 
          navigate(safeNext, { replace: true })
        }, 750)

      } catch (err) {
        console.error('Auth callback login error:', err)
        setStatus('error')
        setMessage(err?.message || 'Failed to log in with callback token')
        // After showing error, send to /login
        setTimeout(() => navigate('/login', { replace: true }), 1500)
      }
    }

    handle()
  }, [loginWithToken, navigate])

  return (
    <div style={{ padding: 32 }}>
      {status === 'processing' && <div>Processing authentication... please wait.</div>}
      {status === 'success' && <div style={{ color: 'green' }}>{message}</div>}
      {status === 'no-token' && <div style={{ color: 'orange' }}>{message} Redirecting to <a href="/login">login</a>...</div>}
      {status === 'error' && <div style={{ color: 'red' }}>{message}</div>}
    </div>
  )
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import { ToastProvider } from './components/ui/Toast.jsx'
import TourProvider from './components/tour/TourProvider.jsx'

// Temp debug: print the build-time Vite env for API base so production builds can be verified
console.log('📡 VITE_API_BASE_URL (build-time):', import.meta.env.VITE_API_BASE_URL ?? '(undefined)', 'MODE:', import.meta.env.MODE)

// Simple scroll restoration on route change
function ScrollToTop() {
  const { pathname } = window.location
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <TourProvider>
          <ScrollToTop />
          <App />
        </TourProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
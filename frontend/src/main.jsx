import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import { ToastProvider } from './components/ui/Toast.jsx'
import TourProvider from './components/tour/TourProvider.jsx'

// Validate API base URL at build time
if (import.meta.env.MODE === 'production') {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    console.error('❌ FATAL: VITE_API_BASE_URL is not set in production build!');
    console.error('   Set VITE_API_BASE_URL=https://nbaurum.com/api before building.');
  } else if (!apiBaseUrl.startsWith('https://')) {
    console.warn('⚠️  WARNING: VITE_API_BASE_URL should be a full HTTPS URL in production:', apiBaseUrl);
  }
} else if (import.meta.env.DEV) {
  // Only log in development
  console.log('📡 API Base URL:', import.meta.env.VITE_API_BASE_URL ?? '(not set - using proxy)');
}

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
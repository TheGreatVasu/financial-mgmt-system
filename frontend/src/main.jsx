import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import { ToastProvider } from './components/ui/Toast.jsx'
import TourProvider from './components/tour/TourProvider.jsx'

// Validate API base URL at startup (but don't crash if missing)
if (import.meta.env.MODE === 'production') {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    console.warn('⚠️  VITE_API_BASE_URL is not set in production. API calls may fail. Check your deployment configuration.');
  } else if (apiBaseUrl.includes('localhost') || apiBaseUrl.startsWith('http://')) {
    console.warn('⚠️  VITE_API_BASE_URL appears to use HTTP instead of HTTPS. This may cause security issues in production.');
    console.warn('   Current value:', apiBaseUrl);
    console.warn('   Recommended: https://nbaurum.com/api');
  }
} else if (import.meta.env.DEV) {
  // Development mode - API configuration complete
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
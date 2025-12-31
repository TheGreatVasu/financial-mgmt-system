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
    console.error('   Set VITE_API_BASE_URL=https://nbaurum.com/api in .env.production or .env.production.local');
    console.error('   Then rebuild: npm run build');
  } else if (apiBaseUrl.includes('localhost') || apiBaseUrl.startsWith('http://')) {
    console.error('❌ FATAL: VITE_API_BASE_URL must use HTTPS in production!');
    console.error('   Current value:', apiBaseUrl);
    console.error('   Expected: https://nbaurum.com/api');
    console.error('   Fix in .env.production or .env.production.local and rebuild');
  }
} else if (import.meta.env.DEV) {
  // Development mode - just log for info
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    console.log('📡 Using Vite proxy for /api requests (VITE_API_BASE_URL not set)');
  } else {
    console.log('📡 API Base URL:', apiBaseUrl);
  }
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
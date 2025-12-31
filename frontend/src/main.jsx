import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import { ToastProvider } from './components/ui/Toast.jsx'
import TourProvider from './components/tour/TourProvider.jsx'

// Validate API base URL at build time (only in development to avoid console noise)
if (import.meta.env.DEV) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    console.warn('⚠️  VITE_API_BASE_URL is not set. Using Vite proxy for development.');
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
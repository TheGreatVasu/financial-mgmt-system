import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import { ToastProvider } from './components/ui/Toast.jsx'

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
      <ScrollToTop />
      <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)



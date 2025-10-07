import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function closeMenu() {
    setOpen(false)
  }

  const navLinkBase = 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 relative group'

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-gray-900 focus:px-3 focus:py-2 focus:rounded-md focus:z-50">Skip to content</a>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 lg:h-20 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                FinFlow
              </span>
              <span className="text-xs text-gray-500 font-medium -mt-1">
                Financial Management
              </span>
            </div>
          </Link>

          {/* Center: Navigation (desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink 
              className={navLinkBase} 
              to="/"
              style={({ isActive }) => ({
                color: isActive ? '#2563eb' : undefined,
                fontWeight: isActive ? '600' : undefined
              })}
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              className={navLinkBase} 
              to="/features"
              style={({ isActive }) => ({
                color: isActive ? '#2563eb' : undefined,
                fontWeight: isActive ? '600' : undefined
              })}
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              className={navLinkBase} 
              to="/pricing"
              style={({ isActive }) => ({
                color: isActive ? '#2563eb' : undefined,
                fontWeight: isActive ? '600' : undefined
              })}
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              className={navLinkBase} 
              to="/contact"
              style={({ isActive }) => ({
                color: isActive ? '#2563eb' : undefined,
                fontWeight: isActive ? '600' : undefined
              })}
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
            </NavLink>
            
            {/* Dropdown for Solutions */}
            <div className="relative group">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 flex items-center gap-1">
                Solutions
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                <div className="py-2">
                  <Link to="/dashboard" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <div className="font-medium">Dashboard</div>
                    <div className="text-xs text-gray-500">Analytics & Reports</div>
                  </Link>
                  <Link to="/invoices" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <div className="font-medium">Invoicing</div>
                    <div className="text-xs text-gray-500">Create & Track Invoices</div>
                  </Link>
                  <Link to="/payments" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <div className="font-medium">Payments</div>
                    <div className="text-xs text-gray-500">Payment Management</div>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Right: Actions (desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/dashboard" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Demo
            </Link>
          </div>

          {/* Mobile: Hamburger */}
          <button 
            aria-label="Open menu" 
            aria-expanded={open} 
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200" 
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-5 w-5 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {open ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
        open ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pb-6 border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <nav className="flex flex-col py-4 space-y-1">
            <Link 
              className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium" 
              to="/" 
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium" 
              to="/features" 
              onClick={closeMenu}
            >
              Features
            </Link>
            <Link 
              className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium" 
              to="/pricing" 
              onClick={closeMenu}
            >
              Pricing
            </Link>
            <Link 
              className="px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium" 
              to="/contact" 
              onClick={closeMenu}
            >
              Contact
            </Link>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Link 
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium" 
                to="/dashboard" 
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link 
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium" 
                to="/invoices" 
                onClick={closeMenu}
              >
                Invoicing
              </Link>
              <Link 
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium" 
                to="/payments" 
                onClick={closeMenu}
              >
                Payments
              </Link>
            </div>
          </nav>
          
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <Link 
              to="/login" 
              className="w-full text-center px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200" 
              onClick={closeMenu}
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="w-full text-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 whitespace-nowrap" 
              onClick={closeMenu}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}



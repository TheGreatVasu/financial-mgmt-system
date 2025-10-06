import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  function closeMenu() {
    setOpen(false)
  }

  const navLinkBase = 'px-3 py-2 text-sm text-secondary-700 hover:text-primary-600 transition-colors'

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white shadow-sm">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-secondary-900 focus:px-3 focus:py-2 focus:rounded-md">Skip to content</a>
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <img src="/logo.png" alt="RM Project" className="h-8 w-8" />
            <span className="text-base sm:text-lg font-semibold tracking-tight">
              <span className="font-bold text-secondary-900">RM</span>{' '}
              <span className="text-secondary-700">Project</span>
            </span>
          </Link>

          {/* Center: Nav (desktop) */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink className={navLinkBase} to="/">Home</NavLink>
            <NavLink className={navLinkBase} to="/dashboard">Dashboard</NavLink>
            <NavLink className={navLinkBase} to="/features">Features</NavLink>
            <NavLink className={navLinkBase} to="/pricing">Pricing</NavLink>
            <NavLink className={navLinkBase} to="/contact">Contact</NavLink>
          </nav>

          {/* Right: Actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-secondary-800 border border-secondary-200 rounded-md hover:bg-secondary-50 transition-colors">Login</Link>
            <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">Sign Up</Link>
          </div>

          {/* Mobile: Hamburger */}
          <button aria-label="Open menu" aria-expanded={open} className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-secondary-200 text-secondary-800 hover:bg-secondary-50" onClick={() => setOpen((v) => !v)}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-4 pb-4 border-t border-secondary-200 bg-white">
          <nav className="flex flex-col py-2">
            <Link className="px-2 py-2 rounded text-secondary-800 hover:text-primary-600 transition-colors" to="/" onClick={closeMenu}>Home</Link>
            <Link className="px-2 py-2 rounded text-secondary-800 hover:text-primary-600 transition-colors" to="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <Link className="px-2 py-2 rounded text-secondary-800 hover:text-primary-600 transition-colors" to="/features" onClick={closeMenu}>Features</Link>
            <Link className="px-2 py-2 rounded text-secondary-800 hover:text-primary-600 transition-colors" to="/pricing" onClick={closeMenu}>Pricing</Link>
            <Link className="px-2 py-2 rounded text-secondary-800 hover:text-primary-600 transition-colors" to="/contact" onClick={closeMenu}>Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="flex-1 text-center px-4 py-2 text-sm font-medium text-secondary-800 border border-secondary-200 rounded-md hover:bg-secondary-50 transition-colors" onClick={closeMenu}>Login</Link>
            <Link to="/signup" className="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors" onClick={closeMenu}>Sign Up</Link>
          </div>
        </div>
      </div>
    </header>
  )
}



import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuthContext } from '../../context/AuthContext.jsx'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function AppLayout({ title, children }) {
  const { user, logout } = useAuthContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />

      <div className="pt-16 max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden -mt-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-secondary-200 rounded-md bg-white hover:bg-secondary-50" onClick={() => setSidebarOpen((v) => !v)}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            Menu
          </button>
        </div>

        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:col-span-3`}>
          <nav className="card">
            <div className="p-4 border-b border-secondary-200 font-medium">Navigation</div>
            <ul className="p-2">
              <MenuItem to="/dashboard" label="Dashboard" />
              <MenuItem to="/payments" label="Payments" />
              <MenuItem to="/subscription" label="Subscriptions" />
              <MenuItem to="/customers" label="Customers" />
              <MenuItem to="/invoices" label="Invoices" />
              <MenuItem to="/reports" label="Reports" />
              <MenuItem to="/profile" label="My Profile" />
              <li>
                <button className="w-full text-left block px-3 py-2 rounded hover:bg-secondary-100" onClick={logout}>Logout</button>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {title ? (
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>
          ) : null}
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}

function MenuItem({ to, label }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `block px-3 py-2 rounded ${isActive ? 'bg-primary-50 text-primary-700' : 'hover:bg-secondary-100'}`
        }
      >
        {label}
      </NavLink>
    </li>
  )
}



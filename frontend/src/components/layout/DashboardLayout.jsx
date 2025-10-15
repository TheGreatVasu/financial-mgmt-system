import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { LayoutDashboard, CreditCard, Users, FileText, BarChart3, UserCircle2, LogOut } from 'lucide-react'
import DashboardHeader from './DashboardHeader.jsx'

import { useState } from 'react'

export default function DashboardLayout({ children }) {
  const { logout } = useAuthContext()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">{/* App shell */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur-sm border-r border-secondary-200/80 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)] transition-transform duration-200`}>{/* Sidebar */}
        <div className="h-16 flex items-center px-5 border-b border-secondary-200/70">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm" />
            <span className="text-sm font-semibold tracking-wide">Finance Admin</span>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          <SideLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SideLink to="/payments" icon={CreditCard} label="Payments" />
          <SideLink to="/customers" icon={Users} label="Customers" />
          <SideLink to="/invoices" icon={FileText} label="Invoices" />
          <SideLink to="/reports" icon={BarChart3} label="Reports" />
          <SideLink to="/subscription" icon={FileText} label="Subscription" />
          <SideLink to="/profile" icon={UserCircle2} label="My Profile" />

          <button onClick={handleLogout} className="mt-4 w-full inline-flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100/80 transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>

      <main className="md:pl-64">{/* Content area shifted by sidebar width */}
        {/* Header */}
        <DashboardHeader onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        
        {/* Main Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}

function SideLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-sm'
            : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100/80'
        }`
      }
    >
      <Icon className="h-4 w-4 opacity-90 group-hover:opacity-100 transition-transform duration-200 group-hover:scale-105" />
      <span>{label}</span>
    </NavLink>
  )
}



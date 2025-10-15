import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { LayoutDashboard, CreditCard, Users, FileText, BarChart3, UserCircle2, LogOut, Search, Settings, PlusCircle, Download, AlertCircle, Star } from 'lucide-react'
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
    <div className="min-h-screen w-full bg-radial-vignette bg-dots bg-noise bg-aurora">{/* App shell */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed inset-y-0 left-0 w-72 bg-secondary-50 backdrop-blur-sm border-r border-secondary-200/80 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)] transition-transform duration-200`} data-tour="sidebar">{/* Sidebar */}
        <div className="brand flex items-center px-5 border-b border-secondary-200/70">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm" />
            <span className="text-sm font-semibold tracking-wide">Finance Admin</span>
          </div>
        </div>

        <nav className="px-3 space-y-5 overflow-y-auto h-screen pb-6">
          <div>
            <div className="px-2 text-[11px] uppercase tracking-wider text-secondary-500 mb-2">Overview</div>
            <SideLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" badge="Live" />
            <SideLink to="/reports" icon={BarChart3} label="Reports" />
          </div>
          <div>
            <div className="px-2 text-[11px] uppercase tracking-wider text-secondary-500 mb-2">Manage</div>
            <SideLink to="/invoices" icon={FileText} label="Invoices" actionIcon={PlusCircle} />
            <SideLink to="/payments" icon={CreditCard} label="Payments" actionIcon={Download} />
            <SideLink to="/customers" icon={Users} label="Customers" actionIcon={Star} />
          </div>
          <div>
            <div className="px-2 text-[11px] uppercase tracking-wider text-secondary-500 mb-2">System</div>
            <SideLink to="/subscription" icon={FileText} label="Subscription" />
            <SideLink to="/profile" icon={UserCircle2} label="My Profile" />
            <SideLink to="/alerts" icon={AlertCircle} label="Alerts" />
            <SideLink to="/settings" icon={Settings} label="Settings" />
          </div>

          <div className="mt-4 p-3 rounded-lg border border-primary-200/60 bg-primary-50">
            <div className="text-xs text-secondary-600">Usage</div>
            <div className="mt-2 h-2 rounded-full bg-secondary-200">
              <div className="h-2 rounded-full bg-primary-500" style={{ width: '62%' }} />
            </div>
            <div className="mt-1 text-[11px] text-secondary-500">62% of 5GB</div>
          </div>

          <button onClick={handleLogout} className="mt-6 w-full inline-flex items-center justify-center gap-3 px-3 py-2.5 rounded-md text-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>

      <main className="md:pl-72">{/* Content area shifted by sidebar width */}
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

function SideLink({ to, icon: Icon, label, badge, actionIcon: ActionIcon }) {
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
      <span className="flex-1">{label}</span>
      {badge ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">{badge}</span> : null}
      {ActionIcon ? (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionIcon className="h-3.5 w-3.5 text-secondary-500" />
        </span>
      ) : null}
    </NavLink>
  )
}



import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { LayoutDashboard, CreditCard, Users, FileText, BarChart3, UserCircle2, LogOut, Search, Settings, PlusCircle, Download, AlertCircle, Star, ChevronDown } from 'lucide-react'
import DashboardHeader from './DashboardHeader.jsx'

import { useEffect, useRef, useState } from 'react'

export default function DashboardLayout({ children }) {
  const { logout } = useAuthContext()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === '1')
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = Number(localStorage.getItem('sidebar_width'))
    return Number.isFinite(stored) && stored >= 200 && stored <= 420 ? stored : 288 // default 72*4 = 288 (~w-72)
  })
  const isDraggingRef = useRef(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0')
  }, [collapsed])

  useEffect(() => {
    localStorage.setItem('sidebar_width', String(sidebarWidth))
  }, [sidebarWidth])

  function onDragStart(e) {
    if (collapsed) return
    isDraggingRef.current = true
    document.body.style.userSelect = 'none'
  }
  function onDragMove(e) {
    if (!isDraggingRef.current) return
    const x = e.clientX
    const next = Math.min(420, Math.max(200, x))
    setSidebarWidth(next)
  }
  function onDragEnd() {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    document.body.style.userSelect = ''
  }

  useEffect(() => {
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
    return () => {
      window.removeEventListener('mousemove', onDragMove)
      window.removeEventListener('mouseup', onDragEnd)
    }
  }, [])

  const computedSidebarWidth = collapsed ? 72 : sidebarWidth
  const mainPaddingLeft = computedSidebarWidth

  function handleGlobalSidebarToggle() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024
    if (width < 768) {
      setSidebarOpen((s) => !s)
    } else {
      setCollapsed((v) => !v)
    }
  }

  return (
    <div className="min-h-screen w-full bg-radial-vignette bg-dots bg-noise bg-aurora transition-colors duration-300">{/* App shell */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed inset-y-0 left-0 bg-secondary-50 dark:bg-[#111827] backdrop-blur-sm border-r border-secondary-200/80 dark:border-secondary-800 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)] transition-transform duration-200`} style={{ width: computedSidebarWidth }} data-tour="sidebar">{/* Sidebar */}
        <div className="brand flex items-center px-3 border-b border-secondary-200/70">
          <div className="flex items-center gap-2" style={{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto', transition: 'opacity 200ms ease' }}>
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm" />
            <span className="text-sm font-semibold tracking-wide">Finance Admin</span>
          </div>
        </div>

        <nav className="px-3 space-y-5 overflow-y-auto h-screen pb-6">
          <div>
            <div className="px-2 text-[11px] uppercase tracking-wider text-secondary-500 mb-2" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>Overview</div>
            <DashboardMenu collapsed={collapsed} />
            <SideLink to="/reports" icon={BarChart3} label="Reports" />
          </div>
          <div>
            <div className="px-2 text-[11px] uppercase tracking-wider text-secondary-500 mb-2" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>Manage</div>
            <SideLink to="/invoices" icon={FileText} label="Invoices" actionIcon={PlusCircle} />
            <SideLink to="/payments" icon={CreditCard} label="Payments" actionIcon={Download} />
            <SideLink to="/customers" icon={Users} label="Customers" actionIcon={Star} />
          </div>
          <div>
            <div className="px-2 text-[11px] uppercase tracking-wider text-secondary-500 mb-2" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>System</div>
            <SideLink to="/subscription" icon={FileText} label="Subscription" />
            <SideLink to="/profile" icon={UserCircle2} label="My Profile" />
            <SideLink to="/alerts" icon={AlertCircle} label="Alerts" />
            <SideLink to="/settings" icon={Settings} label="Settings" />
          </div>

          <div className="mt-4 p-3 rounded-lg border border-primary-200/60 bg-primary-50 dark:border-secondary-700 dark:bg-[#1E293B]" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>
            <div className="text-xs text-secondary-600">Usage</div>
            <div className="mt-2 h-2 rounded-full bg-secondary-200">
              <div className="h-2 rounded-full bg-primary-500" style={{ width: '62%' }} />
            </div>
            <div className="mt-1 text-[11px] text-secondary-500">62% of 5GB</div>
          </div>

          <button onClick={handleLogout} className="mt-6 w-full inline-flex items-center justify-center gap-3 px-3 py-2.5 rounded-md text-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
        {/* Resize handle */}
        <div onMouseDown={onDragStart} className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize group"><div className="absolute inset-y-0 right-0 w-0.5 bg-transparent group-hover:bg-primary-300/70 transition-colors"/></div>
      </div>

      <main className="transition-colors duration-300" style={{ paddingLeft: mainPaddingLeft }}>{/* Content area shifted by sidebar width */}
        {/* Header */}
        <DashboardHeader onToggleSidebar={handleGlobalSidebarToggle} />
        
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
        `group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
          isActive
            ? 'text-primary-700'
            : 'text-secondary-700 hover:text-secondary-900'
        }`
      }
    >
      <Icon className="h-4 w-4 opacity-90 group-hover:text-secondary-900 transition-colors" />
      <span className="flex-1" style={{ opacity: label ? undefined : 0 }}>
        {label}
      </span>
      {badge ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">{badge}</span> : null}
      {ActionIcon ? (
        <span>
          <ActionIcon className="h-3.5 w-3.5 text-secondary-400" />
        </span>
      ) : null}
    </NavLink>
  )
}

function DashboardMenu({ collapsed = false }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <div className="px-1">
      <button
        onClick={() => { setOpen((v) => !v); navigate('/dashboard'); }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-secondary-700 hover:text-secondary-900`}
        aria-expanded={open}
        aria-controls="dashboard-submenu"
      >
        <span className="inline-flex items-center gap-3">
          <LayoutDashboard className="h-4 w-4 opacity-90 transition-colors" />
          <span style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>Dashboard</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id="dashboard-submenu"
        className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${open ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'}`}
      >
        <div className="mt-1 ml-0 mr-0 py-1 space-y-1" style={{ display: collapsed ? 'none' : undefined }}>
          <SubLink to="/dashboard/new-po" label="New PO" icon={PlusCircle} />
          <Divider />
          <SubLink to="/dashboard/boq-entry" label="BOQ Entry" icon={FileText} />
          <Divider />
          <SubLink to="/dashboard/inv-items" label="INV Items" icon={FileText} />
          <Divider />
          <SubLink to="/dashboard/payment-summary" label="Payment Summary" icon={CreditCard} />
        </div>
      </div>
    </div>
  )
}

function SubLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-2 px-3 py-2 text-sm ${isActive ? 'text-primary-700 font-medium' : 'text-secondary-700 hover:text-secondary-900'}`
      }
    >
      <Icon className="h-3.5 w-3.5 opacity-80 group-hover:text-secondary-900 transition-colors" />
      <span>{label}</span>
    </NavLink>
  )
}

function Divider() {
  return <div className="h-px bg-secondary-200/60 mx-3" />
}



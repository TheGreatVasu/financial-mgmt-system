import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Search, Moon, Sun, Bell, ChevronDown, Plus } from 'lucide-react'
import { useDashboardTour } from '../tour/TourProvider.jsx'

export default function DashboardHeader({ onToggleSidebar }) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { startTour, resetTour } = useDashboardTour()
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [theme, setTheme] = useState(() => (localStorage.getItem('theme') || 'light'))
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const createRef = useRef(null)

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    function onKey(e) {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsNotifOpen(false)
        setIsCreateOpen(false)
        setIsUserDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false)
      if (createRef.current && !createRef.current.contains(e.target)) setIsCreateOpen(false)
    }
    window.addEventListener('mousedown', onClickOutside)
    return () => window.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="app-header sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200" data-tour="topbar">
      <div className="container-app flex items-center justify-between h-full">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu */}
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md" data-tour="search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                ref={searchRef}
                className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                  {navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'}
                </span>
                <button
                  aria-label="Clear search"
                  onClick={() => { if (searchRef.current) { searchRef.current.value=''; searchRef.current.focus() } }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create */}
          <div className="relative" ref={createRef} data-tour="create">
            <button aria-haspopup="menu" aria-expanded={isCreateOpen} onClick={()=>setIsCreateOpen((s)=>!s)} className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80">
              <Plus className="w-4 h-4" />
              Create
            </button>
            {isCreateOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link to="/invoices/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Invoice</Link>
                <Link to="/customers/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Customer</Link>
                <Link to="/payments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Payment</Link>
              </div>
            )}
          </div>

          {/* Start Tour */}
          <button onClick={startTour} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700">Start Tour</button>

          {/* Theme Toggle */}
          <button onClick={()=>setTheme(t=> t==='dark' ? 'light':'dark')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {theme==='dark' ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef} data-tour="notifications">
            <button aria-haspopup="menu" aria-expanded={isNotifOpen} onClick={()=>setIsNotifOpen((s)=>!s)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
            </button>
            {isNotifOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 text-sm">
                <div className="px-4 py-1 text-secondary-500">Notifications</div>
                <span className="block px-4 py-2 hover:bg-gray-100" role="menuitem">3 invoices due today</span>
                <span className="block px-4 py-2 hover:bg-gray-100" role="menuitem">Payment received ₹45,000</span>
                <span className="block px-4 py-2 hover:bg-gray-100" role="menuitem">2 invoices overdue 30+ days</span>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" data-tour="profile">
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">T</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Test User</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* User Dropdown */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Billing
                </a>
                <hr className="my-1" />
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Moon, Sun, Bell, ChevronDown, Plus } from 'lucide-react'
import { useDashboardTour } from '../tour/TourProvider.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'

export default function DashboardHeader({ onToggleSidebar }) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { startTour, resetTour } = useDashboardTour()
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [theme, setTheme] = useState(() => (localStorage.getItem('theme') || 'light'))
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const createRef = useRef(null)
  const navigate = useNavigate()
  const { logout, user } = useAuthContext()
  
  // Listen for theme changes from settings page
  useEffect(() => {
    const handleThemeChange = (e) => {
      const { actualTheme } = e.detail
      setTheme(actualTheme)
    }
    
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        setTheme(e.newValue || 'light')
      }
    }
    
    window.addEventListener('themechange', handleThemeChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  // Debug: Log user data to help diagnose issues
  useEffect(() => {
    if (user) {
      console.log('DashboardHeader - Current user data:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        fullUser: user
      })
    } else {
      console.log('DashboardHeader - No user data available')
    }
  }, [user])
  
  // Calculate display name
  const getDisplayName = () => {
    if (!user) return 'User'
    // Check for mock user
    if (user.id === 'mock-user' || user.email === 'demo@example.com') {
      console.warn('DashboardHeader - Mock user detected, showing fallback')
      return 'User'
    }
    // Prioritize firstName + lastName for full name display
    if (user.firstName && user.lastName) {
      // Don't show "Account" as last name - it's a placeholder
      if (user.lastName.toLowerCase() === 'account' && user.firstName) {
        return user.firstName
      }
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) return user.firstName
    if (user.username) {
      // Try to extract a better name from username
      const username = user.username.replace(/\d+/g, '').replace(/[._-]/g, ' ')
      if (username.length > 0) {
        return username.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      }
      return user.username
    }
    if (user.email) {
      // Extract name from email (before @)
      const emailName = user.email.split('@')[0].replace(/\d+/g, '').replace(/[._-]/g, ' ')
      if (emailName.length > 0) {
        return emailName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      }
      return user.email.split('@')[0]
    }
    return 'User'
  }
  
  // Calculate initials (always 2 characters)
  const getInitials = () => {
    if (!user) return 'U'
    // Check for mock user
    if (user.id === 'mock-user' || user.email === 'demo@example.com') {
      return 'U'
    }
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase()
    }
    if (user.firstName) {
      const name = user.firstName.trim()
      return name.length >= 2 ? name.substring(0, 2).toUpperCase() : (name[0] + name[0]).toUpperCase()
    }
    if (user.username) {
      const name = user.username.trim()
      return name.length >= 2 ? name.substring(0, 2).toUpperCase() : (name[0] + name[0]).toUpperCase()
    }
    if (user.email) {
      const name = user.email.split('@')[0]
      return name.length >= 2 ? name.substring(0, 2).toUpperCase() : (name[0] + name[0]).toUpperCase()
    }
    return 'U'
  }
  
  const displayName = getDisplayName()
  const initials = getInitials()

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
    <header className="app-header sticky top-0 z-50 bg-white/95 dark:bg-[#111827]/95 backdrop-blur border-b border-gray-200 dark:border-secondary-800 transition-colors" data-tour="topbar">
      <div className="container-app flex items-center justify-between h-full px-3 sm:px-4">
        {/* Left Side */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile sidebar toggle */}
          <button aria-label="Toggle sidebar" onClick={onToggleSidebar} className="inline-flex md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B]">
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[140px] max-w-md" data-tour="search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search..."
                ref={searchRef}
                className="w-full pl-10 pr-16 sm:pr-20 py-2.5 border border-gray-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-[#1E293B] text-secondary-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 transition-colors"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-[#243045] px-1.5 py-0.5 rounded text-[10px]">
                  {navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'}
                </span>
                <button
                  aria-label="Clear search"
                  onClick={() => { if (searchRef.current) { searchRef.current.value=''; searchRef.current.focus() } }}
                  className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded"
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
            <button aria-haspopup="menu" aria-expanded={isCreateOpen} onClick={()=>setIsCreateOpen((s)=>!s)} className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 dark:border-secondary-700 text-sm text-secondary-700 dark:text-gray-100 hover:bg-secondary-100/80 dark:hover:bg-[#1E293B]">
              <Plus className="w-4 h-4" />
              Create
            </button>
            {isCreateOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 py-1 z-50">
                <Link to="/invoices/new" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045]" role="menuitem">Invoice</Link>
                <Link to="/customers/new" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045]" role="menuitem">Customer</Link>
                <Link to="/payments" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045]" role="menuitem">Payment</Link>
              </div>
            )}
          </div>

          {/* Start Tour */}
          <button onClick={startTour} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700">Start Tour</button>

          {/* Theme Toggle */}
          <button onClick={()=>setTheme(t=> t==='dark' ? 'light':'dark')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors">
            {theme==='dark' ? <Sun className="w-5 h-5 text-gray-200" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef} data-tour="notifications">
            <button aria-haspopup="menu" aria-expanded={isNotifOpen} onClick={()=>setIsNotifOpen((s)=>!s)} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-200" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
            </button>
            {isNotifOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 py-2 z-50 text-sm">
                <div className="px-4 py-1 text-secondary-500 dark:text-gray-300">Notifications</div>
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#243045]" role="menuitem">3 invoices due today</span>
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#243045]" role="menuitem">Payment received ₹45,000</span>
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#243045]" role="menuitem">2 invoices overdue 30+ days</span>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" data-tour="profile">
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">{initials}</span>
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-100">{displayName}</span>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>

            {/* User Dropdown */}
            {isUserDropdownOpen && (
              <div role="menu" aria-label="User menu" className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 py-1 z-50">
                <Link to="/profile" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045]" onClick={() => setIsUserDropdownOpen(false)}>
                  Profile
                </Link>
                <Link to="/settings" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045]" onClick={() => setIsUserDropdownOpen(false)}>
                  Settings
                </Link>
                <Link to="/subscription" role="menuitem" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045]" onClick={() => setIsUserDropdownOpen(false)}>
                  Billing
                </Link>
                <hr className="my-1" />
                <button role="menuitem" className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045]" onClick={() => { setIsUserDropdownOpen(false); logout(); navigate('/login') }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, ChevronDown } from 'lucide-react'
import { useDashboardTour } from '../tour/TourProvider.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'

export default function DashboardHeader({ onToggleSidebar }) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { startTour } = useDashboardTour()
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const { logout, user } = useAuthContext()
  
  // Calculate display name from actual user data
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }
  
  // Calculate initials from actual user data
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      const f = user.firstName[0] || ''
      const l = user.lastName[0] || ''
      return (f + l).toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }
  
  const displayName = getDisplayName()
  const initials = getInitials()

  useEffect(() => {
    function onKey(e) {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsNotifOpen(false)
        setIsUserDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false)
    }
    window.addEventListener('mousedown', onClickOutside)
    return () => window.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header 
      className="app-header sticky top-0 z-50 bg-white/95 dark:bg-[#111827]/95 backdrop-blur border-b border-gray-200 dark:border-secondary-800 transition-colors" 
      data-tour="topbar"
    >
      <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6 lg:px-8 gap-2 sm:gap-3 md:gap-4">
        {/* Left Side - Mobile Menu, Brand & Search */}
        <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-3">
          {/* Mobile sidebar toggle */}
          <button 
            aria-label="Toggle sidebar" 
            onClick={onToggleSidebar} 
            className="inline-flex lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          
          {/* Mobile Brand Name */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold tracking-wide text-gray-900 dark:text-gray-100">Startup Project</span>
          </div>
          
          {/* Search Bar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block relative flex-1 min-w-0 max-w-md" data-tour="search">
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                ref={searchRef}
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-20 md:pr-24 py-2 sm:py-2.5 border border-gray-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-[#1E293B] text-secondary-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 transition-all"
              />
              <div className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <span className="hidden sm:inline-flex text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-[#243045] px-1.5 py-0.5 rounded text-[10px] font-medium">
                  {navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'}
                </span>
                <button
                  aria-label="Clear search"
                  onClick={() => { 
                    if (searchRef.current) { 
                      searchRef.current.value = ''; 
                      searchRef.current.focus() 
                    } 
                  }}
                  className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
          {/* Start Tour - Hidden on mobile */}
          <button 
            onClick={startTour} 
            className="hidden lg:inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-2 rounded-lg bg-primary-600 text-white text-xs sm:text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Start guided tour"
          >
            <span className="hidden sm:inline">Start Tour</span>
          </button>

          {/* Notifications - Hidden on mobile */}
          <div className="hidden lg:block relative" ref={notifRef} data-tour="notifications">
            <button 
              aria-haspopup="menu" 
              aria-expanded={isNotifOpen} 
              onClick={() => setIsNotifOpen((s) => !s)} 
              className="relative p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors flex-shrink-0"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-200" />
              <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-[#111827]"></span>
            </button>
            {isNotifOpen && (
              <div 
                role="menu" 
                className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 py-2 z-50 text-sm max-h-[80vh] overflow-y-auto"
              >
                <div className="px-4 py-2 text-secondary-500 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-secondary-700">
                  Notifications
                </div>
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#243045] transition-colors" role="menuitem">
                  3 invoices due today
                </span>
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#243045] transition-colors" role="menuitem">
                  Payment received ₹45,000
                </span>
                <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#243045] transition-colors" role="menuitem">
                  2 invoices overdue 30+ days
                </span>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" data-tour="profile">
            <button 
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                {user?.avatarUrl || user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl || user.avatarUrl} 
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const initialsSpan = e.target.parentElement?.querySelector('span')
                      if (initialsSpan) {
                        initialsSpan.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <span className="text-white text-xs sm:text-sm font-semibold" style={{ display: (user?.avatarUrl || user?.profileImageUrl) ? 'none' : 'flex' }}>
                  {initials}
                </span>
              </div>
              <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-100 max-w-[80px] sm:max-w-[100px] md:max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-300 flex-shrink-0 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {isUserDropdownOpen && (
              <div 
                role="menu" 
                aria-label="User menu" 
                className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 py-1 z-50"
              >
                <Link 
                  to="/profile" 
                  role="menuitem" 
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045] transition-colors" 
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  Profile
                </Link>
                <hr className="my-1 border-gray-200 dark:border-secondary-700" />
                <button 
                  role="menuitem" 
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#243045] transition-colors" 
                  onClick={() => { 
                    setIsUserDropdownOpen(false); 
                    logout(); 
                    navigate('/login') 
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

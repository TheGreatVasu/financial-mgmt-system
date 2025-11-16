import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, ChevronDown, Upload, FileSpreadsheet } from 'lucide-react'
import { useDashboardTour } from '../tour/TourProvider.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { useImportContext } from '../../context/ImportContext.jsx'

export default function DashboardHeader({ onToggleSidebar }) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { startTour } = useDashboardTour()
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [showImportTooltip, setShowImportTooltip] = useState(false)
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const importButtonRef = useRef(null)
  const navigate = useNavigate()
  const { logout, user } = useAuthContext()
  const { openImportModal } = useImportContext()
  
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
      <div className="container-app flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Left Side - Search Bar */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Mobile sidebar toggle */}
          <button 
            aria-label="Toggle sidebar" 
            onClick={onToggleSidebar} 
            className="inline-flex md:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-md" data-tour="search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                ref={searchRef}
                className="w-full pl-10 pr-16 sm:pr-20 py-2.5 border border-gray-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-[#1E293B] text-secondary-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 transition-all"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-[#243045] px-1.5 py-0.5 rounded text-[10px] font-medium">
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
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-4">
          {/* Import Data Button */}
          <div 
            className="relative" 
            ref={importButtonRef}
            onMouseEnter={() => setShowImportTooltip(true)}
            onMouseLeave={() => setShowImportTooltip(false)}
          >
            <button 
              onClick={openImportModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium hover:from-emerald-700 hover:to-emerald-800 active:from-emerald-800 active:to-emerald-900 transition-all duration-200 shadow-sm hover:shadow-md group"
              aria-label="Import data from Excel or CSV files"
            >
              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Import Data</span>
              <span className="sm:hidden">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
            </button>
            
            {/* Professional Tooltip */}
            {showImportTooltip && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#1E293B] rounded-lg shadow-xl border border-gray-200 dark:border-secondary-700 p-4 z-[100] animate-in fade-in-0 zoom-in-95">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                      Import Your Company Data
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                      Seamlessly migrate your financial data from Excel (.xlsx, .xls) or CSV files. Import invoices, customers, and payment records in bulk to get started quickly.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
                        Excel Support
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
                        CSV Support
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-medium border border-emerald-200 dark:border-emerald-800">
                        Bulk Import
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-secondary-700">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        💡 Download our sample template to ensure proper formatting
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Start Tour */}
          <button 
            onClick={startTour} 
            className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Start Tour
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef} data-tour="notifications">
            <button 
              aria-haspopup="menu" 
              aria-expanded={isNotifOpen} 
              onClick={() => setIsNotifOpen((s) => !s)} 
              className="relative p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-200" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-[#111827]"></span>
            </button>
            {isNotifOpen && (
              <div 
                role="menu" 
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 py-2 z-50 text-sm"
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
              className="flex items-center gap-2.5 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white text-sm font-semibold">{initials}</span>
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-100 max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-300 flex-shrink-0 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {isUserDropdownOpen && (
              <div 
                role="menu" 
                aria-label="User menu" 
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 py-1 z-50"
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

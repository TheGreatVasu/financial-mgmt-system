import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { LayoutDashboard, CreditCard, Users, FileText, BarChart3, UserCircle2, LogOut, Search, Settings, PlusCircle, Download, AlertCircle, Star, ChevronDown, Database, Mail, FileSpreadsheet } from 'lucide-react'
import DashboardHeader from './DashboardHeader.jsx'
import ImportModal from '../ui/ImportModal.jsx'
import { useImportContext } from '../../context/ImportContext.jsx'
import { importExcelFile } from '../../services/importService.js'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

export default function DashboardLayout({ children }) {
  const { logout, user, token } = useAuthContext()
  const navigate = useNavigate()
  const { isImportModalOpen, closeImportModal, triggerRefresh, updateQueueItemByFile } = useImportContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === '1')
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = Number(localStorage.getItem('sidebar_width'))
    return Number.isFinite(stored) && stored >= 200 && stored <= 420 ? stored : 288 // default 72*4 = 288 (~w-72)
  })
  const isDraggingRef = useRef(false)
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024))

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

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    const isMobile = viewportWidth < 768
    if (isMobile && sidebarOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [sidebarOpen, viewportWidth])

  function onDragStart(e) {
    if (collapsed) return
    if (viewportWidth < 768) return
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
    function onResize() {
      setViewportWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('mousemove', onDragMove)
      window.removeEventListener('mouseup', onDragEnd)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const computedSidebarWidth = collapsed ? 72 : sidebarWidth
  const isMobile = viewportWidth < 768
  const mainPaddingLeft = isMobile ? 0 : computedSidebarWidth

  function handleGlobalSidebarToggle() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024
    if (width < 768) {
      setSidebarOpen((s) => !s)
    } else {
      setCollapsed((v) => !v)
    }
  }

  // Import handler - available globally
  async function handleFileImport(files) {
    if (!token) {
      toast.error('Please log in to import data')
      return
    }

    setIsUploading(true)
    try {
      const filesArray = Array.isArray(files) ? files : [files]
      let totalImported = 0
      let totalErrors = 0
      const errors = []
      const validationErrors = []

      // Process files sequentially
      for (let fileIndex = 0; fileIndex < filesArray.length; fileIndex++) {
        const file = filesArray[fileIndex]
        const isLastFile = fileIndex === filesArray.length - 1
        updateQueueItemByFile(file, { status: 'uploading', progress: 10, error: null })
        
        try {
          console.log(`📤 Starting import for file: ${file.name}`, { size: file.size, type: file.type })
          const result = await importExcelFile(token, file)
          console.log(`📥 Import response received for ${file.name}:`, result)
          
          if (result?.success) {
            // Support both old and new response formats
            const importedCount = result.importedCount || result.data?.importedCount || result.data?.imported || 0
            const fileErrors = result.data?.errorCount || result.data?.errors || 0
            const errorDetails = result.data?.errorDetails || []
            const columnMapping = result.data?.columnMapping || {}
            const mergeSummary = result.data?.mergeSummary || {}
            
            console.log(`✅ Import successful for ${file.name}:`, {
              importedCount,
              fileErrors,
              matchedColumns: columnMapping.matchedCount,
              ignoredColumns: columnMapping.ignoredCount,
              mergeSummary
            })
            
            totalImported += importedCount
            totalErrors += fileErrors
            updateQueueItemByFile(file, {
              status: 'completed',
              progress: 100,
              meta: {
                importedCount,
                fileErrors
              },
              error: null
            })
            
            // Show merge summary if available
            if (mergeSummary && Object.keys(mergeSummary).length > 0) {
              const { newRecords = 0, updatedRecords = 0, deletedRecords = 0 } = mergeSummary
              if (newRecords > 0 || updatedRecords > 0 || deletedRecords > 0) {
                toast.success(
                  `${file.name}: ${newRecords} new, ${updatedRecords} updated, ${deletedRecords} deleted`,
                  { duration: 6000 }
                )
              }
            }
            
            // Show column mapping information
            if (columnMapping) {
              const matchedCount = columnMapping.matchedCount || 0
              const ignoredCount = columnMapping.ignoredCount || 0
              
              if (matchedCount > 0) {
                toast.success(
                  `${file.name}: ${matchedCount} columns matched and imported`,
                  { duration: 5000 }
                )
              }
              
              if (ignoredCount > 0) {
                const ignoredList = columnMapping.ignored?.slice(0, 5).join(', ') || ''
                const moreCount = ignoredCount > 5 ? ` and ${ignoredCount - 5} more` : ''
                toast.info(
                  `${file.name}: ${ignoredCount} columns ignored (${ignoredList}${moreCount})`,
                  { duration: 6000 }
                )
              }
              
              // Show matched columns if few enough
              if (columnMapping.matched && columnMapping.matched.length > 0 && columnMapping.matched.length <= 10) {
                const matchedList = columnMapping.matched
                  .map(m => `${m.detected} → ${m.mapped}`)
                  .slice(0, 5)
                  .join(', ')
                console.log(`Matched columns for ${file.name}:`, columnMapping.matched)
              }
            }
            
            if (fileErrors > 0) {
              errors.push(`${file.name}: ${fileErrors} errors`)
              if (errorDetails && Array.isArray(errorDetails)) {
                validationErrors.push(...errorDetails.map(e => `${file.name}: ${e}`))
              }
            }
            
            // Auto-open modal for next file if not the last file
            if (!isLastFile && filesArray.length > 1) {
              // Close modal temporarily, then reopen after a short delay
              closeImportModal()
              setTimeout(() => {
                openImportModal()
                toast.info(`Ready to import next file: ${filesArray[fileIndex + 1].name}`, { duration: 3000 })
              }, 500)
            }
          } else {
            errors.push(`${file.name}: ${result?.message || 'Import failed'}`)
            updateQueueItemByFile(file, {
              status: 'error',
              progress: 0,
              error: result?.message || 'Import failed'
            })
          }
        } catch (err) {
          console.error(`❌ Import error for ${file.name}:`, {
            error: err,
            status: err.status,
            message: err.message,
            details: err.details,
            validationErrors: err.validationErrors,
            originalError: err.originalError
          });
          
          // Handle 400 Bad Request errors with detailed validation messages
          if (err.status === 400 || err.response?.status === 400) {
            const errorData = err.originalError || err.response?.data || {}
            const errorMsg = errorData.message || err.message || 'Invalid Excel format. Please check column names and try again.'
            const errorCode = errorData.errorCode || errorData.error
            const errorDetails = errorData.details || errorData.error
            
            errors.push(`${file.name}: ${errorMsg}`)
            
            // Show detailed error information
            let fullErrorMessage = errorMsg;
            if (errorCode) {
              fullErrorMessage += ` (${errorCode})`;
            }
            if (errorDetails && errorDetails !== errorMsg) {
              fullErrorMessage += ` - ${errorDetails}`;
            }
            
            // Collect validation errors if available
            if (err.validationErrors && Array.isArray(err.validationErrors)) {
              validationErrors.push(...err.validationErrors.map(e => `${file.name}: ${e}`))
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
              validationErrors.push(...errorData.errors.map(e => {
                if (typeof e === 'object' && e.error) {
                  return `${file.name}: ${e.error}`;
                }
                return `${file.name}: ${e}`;
              }))
            } else if (errorDetails) {
              validationErrors.push(`${file.name}: ${errorDetails}`)
            }
            
            // Show main error toast with full details
            toast.error(fullErrorMessage, { duration: 8000 })
            
            // Show validation errors if any
            if (err.validationErrors && err.validationErrors.length > 0) {
              const errorList = err.validationErrors.slice(0, 5).join(', ')
              const moreCount = err.validationErrors.length > 5 ? ` and ${err.validationErrors.length - 5} more` : ''
              toast.error(`Validation errors: ${errorList}${moreCount}`, { duration: 8000 })
            } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
              const errorList = errorData.errors.slice(0, 5).map(e => typeof e === 'object' ? e.error : e).join(', ')
              const moreCount = errorData.errors.length > 5 ? ` and ${errorData.errors.length - 5} more` : ''
              toast.error(`Validation errors: ${errorList}${moreCount}`, { duration: 8000 })
            } else if (errorDetails && errorDetails !== errorMsg) {
              toast.error(`Details: ${errorDetails}`, { duration: 6000 })
            }
            
            // Log detected headers if available
            if (errorData.detectedHeaders) {
              console.log('📊 Detected headers from error:', errorData.detectedHeaders);
            }
            if (errorData.expectedColumns) {
              console.log('📊 Expected columns from error:', errorData.expectedColumns);
            }
          } else {
            errors.push(`${file.name}: ${err?.message || 'Failed to import'}`)
            toast.error(`${file.name}: ${err?.message || 'Failed to import'}`, { duration: 5000 })
          }
          updateQueueItemByFile(file, {
            status: 'error',
            progress: 0,
            error: err?.message || 'Failed to import'
          })
        }
      }

      // Show summary for successful imports
      if (errors.length === 0 || totalImported > 0) {
        if (totalErrors > 0) {
          toast.success(
            `Import completed: ${totalImported} records imported from ${filesArray.length} file(s), ${totalErrors} errors`,
            { duration: 6000 }
          )
          if (validationErrors.length > 0 && validationErrors.length <= 5) {
            validationErrors.forEach(error => toast.error(error, { duration: 5000 }))
          }
        } else {
          toast.success(`Successfully imported ${totalImported} records from ${filesArray.length} file(s)! Dashboard will refresh automatically.`)
        }
      }
      
      // Only close modal if all files are processed
      closeImportModal()
      
      // Trigger dashboard refresh without page reload
      if (totalImported > 0) {
        console.log('🔄 Triggering dashboard refresh after import...', { 
          totalImported, 
          totalErrors,
          filesProcessed: filesArray.length 
        })
        // Small delay to ensure database has committed
        setTimeout(() => {
          console.log('🔄 Calling triggerRefresh() now...')
          triggerRefresh()
        }, 1000) // Increased delay to ensure DB commit
      } else {
        console.warn('⚠️ No records imported, skipping refresh', {
          totalImported,
          totalErrors,
          errors: errors.length
        })
        if (errors.length > 0) {
          console.error('❌ Import errors:', errors)
        }
      }
    } catch (err) {
      // Fallback error handling
      const errorMsg = err?.message || 'Failed to import files'
      toast.error(errorMsg, { duration: 6000 })
      if (err?.validationErrors && Array.isArray(err.validationErrors)) {
        err.validationErrors.slice(0, 3).forEach(e => toast.error(e, { duration: 5000 }))
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-radial-vignette bg-dots bg-noise bg-aurora transition-colors duration-300">{/* App shell */}
      {/* Mobile backdrop */}
      <div 
        onClick={() => setSidebarOpen(false)} 
        className={`${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} fixed inset-0 bg-black/30 md:hidden z-40 transition-opacity duration-200`}
        aria-hidden={!sidebarOpen}
      />
      <div 
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed inset-y-0 left-0 z-50 bg-secondary-50 dark:bg-[#111827] backdrop-blur-sm border-r border-secondary-200/80 dark:border-secondary-800 shadow-[0_10px_30px_-10px_rgba(2,6,23,0.15)] transition-transform duration-200 flex flex-col`} 
        style={{ width: isMobile ? '280px' : computedSidebarWidth }} 
        data-tour="sidebar"
        aria-label="Main navigation"
      >{/* Sidebar */}
        <div className="brand flex items-center px-3 py-3 border-b border-secondary-200/70 flex-shrink-0">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            style={{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto', transition: 'opacity 200ms ease' }}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="h-8 w-8 rounded-md overflow-hidden shadow-sm flex items-center justify-center bg-white">
              {/* 
                TO USE YOUR OWN LOGO FROM GOOGLE:
                1. Go to Google Images and find your logo
                2. Right-click the image → "Copy image address"
                3. Replace the URL below with your copied URL
              */}
              <img 
                src="https://i.pinimg.com/736x/50/53/83/5053833f7cf2709dcc5dabe3249a3fd9.jpg" 
                alt="Startup Project Logo" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback: Show "SP" initials if logo fails to load
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (!parent.querySelector('.fallback-logo')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-logo h-full w-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-xs';
                    fallback.textContent = 'SP';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <span className="text-sm font-semibold tracking-wide">Startup Project</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-4 space-y-6 pb-6 min-h-0 sidebar-scroll">
          <div>
            <div className="px-3 mb-3 text-[11px] uppercase tracking-wider text-secondary-500 font-medium" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>Overview</div>
            <DashboardMenu collapsed={collapsed} />
            <SideLink to="/reports" icon={BarChart3} label="Reports" />
          </div>
          <div>
            <div className="px-3 mb-3 text-[11px] uppercase tracking-wider text-secondary-500 font-medium" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>Manage</div>
            <SideLink to="/invoices" icon={FileText} label="Invoices" actionIcon={PlusCircle} />
            <SideLink to="/payments" icon={CreditCard} label="Payments" actionIcon={Download} />
            <SideLink to="/customers" icon={Users} label="Customers" actionIcon={Star} />
            <SideLink to="/po-entry" icon={FileSpreadsheet} label="PO Entry" />
          </div>
          <div>
            <div className="px-3 mb-3 text-[11px] uppercase tracking-wider text-secondary-500 font-medium" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>System</div>
            <SideLink to="/subscription" icon={FileText} label="Subscription" />
            <SideLink to="/profile" icon={UserCircle2} label="My Profile" />
            <SideLink to="/contact" icon={Mail} label="Contact" />
            <SideLink to="/alerts" icon={AlertCircle} label="Alerts" />
            <SideLink to="/settings" icon={Settings} label="Settings" />
            {/* Only show Database and Users options for admin role */}
            {user?.role === 'admin' && (
              <>
                <SideLink to="/admin/database" icon={Database} label="Database" />
                <SideLink to="/admin/users" icon={Users} label="Users" />
              </>
            )}
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
        <div onMouseDown={onDragStart} className="hidden md:block absolute top-0 right-0 h-full w-1.5 cursor-col-resize group"><div className="absolute inset-y-0 right-0 w-0.5 bg-transparent group-hover:bg-primary-300/70 transition-colors"/></div>
      </div>

      <main className="relative z-0 transition-colors duration-300" style={{ paddingLeft: mainPaddingLeft }}>{/* Content area shifted by sidebar width */}
        {/* Header */}
        <DashboardHeader onToggleSidebar={handleGlobalSidebarToggle} />
        
        {/* Main Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {children}
        </div>
      </main>

      {/* Global Import Modal */}
      <ImportModal
        open={isImportModalOpen}
        onClose={closeImportModal}
        onImport={handleFileImport}
        isUploading={isUploading}
      />
    </div>
  )
}

function SideLink({ to, icon: Icon, label, badge, actionIcon: ActionIcon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
          isActive
            ? 'text-primary-700 bg-primary-50'
            : 'text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100'
        }`
      }
    >
      <Icon className="h-4 w-4 opacity-90 group-hover:text-secondary-900 transition-colors shrink-0" />
      <span className="flex-1 text-left min-w-0" style={{ opacity: label ? undefined : 0 }}>
        {label}
      </span>
      {badge ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 shrink-0">{badge}</span> : null}
      {ActionIcon ? (
        <span className="shrink-0">
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
    <div>
      <button
        onClick={() => { setOpen((v) => !v); navigate('/dashboard'); }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm text-secondary-700 hover:text-secondary-900 transition-colors`}
        aria-expanded={open}
        aria-controls="dashboard-submenu"
      >
        <span className="inline-flex items-center gap-3 flex-1 min-w-0">
          <LayoutDashboard className="h-4 w-4 opacity-90 transition-colors shrink-0" />
          <span className="flex-1 text-left" style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 150ms ease' }}>Dashboard</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id="dashboard-submenu"
        className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${open ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'}`}
      >
        <div className="mt-1 ml-0 mr-0 py-1 space-y-1" style={{ display: collapsed ? 'none' : undefined }}>
          <SubLink to={'/dashboard/monthly-plan'} label="Monthly Collection Plan" icon={FileText} />
          <Divider />
          <SubLink to={'/dashboard/debtors-summary'} label="Total Debtors Summary" icon={CreditCard} />
          <Divider />
          <SubLink to={'/dashboard/boq-actual'} label="BOQ vs Actual Supplies" icon={FileText} />
          <Divider />
          <SubLink to={'/dashboard/performance'} label="Performance" icon={Star} />
          <Divider />
          <SubLink to={'/dashboard/others'} label="Others" icon={Users} />
        </div>
      </div>
    </div>
  )
}

function SubLink({ to, label, icon: Icon }) {
  // Use plain Link to avoid automatic active (blue) styling when hash matches
  return (
    <NavLink to={to} className={() => `group flex items-center gap-2 px-3 py-2 text-sm text-secondary-700 hover:text-secondary-900`} end>
      <Icon className="h-3.5 w-3.5 opacity-80 group-hover:text-secondary-900 transition-colors" />
      <span>{label}</span>
    </NavLink>
  )
}

function Divider() {
  return <div className="h-px bg-secondary-200/60 mx-3" />
}



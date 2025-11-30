import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer, variant = 'dialog', size = 'md' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  }
  
  // Professional modal widths - narrower for better visibility
  const maxWidths = {
    sm: 'min(60vw, 480px)',
    md: 'min(55vw, 600px)',
    lg: 'min(50vw, 900px)',
  }

  return (
    <div 
      className="fixed inset-0 z-[99999]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
      }}
    >
      {/* Backdrop with full viewport blur - covers entire screen */}
      <div
        className="fixed inset-0 transition-opacity duration-200"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1,
        }}
        onClick={onClose}
      />
      
      {/* Modal container - centered with flex, above backdrop */}
      {/* Shifted right to account for sidebar, centered in available space */}
      <div 
        className="fixed inset-0 flex items-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          paddingLeft: 'clamp(320px, 25vw, 400px)', // Account for sidebar width (typically 288px-420px)
          paddingRight: 'clamp(2rem, 5vw, 3rem)',
        }}
      >
        {variant === 'drawer' ? (
          <div 
            className="w-full max-w-xl bg-white dark:bg-[#0B1220] shadow-xl border-l border-secondary-200 dark:border-secondary-800 animate-in slide-in-from-right duration-200"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-200 dark:border-secondary-800">
              <h3 className="text-base font-semibold">{title}</h3>
              <button className="text-secondary-500 hover:text-secondary-700" onClick={onClose}>✕</button>
            </div>
            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px - 64px)' }}>
              {children}
            </div>
            <div className="px-5 py-4 border-t border-secondary-200 dark:border-secondary-800 flex items-center justify-end gap-2">
              {footer}
            </div>
          </div>
        ) : (
          <div 
            role="dialog" 
            aria-modal="true" 
            onClick={(e) => e.stopPropagation()}
            className={`${sizes[size]} bg-white dark:bg-[#0B1220] shadow-[0_20px_60px_-10px_rgba(2,6,23,0.35)] rounded-2xl border border-secondary-200/80 dark:border-secondary-800/80 animate-in fade-in-0 zoom-in-95 transition-transform duration-200`}
            style={{ 
              pointerEvents: 'auto', 
              marginLeft: 'auto', 
              marginRight: 'auto',
              maxWidth: maxWidths[size],
              width: '100%',
              minWidth: '400px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-200 dark:border-secondary-800 rounded-t-xl">
              <h3 className="text-base font-semibold">{title}</h3>
              <button className="text-secondary-500 hover:text-secondary-700" onClick={onClose}>✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {children}
            </div>
            <div className="px-6 py-5 border-t border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/30 rounded-b-xl flex items-center justify-end gap-2">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

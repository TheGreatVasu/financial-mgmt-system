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

  return (
    <div 
      className="fixed inset-0 z-[9999]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
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
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
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
            className={`w-[92vw] ${sizes[size]} bg-white dark:bg-[#0B1220] shadow-[0_20px_60px_-10px_rgba(2,6,23,0.35)] rounded-2xl border border-secondary-200/80 dark:border-secondary-800/80 animate-in fade-in-0 zoom-in-95 transition-transform duration-200`}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-200 dark:border-secondary-800 rounded-t-xl">
              <h3 className="text-base font-semibold">{title}</h3>
              <button className="text-secondary-500 hover:text-secondary-700" onClick={onClose}>✕</button>
            </div>
            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 56px - 64px)' }}>
              {children}
            </div>
            <div className="px-5 py-4 border-t border-secondary-200 dark:border-secondary-800 flex items-center justify-end gap-2 rounded-b-xl">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

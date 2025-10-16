import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer, variant = 'dialog', size = 'md' }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background: 'transparent',
          pointerEvents: 'none'
        }}
      />
      {variant === 'drawer' ? (
        <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-[#0B1220] shadow-xl border-l border-secondary-200 dark:border-secondary-800 animate-in slide-in-from-right duration-200">
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
        <div role="dialog" aria-modal="true" className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] ${sizes[size]} bg-white dark:bg-[#0B1220] shadow-[0_20px_60px_-10px_rgba(2,6,23,0.35)] rounded-2xl border border-secondary-200/80 dark:border-secondary-800/80 animate-in fade-in-0 zoom-in-95 transition-transform duration-200`}>
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
  )
}



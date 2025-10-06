import React from 'react'

const ToastContext = React.createContext({ add: () => {} })

export function useToast() {
  return React.useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  function add(message, type = 'info', duration = 3000) {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, duration)
  }

  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded-md shadow-soft text-sm ${t.type === 'success' ? 'bg-success-600 text-white' : t.type === 'error' ? 'bg-danger-600 text-white' : 'bg-secondary-900 text-white'}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}



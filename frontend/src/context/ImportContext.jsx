import { createContext, useContext, useState, useCallback } from 'react'

const ImportContext = createContext(null)

export function ImportProvider({ children }) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const openImportModal = () => setIsImportModalOpen(true)
  const closeImportModal = () => setIsImportModalOpen(false)
  
  // Trigger dashboard refresh after successful import
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  return (
    <ImportContext.Provider value={{ 
      isImportModalOpen, 
      openImportModal, 
      closeImportModal,
      refreshTrigger,
      triggerRefresh
    }}>
      {children}
    </ImportContext.Provider>
  )
}

export function useImportContext() {
  const context = useContext(ImportContext)
  if (!context) {
    throw new Error('useImportContext must be used within ImportProvider')
  }
  return context
}


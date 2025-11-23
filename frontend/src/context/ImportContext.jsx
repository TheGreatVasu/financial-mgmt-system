import { createContext, useContext, useState, useCallback } from 'react'

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `upload-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

const buildSignature = (file) => {
  if (!file) return generateId()
  return `${file.name || 'file'}-${file.size || 0}-${file.lastModified || 0}`
}

const createQueueItem = (file) => ({
  id: generateId(),
  signature: buildSignature(file),
  file,
  name: file?.name || 'Untitled file',
  displayName: file?.name || 'Untitled file',
  size: file?.size || 0,
  type: file?.type || 'application/octet-stream',
  lastModified: file?.lastModified || Date.now(),
  status: 'pending', // pending | uploading | completed | error
  progress: 0,
  error: null
})

const ImportContext = createContext(null)

export function ImportProvider({ children }) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [uploadQueue, setUploadQueue] = useState([])

  const openImportModal = () => setIsImportModalOpen(true)
  const closeImportModal = () => setIsImportModalOpen(false)
  
  // Trigger dashboard refresh after successful import
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const addFilesToQueue = useCallback((files) => {
    if (!files || files.length === 0) return
    setUploadQueue(prev => {
      const existingSignatures = new Set(prev.map(item => item.signature))
      const additions = Array.from(files)
        .filter(Boolean)
        .map((file) => {
          const signature = buildSignature(file)
          if (existingSignatures.has(signature)) {
            return null
          }
          return createQueueItem(file)
        })
        .filter(Boolean)
      return additions.length ? [...prev, ...additions] : prev
    })
  }, [])

  const removeFileFromQueue = useCallback((signature) => {
    if (!signature) return
    setUploadQueue(prev => prev.filter(item => item.signature !== signature))
  }, [])

  const clearUploadQueue = useCallback(() => {
    setUploadQueue([])
  }, [])

  const updateQueueItem = useCallback((signature, updates) => {
    if (!signature) return
    setUploadQueue(prev =>
      prev.map(item =>
        item.signature === signature
          ? { ...item, ...updates }
          : item
      )
    )
  }, [])

  const updateQueueItemByFile = useCallback((file, updates) => {
    if (!file) return
    const signature = buildSignature(file)
    updateQueueItem(signature, updates)
  }, [updateQueueItem])

  const renameQueueItem = useCallback((id, newName) => {
    if (!id) return
    setUploadQueue(prev =>
      prev.map(item =>
        item.id === id ? { ...item, displayName: newName || item.displayName } : item
      )
    )
  }, [])

  return (
    <ImportContext.Provider value={{ 
      isImportModalOpen, 
      openImportModal, 
      closeImportModal,
      refreshTrigger,
      triggerRefresh,
      uploadQueue,
      addFilesToQueue,
      removeFileFromQueue,
      clearUploadQueue,
      updateQueueItem,
      updateQueueItemByFile,
      renameQueueItem
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


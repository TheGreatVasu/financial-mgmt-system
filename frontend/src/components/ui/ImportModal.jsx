import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Download, AlertTriangle, Trash2 } from 'lucide-react'
import Modal from './Modal.jsx'
import { useImportContext } from '../../context/ImportContext.jsx'

const signatureFromFile = (file) => {
  if (!file) return ''
  return `${file.name || 'file'}-${file.size || 0}-${file.lastModified || 0}`
}

export default function ImportModal({ open, onClose, onImport, isUploading = false }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const fileInputRef = useRef(null)
  const { uploadQueue, addFilesToQueue, removeFileFromQueue } = useImportContext()

  const pendingItems = uploadQueue.filter(item => item.status === 'pending' || item.status === 'error')
  const selectedFiles = pendingItems.map(item => item.file)

  const validateFile = (file) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv' // .csv alternative
    ]
    const validExtensions = ['.xlsx', '.xls', '.csv']
    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!isValidType) {
      return { valid: false, error: 'Please select a valid file (.xlsx, .xls, or .csv)' }
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }

    return { valid: true }
  }

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragging(false)
      }
      return newCounter
    })
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragCounter(0)

    const files = Array.from(e.dataTransfer.files)
    if (files && files.length > 0) {
      handleFilesSelect(files)
    }
  }, [])

  const handleFilesSelect = (files) => {
    const validFiles = []
    const errors = []

    Array.from(files).forEach((file) => {
      const validation = validateFile(file)
      if (validation.valid) {
        // Check if file already exists
        const signature = signatureFromFile(file)
        const exists = uploadQueue.some(item => item.signature === signature)
        if (!exists) {
          validFiles.push(file)
        }
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      addFilesToQueue(validFiles)
    }
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelect(Array.from(files))
    }
    // Reset input to allow selecting same files again
    e.target.value = ''
  }

  const handleRemoveFile = (index) => {
    const item = pendingItems[index]
    if (item) {
      removeFileFromQueue(item.signature)
    }
  }

  const handleRemoveAllFiles = () => {
    pendingItems.forEach(item => removeFileFromQueue(item.signature))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownloadSample = () => {
    // Download from static path
    const link = document.createElement('a')
    link.href = '/sample-files/import-template.xlsx'
    link.download = 'import-template.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = () => {
    if (pendingItems.length > 0 && onImport) {
      onImport(pendingItems.map(item => item.file))
    }
  }

  const handleClose = () => {
    setDragCounter(0)
    setIsDragging(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Data"
      variant="dialog"
      size="md"
      footer={(
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 
                       border border-secondary-300 dark:border-secondary-700 
                       bg-white dark:bg-secondary-800 
                       text-secondary-700 dark:text-secondary-300 
                       hover:bg-secondary-50 dark:hover:bg-secondary-700 
                       hover:border-secondary-400 dark:hover:border-secondary-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex-1 sm:flex-initial"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 
                       bg-gradient-to-r from-primary-600 to-primary-700 
                       text-white shadow-lg shadow-primary-500/30
                       hover:from-primary-700 hover:to-primary-800 
                       hover:shadow-xl hover:shadow-primary-500/40
                       active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       inline-flex items-center justify-center gap-2
                       flex-1 sm:flex-initial"
            onClick={handleImport}
            disabled={pendingItems.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Import {pendingItems.length > 0 ? `(${pendingItems.length})` : ''}</span>
              </>
            )}
          </button>
        </div>
      )}
    >
      <div className="space-y-6">
        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 sm:p-12
            transition-all duration-200 cursor-pointer
            ${isDragging 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]' 
              : pendingItems.length > 0
              ? 'border-primary-300 bg-primary-50/50 dark:bg-primary-900/10'
              : 'border-secondary-300 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-900/30 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/csv"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {pendingItems.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <File className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
                  {pendingItems.length} file{pendingItems.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  {formatFileSize(pendingItems.reduce((sum, item) => sum + (item.size || 0), 0))} total
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveAllFiles()
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`
                h-16 w-16 rounded-full flex items-center justify-center transition-colors
                ${isDragging 
                  ? 'bg-primary-200 dark:bg-primary-800' 
                  : 'bg-secondary-200 dark:bg-secondary-700'
                }
              `}>
                <Upload className={`h-8 w-8 ${isDragging ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-600 dark:text-secondary-400'}`} />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-secondary-900 dark:text-secondary-100 mb-1">
                  Drag & drop your files here
                </p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  or <span className="text-primary-600 dark:text-primary-400 font-medium">click to browse</span>
                </p>
                <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-2">
                  Multiple files supported
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Files List */}
        {pendingItems.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-900/30 border border-secondary-200 dark:border-secondary-800 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-900/50 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <File className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
                    {item.displayName}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    {formatFileSize(item.size)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="flex-shrink-0 p-1.5 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File Format Info */}
        <div className="bg-secondary-50 dark:bg-secondary-900/30 border border-secondary-200 dark:border-secondary-800 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-secondary-700 dark:text-secondary-300">Supported formats:</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded text-xs font-medium border border-secondary-200 dark:border-secondary-700">
                  .xlsx
                </span>
                <span className="px-2 py-0.5 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded text-xs font-medium border border-secondary-200 dark:border-secondary-700">
                  .xls
                </span>
                <span className="px-2 py-0.5 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded text-xs font-medium border border-secondary-200 dark:border-secondary-700">
                  .csv
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
              <span>•</span>
              <span>Maximum file size: <strong className="text-secondary-900 dark:text-secondary-100">10MB</strong> per file</span>
            </div>
          </div>
        </div>

        {/* Download Sample Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-1">
              Need a sample file?
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-300">
              Download our template to see the exact format required
            </p>
          </div>
          <button
            onClick={handleDownloadSample}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
                       bg-gradient-to-r from-primary-600 to-primary-700 
                       text-white shadow-md shadow-primary-500/20
                       hover:from-primary-700 hover:to-primary-800 
                       hover:shadow-lg hover:shadow-primary-500/30
                       active:scale-[0.98]
                       inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            Download Sample
          </button>
        </div>

        {/* Warning Note */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong className="font-medium">Important:</strong> Data must follow the sample file format. Incorrect formatting may cause import failure.
          </p>
        </div>
      </div>
    </Modal>
  )
}

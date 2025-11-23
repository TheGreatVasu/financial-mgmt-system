import { useMemo, useState } from 'react'
import {
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Edit2,
  Save,
  X
} from 'lucide-react'
import { useImportContext } from '../../context/ImportContext.jsx'

const statusMap = {
  pending: { label: 'Pending', color: 'text-secondary-600 bg-secondary-100' },
  uploading: { label: 'Uploading', color: 'text-primary-700 bg-primary-100' },
  completed: { label: 'Completed', color: 'text-emerald-700 bg-emerald-100' },
  error: { label: 'Error', color: 'text-rose-700 bg-rose-100' }
}

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadQueueButton() {
  const {
    uploadQueue,
    removeFileFromQueue,
    renameQueueItem
  } = useImportContext()
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [tempName, setTempName] = useState('')

  const uploadingCount = useMemo(
    () => uploadQueue.filter(item => item.status === 'uploading').length,
    [uploadQueue]
  )

  const handleDownload = (item) => {
    if (!item?.file) return
    const url = URL.createObjectURL(item.file)
    const link = document.createElement('a')
    link.href = url
    link.download = item.displayName || item.name || 'import-file'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const startEditing = (item) => {
    setEditingId(item.id)
    setTempName(item.displayName || item.name)
  }

  const saveEditing = () => {
    if (editingId) {
      renameQueueItem(editingId, tempName?.trim() ? tempName.trim() : undefined)
      setEditingId(null)
      setTempName('')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setPanelOpen(prev => !prev)}
        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-slate-900/80 to-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span className="hidden xs:inline">Uploads</span>
        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px]">
          {uploadQueue.length}
        </span>
      </button>

      {panelOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-secondary-200/70 bg-white dark:bg-[#0f172a] shadow-2xl shadow-secondary-500/20 dark:shadow-black/50 p-4 z-50">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-semibold text-secondary-900 dark:text-white">File Upload Queue</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                {uploadingCount > 0 ? `${uploadingCount} file${uploadingCount > 1 ? 's' : ''} uploading` : 'No uploads in progress'}
              </p>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1.5 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-500"
              aria-label="Close upload panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mr-1">
            {uploadQueue.length === 0 ? (
              <div className="text-sm text-secondary-500 dark:text-secondary-400 text-center py-6">
                No files in queue. Use Import Data to add files.
              </div>
            ) : (
              uploadQueue.map(item => {
                const badge = statusMap[item.status] || statusMap.pending
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-secondary-100 dark:border-secondary-800 bg-secondary-50/60 dark:bg-secondary-900/30 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {editingId === item.id ? (
                          <input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="w-full rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 px-2 py-1 text-sm text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                            {item.displayName}
                          </p>
                        )}
                        <p className="text-[11px] text-secondary-500 dark:text-secondary-400">
                          {formatSize(item.size)}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {item.error && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-2 py-1.5 space-y-1">
                        <p className="font-semibold">{item.error}</p>
                        {item.meta?.errorDetails && item.meta.errorDetails.length > 0 && (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-[10px] hover:text-rose-700 dark:hover:text-rose-300">
                              View {item.meta.errorDetails.length} error detail{item.meta.errorDetails.length > 1 ? 's' : ''}
                            </summary>
                            <ul className="mt-1 space-y-0.5 pl-2 list-disc list-inside text-[10px] max-h-32 overflow-y-auto">
                              {item.meta.errorDetails.map((err, idx) => (
                                <li key={idx} className="break-words">{err}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-secondary-600 dark:text-secondary-400">
                      <div className="flex items-center gap-1.5">
                        {item.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />}
                        {item.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {item.status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        <span>
                          {item.status === 'uploading'
                            ? 'Uploading...'
                            : item.status === 'completed'
                              ? item.meta?.importedCount > 0
                                ? 'Uploaded successfully'
                                : 'Completed with errors'
                              : item.status === 'error'
                                ? 'Import failed'
                                : 'Ready to upload'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.meta?.importedCount != null && item.meta.importedCount > 0 && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                            {item.meta.importedCount} imported
                          </span>
                        )}
                        {item.meta?.errorCount != null && item.meta.errorCount > 0 && (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400">
                            {item.meta.errorCount} error{item.meta.errorCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {item.meta?.importedCount === 0 && item.meta?.errorCount === 0 && (
                          <span className="text-[11px] text-secondary-500 dark:text-secondary-400">
                            No data imported
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-secondary-200 dark:border-secondary-700 px-2 py-1 text-xs hover:bg-secondary-100 dark:hover:bg-secondary-800/60"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                      {editingId === item.id ? (
                        <button
                          onClick={saveEditing}
                          className="px-2 py-1 rounded-lg bg-primary-600 text-white text-xs inline-flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditing(item)}
                          className="px-2 py-1 rounded-lg border border-secondary-200 dark:border-secondary-700 text-xs inline-flex items-center gap-1 hover:bg-secondary-100 dark:hover:bg-secondary-800/60"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}


import { useState } from 'react'
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { importExcelFile, downloadTemplate } from '../../services/importService'
import toast from 'react-hot-toast'

export default function ExcelImportOnboarding({ onImportComplete }) {
  const { token } = useAuthContext()
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [file, setFile] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
      const isValidType = validTypes.includes(selectedFile.type) || 
                         selectedFile.name.endsWith('.xlsx') || 
                         selectedFile.name.endsWith('.xls')

      if (!isValidType) {
        toast.error('Please select a valid Excel file (.xlsx or .xls)')
        return
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      setFile(selectedFile)
    }
  }

  const handleDownloadTemplate = async () => {
    setIsDownloading(true)
    try {
      await downloadTemplate(token)
      toast.success('Template downloaded successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to download template')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)
    try {
      const result = await importExcelFile(token, file)
      
      if (result.success) {
        const { customers, invoices, payments } = result.data
        
        // Show success message with summary
        const totalImported = customers.imported + invoices.imported + payments.imported
        const totalErrors = customers.errors + invoices.errors + payments.errors
        
        if (totalErrors > 0) {
          toast.success(
            `Import completed with ${totalImported} records imported and ${totalErrors} errors. Check details in console.`,
            { duration: 5000 }
          )
        } else {
          toast.success(
            `Successfully imported ${customers.imported} customers, ${invoices.imported} invoices, and ${payments.imported} payments!`,
            { duration: 5000 }
          )
        }

        // Log detailed results
        console.log('Import Results:', result.data)

        // Reset file and trigger dashboard refresh
        setFile(null)
        if (onImportComplete) {
          onImportComplete()
        }
      } else {
        toast.error(result.message || 'Import failed')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to import Excel file')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary-300 bg-gradient-to-br from-primary-50 to-primary-100/50 p-8 md:p-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary-500/10 flex items-center justify-center">
            <FileSpreadsheet className="h-10 w-10 text-primary-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-3">
          Import Your Excel Data to Get Started
        </h2>

        {/* Description */}
        <p className="text-secondary-600 mb-8 text-base md:text-lg">
          Upload your financial data in Excel format to sync your dashboard. The file should include three sheets: 
          <span className="font-semibold text-secondary-800"> Customers</span>, 
          <span className="font-semibold text-secondary-800"> Invoices</span>, and 
          <span className="font-semibold text-secondary-800"> Payments</span>.
        </p>

        {/* File Upload Section */}
        <div className="bg-white rounded-xl border border-primary-200 p-6 mb-6">
          <div className="mb-4">
            <label
              htmlFor="excel-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Upload className="h-5 w-5" />
              {file ? 'Change File' : 'Upload Excel File'}
            </label>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {file && (
            <div className="mt-4 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-secondary-900">{file.name}</p>
                  <p className="text-sm text-secondary-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-secondary-500 hover:text-secondary-700"
                  disabled={isUploading}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Import Data
              </>
            )}
          </button>
        </div>

        {/* Download Template Link */}
        <div className="flex items-center justify-center gap-2 text-sm text-secondary-600">
          <span>Need a template?</span>
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Sample Format
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-left bg-white rounded-xl border border-primary-200 p-6">
          <h3 className="font-semibold text-secondary-900 mb-4">File Format Requirements:</h3>
          <ul className="space-y-2 text-sm text-secondary-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span><strong>Customers Sheet:</strong> Customer Code, Company Name, Contact Email, Contact Phone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span><strong>Invoices Sheet:</strong> Invoice Number, Customer Code, Amount, Issue Date, Due Date, Status</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span><strong>Payments Sheet:</strong> Payment Code, Invoice Number, Amount, Payment Date, Payment Method</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}


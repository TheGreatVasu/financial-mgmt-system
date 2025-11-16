import { createApiClient } from './apiClient'

export async function importExcelFile(token, file) {
  const api = createApiClient(token)
  const formData = new FormData()
  formData.append('file', file)

  try {
    // Always try sales invoice import first (93 columns format)
    // This will parse any valid Excel file with the expected 93 columns regardless of filename
    // Note: Don't set Content-Type header - let browser set it automatically with boundary for FormData
    const { data } = await api.post('/import/sales-invoice', formData)
    return data
  } catch (error) {
    // If sales invoice import fails, provide clear error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to import Excel file'
    const errorDetails = error.response?.data?.details || error.response?.data?.error
    throw new Error(errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage)
  }
}

export async function downloadTemplate(token) {
  const base = import.meta?.env?.VITE_API_BASE_URL?.trim() || '/api'
  const apiUrl = base.replace(/\/$/, '')
  
  try {
    const response = await fetch(`${apiUrl}/import/template`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to download template')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'import_format.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error('Failed to download template file')
  }
}


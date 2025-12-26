import { createApiClient } from './apiClient'

export async function importExcelFile(token, file) {
  console.log('📤 importExcelFile called:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    hasToken: !!token
  });
  
  const api = createApiClient(token)
  const formData = new FormData()
  formData.append('file', file)

  try {
    // Always try sales invoice import first (93 columns format)
    // This will parse any valid Excel file with the expected 93 columns regardless of filename
    // Note: Don't set Content-Type header - let browser set it automatically with boundary for FormData
    console.log('📤 Sending POST request to /import/sales-invoice...');
    const { data } = await api.post('/import/sales-invoice', formData)
    console.log('✅ Import response received:', data);
    return data
  } catch (error) {
    console.error('❌ Import error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    // Handle 400 Bad Request errors with detailed validation messages
    if (error.response?.status === 400) {
      const errorData = error.response?.data || {}
      const errorMessage = errorData.message || 'Invalid Excel format'
      const errorDetails = errorData.error || errorData.details || errorData.errorCode
      const validationErrors = errorData.errors || []
      
      // Create a structured error object for better handling
      const structuredError = new Error(errorMessage)
      structuredError.status = 400
      structuredError.errorCode = errorData.errorCode || 'VALIDATION_ERROR'
      structuredError.details = errorDetails
      structuredError.validationErrors = validationErrors
      structuredError.originalError = errorData
      
      throw structuredError
    }
    
    // For other errors, provide clear error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to import Excel file'
    const errorDetails = error.response?.data?.details || error.response?.data?.error
    const structuredError = new Error(errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage)
    structuredError.status = error.response?.status || 500
    structuredError.originalError = error.response?.data
    throw structuredError
  }
}

export async function downloadTemplate(token) {
  // Use the same logic as apiClient to ensure consistency
  const envBaseUrl = import.meta?.env?.VITE_API_BASE_URL
  let baseURL = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl.trim() : '/api'
  
  // Ensure baseURL always ends with /api for production
  if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
    if (!baseURL.endsWith('/api')) {
      baseURL = baseURL.replace(/\/$/, '') + '/api'
    }
  }
  
  const apiUrl = baseURL.replace(/\/$/, '')
  
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


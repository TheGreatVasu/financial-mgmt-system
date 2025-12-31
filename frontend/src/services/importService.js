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

/**
 * Gets the API base URL from environment variables.
 * Validates lazily and logs warnings instead of throwing at module scope.
 * @returns {string|undefined} The API base URL or undefined if not set
 */
function getApiBaseUrl() {
  const baseURL = typeof import.meta?.env?.VITE_API_BASE_URL === 'string' 
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '') 
    : undefined;
  
  if (!baseURL && import.meta.env.DEV) {
    console.warn('⚠️  VITE_API_BASE_URL is not set. Template download will likely fail.');
  }
  if (!baseURL) {
    return undefined;
  }
  
  return baseURL;
}

export async function downloadTemplate(token) {
  // Lazy validation - only throws when function is actually called
  const baseURL = getApiBaseUrl();
  if (!baseURL) {
    throw new Error('VITE_API_BASE_URL must be set (non-empty string) to download templates. Check your environment variables and rebuild the application.');
  }

  const url = `${baseURL}/import/template`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to download template')
    }

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = 'import_format.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    // Provide more context in error message
    if (error.message.includes('VITE_API_BASE_URL')) {
      throw error; // Re-throw validation errors as-is
    }
    throw new Error(`Failed to download template file: ${error.message || 'Unknown error'}`)
  }
}


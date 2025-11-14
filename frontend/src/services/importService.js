import { createApiClient } from './apiClient'

export async function importExcelFile(token, file) {
  const api = createApiClient(token)
  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await api.post('/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to import Excel file')
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


import { createApiClient } from './apiClient'

export async function importSalesInvoiceFile(token, file) {
  const api = createApiClient(token)
  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await api.post('/import/sales-invoice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to import sales invoice file')
  }
}

export async function getSalesInvoiceDashboard(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get('/dashboard/sales-invoice')
    return data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sales invoice dashboard data')
  }
}


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

export async function getSalesInvoiceDashboard(token, filters = {}) {
  const api = createApiClient(token)
  try {
    // Build query parameters from filters
    const params = new URLSearchParams()
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    if (filters.customer) params.append('customer', filters.customer)
    if (filters.businessUnit) params.append('businessUnit', filters.businessUnit)
    if (filters.region) params.append('region', filters.region)
    if (filters.zone) params.append('zone', filters.zone)
    if (filters.invoiceType) params.append('invoiceType', filters.invoiceType)
    if (filters.amountMin !== undefined && filters.amountMin !== null) {
      params.append('amountMin', filters.amountMin.toString())
    }
    if (filters.amountMax !== undefined && filters.amountMax !== null) {
      params.append('amountMax', filters.amountMax.toString())
    }
    if (filters.taxTypes && Array.isArray(filters.taxTypes) && filters.taxTypes.length > 0) {
      params.append('taxTypes', filters.taxTypes.join(','))
    }

    const queryString = params.toString()
    const url = `/dashboard/sales-invoice${queryString ? `?${queryString}` : ''}`
    
    const { data } = await api.get(url)
    return data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sales invoice dashboard data')
  }
}


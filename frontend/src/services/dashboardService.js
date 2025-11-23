import { createApiClient } from './apiClient'

export async function fetchDashboard(token, params = {}) {
  const api = createApiClient(token)
  try {
    const response = await api.get('/dashboard', { params })
    console.log('📊 Dashboard API response:', response)
    const { data } = response
    if (!data?.success) {
      console.error('❌ Dashboard API error:', data?.message)
      throw new Error(data?.message || 'Failed to load dashboard')
    }
    
    // Ensure we have the correct data structure
    const dashboardData = data.data || {}
    console.log('📊 Dashboard data structure:', {
      hasKpis: !!dashboardData.kpis,
      hasSeries: !!dashboardData.series,
      kpis: dashboardData.kpis,
      series: dashboardData.series
    })
    
    return { 
      ...dashboardData, 
      hasData: data.hasData !== false 
    }
  } catch (e) {
    console.error('❌ Dashboard fetch error:', e)
    // Return empty data on error
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return {
      hasData: false,
      kpis: {
        customers: 0,
        invoices: 0,
        outstanding: 0,
        overdue: 0,
        collectedThisMonth: 0,
        dso: 0,
        cei: 0,
      },
      series: {
        collections: Array(12).fill(0),
        invoices: Array(12).fill(0),
        labels: labels,
        agingBuckets: [
          { label: '0-30', value: 0 },
          { label: '31-60', value: 0 },
          { label: '61-90', value: 0 },
          { label: '90+', value: 0 },
        ],
      },
      recentInvoices: [],
      alerts: [],
      actionItems: {
        dueToday: 0,
        needsAttention: 0,
        brokenPromises: 0,
        autopayInfo: 0,
        approvalsPending: 0,
      },
      topCustomers: [],
    }
  }
}



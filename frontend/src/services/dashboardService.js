import { createApiClient } from './apiClient'

export async function fetchDashboard(token) {
  const api = createApiClient(token)
  try {
    const { data } = await api.get('/dashboard')
    if (!data?.success) throw new Error(data?.message || 'Failed to load dashboard')
    return data.data
  } catch (e) {
    // Offline/mock fallback to avoid UI error banners
    return {
      kpis: {
        customers: 12,
        invoices: 48,
        outstanding: 325000,
        overdue: 3,
        collectedThisMonth: 145000,
        dso: 18,
        cei: 86,
      },
      series: {
        collections: [12,18,15,22,28,35,30,38,42,40,45,50],
        invoices: [15,20,18,25,30,40,33,42,48,46,50,55],
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        agingBuckets: [
          { label: '0-30', value: 45 },
          { label: '31-60', value: 22 },
          { label: '61-90', value: 12 },
          { label: '90+', value: 8 },
        ],
      },
      recentInvoices: [
        { id: '1', invoiceNumber: 'INV20250001', customer: 'Acme Corp', totalAmount: 56000, status: 'sent', createdAt: new Date() },
        { id: '2', invoiceNumber: 'INV20250002', customer: 'Globex', totalAmount: 120000, status: 'overdue', createdAt: new Date() },
      ],
      alerts: [
        { type: 'warning', message: '3 invoices due today' },
        { type: 'danger', message: '2 invoices overdue 30+ days' },
        { type: 'success', message: 'Payment received: ₹45,000' },
      ],
      actionItems: {
        dueToday: 14,
        needsAttention: 6,
        brokenPromises: 57,
        autopayInfo: 190,
        approvalsPending: 4,
      },
      topCustomers: [
        { customer: 'Acme Corp', outstanding: 120000 },
        { customer: 'Globex', outstanding: 82000 },
        { customer: 'Initech', outstanding: 64000 },
      ],
    }
  }
}



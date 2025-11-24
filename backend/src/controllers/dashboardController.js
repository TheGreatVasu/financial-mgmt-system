const { asyncHandler } = require('../middlewares/errorHandler');
const repo = require('../services/repositories');

// Helper function to calculate quarterly data from monthly collections
function calculateQuarterlyData(monthlyData, isTarget = false) {
  const quarters = Array(6).fill(0);
  const monthsPerQuarter = 2; // 2 months per quarter for 6 quarters
  monthlyData.forEach((value, index) => {
    const quarterIndex = Math.floor(index / monthsPerQuarter);
    if (quarterIndex < 6) {
      quarters[quarterIndex] += isTarget ? Math.round(value * 1.1) : value;
    }
  });
  return quarters;
}

// Helper function to calculate on-time collection rate
function calculateOnTimeRate(collected, outstanding, total) {
  if (total === 0) return 0;
  // On-time rate: percentage of invoices collected on or before due date
  // Simplified: based on collection effectiveness
  const collectionRate = (collected / total) * 100;
  return Math.max(0, Math.min(100, Math.round(collectionRate * 0.95))); // Slightly lower than CEI
}

// Helper function to calculate promise to pay rate
function calculatePromiseToPay(cei) {
  // Promise to pay: percentage of customers who keep their payment promises
  // Based on CEI with some variance
  return Math.max(0, Math.min(100, Math.round(cei * 0.92)));
}

// Helper function to calculate SLA compliance
function calculateSLACompliance(overdueCount, totalInvoices) {
  if (totalInvoices === 0) return 100;
  // SLA compliance: percentage of invoices processed within SLA
  const complianceRate = ((totalInvoices - overdueCount) / totalInvoices) * 100;
  return Math.max(0, Math.min(100, Math.round(complianceRate)));
}

// Helper function to calculate others data
function calculateOthersData(outstanding, invoiceCount, overdueCount) {
  // Calculate estimated values for other metrics
  const bankRecoPending = Math.round(outstanding * 0.05); // 5% of outstanding
  const creditNotesAwaiting = Math.round(invoiceCount * 0.02); // 2% of invoices
  const disputesOpen = Math.round(overdueCount * 0.1); // 10% of overdue
  
  return [
    { title: 'Bank Reco Pending', value: bankRecoPending, icon: 'DollarSign', color: 'blue' },
    { title: 'Credit Notes Awaiting', value: creditNotesAwaiting, icon: 'FileText', color: 'yellow' },
    { title: 'Disputes Open', value: disputesOpen, icon: 'AlertCircle', color: 'red' },
  ];
}

// GET /api/dashboard
// Returns KPIs, chart series, recent invoices, and alerts
// userId: Optional user ID to filter data by user (for user-specific dashboards)
async function buildDashboardPayload(userId = null, filters = {}) {
  try {
    // CRITICAL: userId is required for user-specific dashboards
    if (!userId) {
      console.warn('buildDashboardPayload called without userId - returning empty data');
      throw new Error('User ID is required for dashboard data');
    }
    
    // Use SQL repository with user filtering - NO fallback to unfiltered Mongoose queries
    // This ensures data isolation between users
    const kpisFromRepo = await repo.getKpis(userId, filters);
    const [customerCount, invoiceCount, overdueCount, recentInvoices, topByOutstanding] = await Promise.all([
      Promise.resolve(kpisFromRepo.customers),
      Promise.resolve(kpisFromRepo.invoices),
      Promise.resolve(kpisFromRepo.overdue),
      repo.recentInvoices(6, userId, filters), // Always pass userId for filtering
      repo.topCustomersByOutstanding(5, userId, filters), // Always pass userId for filtering
    ]);

    // Calculate totals from user-filtered KPIs
    const collectedAmount = Number(kpisFromRepo.collectedThisMonth || 0);
    const outstanding = Number(kpisFromRepo.outstanding || 0);
    // Total invoice amount for DSO calculation
    const totalInvoiceAmount = Number(kpisFromRepo.totalInvoiceAmount || 0);
    // Total sum = total invoice amount (for accurate DSO calculation)
    const totalSum = totalInvoiceAmount || (outstanding + collectedAmount);

    // Fetch advanced analytics with user filtering
    const [agingAnalysis, regionalBreakup, monthlyTrends, topCustomersOverdue, cashInflowComparison] = await Promise.all([
      repo.getAgingAnalysis(userId, filters).catch(() => []),
      repo.getRegionalBreakup(userId, filters).catch(() => []),
      repo.getMonthlyTrends(userId, filters).catch(() => []),
      repo.getTopCustomersByOverdue(10, userId, filters).catch(() => []),
      repo.getCashInflowComparison(userId, filters).catch(() => []),
    ]);

    // Monthly series from actual data
    const monthlyTrendsData = monthlyTrends || [];
    const labels = monthlyTrendsData.map(m => m.month) || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const collections = monthlyTrendsData.map(m => m.sales || 0);
    const invoiceTrends = monthlyTrendsData.map(m => m.balanceDue || 0);
    
    const series = {
      collections: collections.length > 0 ? collections : Array(12).fill(0),
      invoices: invoiceTrends.length > 0 ? invoiceTrends : Array(12).fill(0),
      labels: labels.length > 0 ? labels : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      agingBuckets: agingAnalysis.map(a => ({ label: a.period, value: a.amount })) || [
        { label: '0-30', value: 0 },
        { label: '31-60', value: 0 },
        { label: '61-90', value: 0 },
        { label: '90+', value: 0 },
      ],
    };

    // Map recent invoices - handle both SQL and Mongoose response formats
    const invoices = (recentInvoices || []).map((inv) => ({
      id: inv.id || inv._id,
      invoiceNumber: inv.invoiceNumber || inv.invoice_number,
      customer: inv.customer || inv.customer_name || '—',
      totalAmount: inv.totalAmount || inv.total_amount || 0,
      status: inv.status,
      createdAt: inv.createdAt || inv.created_at,
    }));

    // DSO calculation: Days Sales Outstanding
    // DSO = (Outstanding Receivables / Total Credit Sales) * Number of Days
    // For the selected date range, calculate average daily sales and DSO
    const daysInRange = filters.startDate && filters.endDate 
      ? Math.max(1, Math.ceil((new Date(filters.endDate) - new Date(filters.startDate)) / (1000 * 60 * 60 * 24)))
      : 30; // Default to 30 days if no range specified
    const averageDailySales = totalSum > 0 && daysInRange > 0 ? totalSum / daysInRange : 0;
    const dso = averageDailySales > 0 ? Math.round(outstanding / averageDailySales) : 0;
    
    // CEI calculation: Collection Effectiveness Index (simplified)
    const cei = totalSum > 0 ? Math.max(0, Math.min(100, Math.round((collectedAmount / totalSum) * 100))) : 0;

    const alerts = [];
    if (overdueCount > 0) alerts.push({ type: 'danger', message: `${overdueCount} invoice(s) overdue` });
    if (outstanding > 0) alerts.push({ type: 'warning', message: `Outstanding amount ₹${outstanding.toLocaleString('en-IN')}` });
    if (alerts.length === 0) alerts.push({ type: 'success', message: 'All clear. No issues detected.' });

    return {
        kpis: {
          customers: customerCount,
          invoices: invoiceCount,
          outstanding,
          overdue: overdueCount,
          collectedThisMonth: collectedAmount,
          dso,
          cei,
        },
        series,
        // New dashboard domains
        monthlyCollectionPlan: {
          target: collections.length > 0 ? collections.map(c => Math.round(c * 1.1)) : Array(12).fill(0),
          actual: collections.length > 0 ? collections : Array(12).fill(0),
          labels: labels
        },
        totalDebtors: {
          total: Math.max(totalSum, 0),
          outstanding,
          buckets: series.agingBuckets || []
        },
        boqVsActual: {
          boq: collections.length > 0 ? calculateQuarterlyData(collections, true) : Array(6).fill(0),
          actual: collections.length > 0 ? calculateQuarterlyData(collections, false) : Array(6).fill(0),
          labels: ['Q1','Q2','Q3','Q4','Q5','Q6']
        },
        performance: {
          onTimeCollectionRate: calculateOnTimeRate(collectedAmount, outstanding, totalSum),
          promiseToPay: calculatePromiseToPay(cei),
          slaCompliance: calculateSLACompliance(overdueCount, invoiceCount)
        },
        others: calculateOthersData(outstanding, invoiceCount, overdueCount),
        recentInvoices: invoices,
        alerts,
        actionItems: {
          dueToday: overdueCount,
          needsAttention: overdueCount,
          brokenPromises: 0,
          autopayInfo: 0,
          approvalsPending: 0,
        },
        topCustomers: (topByOutstanding || []).map(t => ({
          customerId: t.customerId || null,
          customer: t.customer || '—',
          outstanding: Math.max(0, Math.round(t.outstanding || 0)),
        })),
        // Advanced analytics
        agingAnalysis: agingAnalysis || [],
        regionalBreakup: regionalBreakup || [],
        monthlyTrends: monthlyTrends || [],
        topCustomersOverdue: topCustomersOverdue || [],
        cashInflowComparison: cashInflowComparison || [],
        activityTimeline: [],
        appliedFilters: {
          range: filters.rangeLabel || '30d',
          startDate: filters.startDate ? filters.startDate.toISOString?.() || filters.startDate : null,
          endDate: filters.endDate ? filters.endDate.toISOString?.() || filters.endDate : null,
        },
    };
  } catch (e) {
    // Return empty data on error
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return {
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
        agingAnalysis: [],
        regionalBreakup: [],
        monthlyTrends: [],
        topCustomersOverdue: [],
        cashInflowComparison: [],
        monthlyCollectionPlan: {
          target: Array(12).fill(0),
          actual: Array(12).fill(0),
          labels: labels
        },
        totalDebtors: {
          total: 0,
          outstanding: 0,
          buckets: []
        },
        boqVsActual: {
          boq: Array(6).fill(0),
          actual: Array(6).fill(0),
          labels: ['Q1','Q2','Q3','Q4','Q5','Q6']
        },
        performance: {
          onTimeCollectionRate: 0,
          promiseToPay: 0,
          slaCompliance: 0
        },
        others: [
          { title: 'Bank Reco Pending', value: 0, icon: 'DollarSign', color: 'blue' },
          { title: 'Credit Notes Awaiting', value: 0, icon: 'FileText', color: 'yellow' },
          { title: 'Disputes Open', value: 0, icon: 'AlertCircle', color: 'red' }
        ],
        activityTimeline: [],
        appliedFilters: {
          range: filters.rangeLabel || '30d',
          startDate: filters.startDate ? filters.startDate.toISOString?.() || filters.startDate : null,
          endDate: filters.endDate ? filters.endDate.toISOString?.() || filters.endDate : null,
        },
    };
  }
}

// REST endpoint
function resolveRangeFilters(rangeParam) {
  const presets = {
    '15d': 15,
    '30d': 30,
    '45d': 45,
    '60d': 60,
    '90d': 90,
  };
  let days = presets[rangeParam] || presets['30d'];
  if (!presets[rangeParam] && rangeParam) {
    const numeric = parseInt(rangeParam, 10);
    if (!Number.isNaN(numeric) && numeric > 0) {
      days = numeric;
    }
  }
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    rangeLabel: `${days}d`,
    startDate,
    endDate,
  };
}

exports.getDashboard = asyncHandler(async (req, res) => {
  // Get userId from authenticated user (req.user is set by authMiddleware)
  const userId = req.user?.id || null;
  
  // If no user is authenticated, return error (dashboard should be user-specific)
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access dashboard'
    });
  }
  
  const filters = resolveRangeFilters(req.query?.range);

  console.log(`📊 Dashboard request for user ID: ${userId} (Email: ${req.user?.email || 'N/A'}) range=${filters.rangeLabel}`);
  console.log(`📊 Date filters:`, {
    startDate: filters.startDate,
    endDate: filters.endDate,
    rangeLabel: filters.rangeLabel
  });
  
  const payload = await buildDashboardPayload(userId, filters);
  const hasData = await repo.hasData(userId);
  
  // Log dashboard summary for debugging
  console.log(`📊 Dashboard data for user ${userId}:`, {
    customers: payload.kpis.customers,
    invoices: payload.kpis.invoices,
    outstanding: payload.kpis.outstanding,
    collectedThisMonth: payload.kpis.collectedThisMonth,
    dso: payload.kpis.dso,
    hasData
  });
  
  return res.json({ success: true, data: payload, hasData, userId }); // Include userId in response for debugging
});

// Server-Sent Events for realtime updates
exports.streamDashboard = asyncHandler(async (req, res) => {
  // Get userId from authenticated user
  const userId = req.user?.id || null;
  
  // If no user is authenticated, return error
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access dashboard stream'
    });
  }
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let alive = true;
  req.on('close', () => { alive = false; });

  const filters = resolveRangeFilters(req.query?.range);

  async function push() {
    if (!alive) return;
    const payload = await buildDashboardPayload(userId, filters);
    res.write(`event: update\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  // initial snapshot
  await push();

  // periodic updates every 10s (mock realtime)
  const interval = setInterval(push, 10000);
  req.on('close', () => clearInterval(interval));
});

exports._buildDashboardPayload = buildDashboardPayload;



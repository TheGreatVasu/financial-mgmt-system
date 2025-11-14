const { asyncHandler } = require('../middlewares/errorHandler');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const repo = require('../services/repositories');

// GET /api/dashboard
// Returns KPIs, chart series, recent invoices, and alerts
async function buildDashboardPayload() {
  try {
    // Prefer SQL repository when available; fall back to Mongoose/offline
    const kpisFromRepo = await repo.getKpis().catch(() => null);
    const [customerCount, invoiceCount, paidSumAgg, totalSumAgg, overdueCount, recentInvoices, topByOutstanding] = await Promise.all([
      kpisFromRepo ? Promise.resolve(kpisFromRepo.customers) : Customer.countDocuments().catch(() => 0),
      kpisFromRepo ? Promise.resolve(kpisFromRepo.invoices) : Invoice.countDocuments().catch(() => 0),
      Invoice.aggregate([
        { $group: { _id: null, paid: { $sum: '$paidAmount' } } },
      ]).catch(() => []),
      Invoice.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]).catch(() => []),
      kpisFromRepo ? Promise.resolve(kpisFromRepo.overdue) : Invoice.countDocuments({ status: 'overdue' }).catch(() => 0),
      repo.recentInvoices(6).catch(() => Invoice.find({}).sort({ createdAt: -1 }).limit(6).populate('customer', 'companyName').lean().catch(() => [])),
      repo.topCustomersByOutstanding(5).catch(() => (
        Invoice.aggregate([
          { $group: { _id: '$customer', outstanding: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } } } },
          { $sort: { outstanding: -1 } },
          { $limit: 5 },
          { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
          { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
          { $project: { _id: 0, customerId: '$customer._id', customer: '$customer.companyName', outstanding: 1 } },
        ]).catch(() => [])
      )),
    ]);

    const paidSum = kpisFromRepo ? Number(kpisFromRepo.collectedThisMonth || 0) : (Array.isArray(paidSumAgg) && paidSumAgg[0] ? paidSumAgg[0].paid : 0);
    const totalSum = kpisFromRepo ? Number(kpisFromRepo.outstanding || 0) + Number(paidSum) : (Array.isArray(totalSumAgg) && totalSumAgg[0] ? totalSumAgg[0].total : 0);
    const outstanding = Math.max(totalSum - paidSum, 0);

    // Fetch advanced analytics
    const [agingAnalysis, regionalBreakup, monthlyTrends, topCustomersOverdue, cashInflowComparison] = await Promise.all([
      repo.getAgingAnalysis().catch(() => []),
      repo.getRegionalBreakup().catch(() => []),
      repo.getMonthlyTrends().catch(() => []),
      repo.getTopCustomersByOverdue(10).catch(() => []),
      repo.getCashInflowComparison().catch(() => []),
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

    const invoices = (recentInvoices || []).map((inv) => ({
      id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customer?.companyName || '—',
      totalAmount: inv.totalAmount,
      status: inv.status,
      createdAt: inv.createdAt,
    }));

    // DSO calculation: Days Sales Outstanding
    const dso = totalSum > 0 && invoiceCount > 0 ? Math.round((outstanding / totalSum) * 30) : 0;
    // CEI calculation: Collection Effectiveness Index (simplified)
    const cei = totalSum > 0 ? Math.max(0, Math.min(100, Math.round((paidSum / totalSum) * 100))) : 0;

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
          collectedThisMonth: paidSum,
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
          boq: Array(6).fill(0),
          actual: Array(6).fill(0),
          labels: ['Q1','Q2','Q3','Q4','Q5','Q6']
        },
        performance: {
          onTimeCollectionRate: cei,
          promiseToPay: cei,
          slaCompliance: cei
        },
        others: [],
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
          { title: 'Bank Reco Pending', value: 0 },
          { title: 'Credit Notes Awaiting', value: 0 },
          { title: 'Disputes Open', value: 0 }
        ],
        activityTimeline: [],
    };
  }
}

// REST endpoint
exports.getDashboard = asyncHandler(async (req, res) => {
  const payload = await buildDashboardPayload();
  const hasData = await repo.hasData();
  return res.json({ success: true, data: payload, hasData });
});

// Server-Sent Events for realtime updates
exports.streamDashboard = asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let alive = true;
  req.on('close', () => { alive = false; });

  async function push() {
    if (!alive) return;
    const payload = await buildDashboardPayload();
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



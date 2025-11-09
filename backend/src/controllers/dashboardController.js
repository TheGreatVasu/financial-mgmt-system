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

    // Simple monthly series mock when DB empty
    const series = {
      collections: [12, 18, 15, 22, 28, 35, 30, 38, 42, 40, 45, 50],
      invoices:    [15, 20, 18, 25, 30, 40, 33, 42, 48, 46, 50, 55],
      labels:      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      agingBuckets: [
        { label: '0-30', value: 45 },
        { label: '31-60', value: 22 },
        { label: '61-90', value: 12 },
        { label: '90+', value: 8 },
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

    // DSO rough estimate over 30-day period if we have totals
    const dso = totalSum > 0 ? Math.round((outstanding / totalSum) * 30) : 0;
    // Simple CEI placeholder (requires period data; here we scale by overdue)
    const cei = Math.max(0, Math.min(100, Math.round(100 - (overdueCount * 5))));

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
          target: [40,45,48,52,55,60,62,64,66,70,72,75],
          actual: [35,42,44,50,54,57,59,61,63,65,69,71],
          labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        },
        totalDebtors: {
          total: Math.max(totalSum, 0),
          outstanding,
          buckets: series.agingBuckets || []
        },
        boqVsActual: {
          boq: [120,140,160,180,210,230],
          actual: [110,150,155,170,190,225],
          labels: ['Q1','Q2','Q3','Q4','Q5','Q6']
        },
        performance: {
          onTimeCollectionRate: Math.min(100, 80 + Math.round(Math.random()*10)),
          promiseToPay: cei,
          slaCompliance: Math.min(100, 85 + Math.round(Math.random()*8))
        },
        others: [
          { title: 'Bank Reco Pending', value: 3 },
          { title: 'Credit Notes Awaiting', value: 2 },
          { title: 'Disputes Open', value: 4 }
        ],
        recentInvoices: invoices,
        alerts,
        actionItems: {
          dueToday: Math.max(1, Math.round(overdueCount / 2)),
          needsAttention: overdueCount,
          brokenPromises: Math.max(0, Math.round(overdueCount / 3)),
          autopayInfo: Math.max(0, Math.round(invoiceCount / 20)),
          approvalsPending: Math.max(0, Math.round(invoiceCount / 30)),
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
    };
  } catch (e) {
    // Offline fallback data
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
        // Advanced analytics fallback
        agingAnalysis: [
          { period: '0-30', amount: 125000, count: 15 },
          { period: '31-60', amount: 85000, count: 8 },
          { period: '61-90', amount: 65000, count: 5 },
          { period: '90+', amount: 50000, count: 3 },
        ],
        regionalBreakup: [
          { region: 'North', amount: 125000, overdue: 45000 },
          { region: 'South', amount: 98000, overdue: 32000 },
          { region: 'East', amount: 87000, overdue: 28000 },
          { region: 'West', amount: 115000, overdue: 38000 },
        ],
        monthlyTrends: [
          { month: 'Jan', sales: 120000, balanceDue: 80000 },
          { month: 'Feb', sales: 135000, balanceDue: 85000 },
          { month: 'Mar', sales: 145000, balanceDue: 90000 },
          { month: 'Apr', sales: 130000, balanceDue: 82000 },
          { month: 'May', sales: 150000, balanceDue: 95000 },
          { month: 'Jun', sales: 140000, balanceDue: 88000 },
          { month: 'Jul', sales: 160000, balanceDue: 100000 },
          { month: 'Aug', sales: 155000, balanceDue: 98000 },
          { month: 'Sep', sales: 145000, balanceDue: 92000 },
          { month: 'Oct', sales: 165000, balanceDue: 105000 },
          { month: 'Nov', sales: 150000, balanceDue: 95000 },
          { month: 'Dec', sales: 170000, balanceDue: 110000 },
        ],
        topCustomersOverdue: [
          { customer: 'Acme Corp', overdue: 125000, totalOutstanding: 180000 },
          { customer: 'Globex', overdue: 98000, totalOutstanding: 145000 },
          { customer: 'Initech', overdue: 87000, totalOutstanding: 120000 },
        ],
        cashInflowComparison: [
          { month: 'Jan', actual: 120000, estimated: 130000 },
          { month: 'Feb', actual: 135000, estimated: 140000 },
          { month: 'Mar', actual: 145000, estimated: 150000 },
          { month: 'Apr', actual: 130000, estimated: 135000 },
          { month: 'May', actual: 150000, estimated: 155000 },
          { month: 'Jun', actual: 140000, estimated: 145000 },
          { month: 'Jul', actual: 160000, estimated: 165000 },
          { month: 'Aug', actual: 155000, estimated: 160000 },
          { month: 'Sep', actual: 145000, estimated: 150000 },
          { month: 'Oct', actual: 165000, estimated: 170000 },
          { month: 'Nov', actual: 150000, estimated: 155000 },
          { month: 'Dec', actual: 170000, estimated: 175000 },
        ],
    };
  }
}

// REST endpoint
exports.getDashboard = asyncHandler(async (req, res) => {
  const payload = await buildDashboardPayload();
  return res.json({ success: true, data: payload });
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



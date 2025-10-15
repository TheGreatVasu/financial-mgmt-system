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



const { getDb } = require('../config/db');

// Repository layer: uses MySQL via Knex when configured, otherwise returns mock data

async function getKpis() {
  const db = getDb();
  if (!db) {
    return {
      customers: 12,
      invoices: 48,
      outstanding: 325000,
      overdue: 3,
      collectedThisMonth: 145000,
    };
  }
  const [customers, invoices, paidSumRow, totalSumRow, overdue] = await Promise.all([
    db('customers').count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
    db('invoices').count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
    db('invoices').sum({ paid: 'paid_amount' }).first().catch(() => ({ paid: 0 })),
    db('invoices').sum({ total: 'total_amount' }).first().catch(() => ({ total: 0 })),
    db('invoices').where({ status: 'overdue' }).count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
  ]);
  const paid = Number(paidSumRow?.paid || 0);
  const total = Number(totalSumRow?.total || 0);
  return {
    customers,
    invoices,
    outstanding: Math.max(total - paid, 0),
    overdue,
    collectedThisMonth: paid,
  };
}

async function listAlerts(limit = 10) {
  const db = getDb();
  if (!db) {
    return [
      { id: 'a1', type: 'danger', message: '2 invoices overdue 30+ days' },
      { id: 'a2', type: 'warning', message: 'Payment promise broken' },
      { id: 'a3', type: 'success', message: 'Payment received: ₹45,000' },
    ];
  }
  return db('alerts').orderBy('created_at', 'desc').limit(limit).select('*');
}

async function recentInvoices(limit = 6) {
  const db = getDb();
  if (!db) return [];
  const rows = await db('invoices as i')
    .leftJoin('customers as c', 'c.id', 'i.customer_id')
    .orderBy('i.created_at', 'desc')
    .limit(limit)
    .select('i.id','i.invoice_number','i.total_amount','i.status','i.created_at','c.company_name');
  return rows.map(r => ({
    id: r.id,
    invoiceNumber: r.invoice_number,
    customer: r.company_name,
    totalAmount: Number(r.total_amount || 0),
    status: r.status,
    createdAt: r.created_at,
  }));
}

async function topCustomersByOutstanding(limit = 5) {
  const db = getDb();
  if (!db) return [];
  const rows = await db('invoices as i')
    .leftJoin('customers as c', 'c.id', 'i.customer_id')
    .groupBy('i.customer_id','c.company_name')
    .orderBy('outstanding','desc')
    .limit(limit)
    .select('i.customer_id as customerId','c.company_name as customer')
    .sum({ outstanding: db.raw('i.total_amount - i.paid_amount') });
  return rows.map(r => ({ customerId: r.customerId, customer: r.customer, outstanding: Number(r.outstanding || 0) }));
}

// Aging Analysis: Breakdown of AR balance by time periods
async function getAgingAnalysis() {
  const db = getDb();
  if (!db) {
    return [
      { period: '0-30', amount: 125000, count: 15 },
      { period: '31-60', amount: 85000, count: 8 },
      { period: '61-90', amount: 65000, count: 5 },
      { period: '90+', amount: 50000, count: 3 },
    ];
  }
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const [bucket0_30, bucket31_60, bucket61_90, bucket90Plus] = await Promise.all([
    db('invoices as i')
      .where('i.due_date', '>=', thirtyDaysAgo)
      .where('i.due_date', '<=', now)
      .whereRaw('(i.total_amount - i.paid_amount) > 0')
      .sum({ amount: db.raw('i.total_amount - i.paid_amount') })
      .count({ count: '*' })
      .first()
      .catch(() => ({ amount: 0, count: 0 })),
    db('invoices as i')
      .where('i.due_date', '>=', sixtyDaysAgo)
      .where('i.due_date', '<', thirtyDaysAgo)
      .whereRaw('(i.total_amount - i.paid_amount) > 0')
      .sum({ amount: db.raw('i.total_amount - i.paid_amount') })
      .count({ count: '*' })
      .first()
      .catch(() => ({ amount: 0, count: 0 })),
    db('invoices as i')
      .where('i.due_date', '>=', ninetyDaysAgo)
      .where('i.due_date', '<', sixtyDaysAgo)
      .whereRaw('(i.total_amount - i.paid_amount) > 0')
      .sum({ amount: db.raw('i.total_amount - i.paid_amount') })
      .count({ count: '*' })
      .first()
      .catch(() => ({ amount: 0, count: 0 })),
    db('invoices as i')
      .where('i.due_date', '<', ninetyDaysAgo)
      .whereRaw('(i.total_amount - i.paid_amount) > 0')
      .sum({ amount: db.raw('i.total_amount - i.paid_amount') })
      .count({ count: '*' })
      .first()
      .catch(() => ({ amount: 0, count: 0 })),
  ]);
  
  return [
    { period: '0-30', amount: Number(bucket0_30?.amount || 0), count: Number(bucket0_30?.count || 0) },
    { period: '31-60', amount: Number(bucket31_60?.amount || 0), count: Number(bucket31_60?.count || 0) },
    { period: '61-90', amount: Number(bucket61_90?.amount || 0), count: Number(bucket61_90?.count || 0) },
    { period: '90+', amount: Number(bucket90Plus?.amount || 0), count: Number(bucket90Plus?.count || 0) },
  ];
}

// Regional breakdown of overdue balance
async function getRegionalBreakup() {
  const db = getDb();
  if (!db) {
    return [
      { region: 'North', amount: 125000, overdue: 45000 },
      { region: 'South', amount: 98000, overdue: 32000 },
      { region: 'East', amount: 87000, overdue: 28000 },
      { region: 'West', amount: 115000, overdue: 38000 },
    ];
  }
  
  // Group by state/region - using state as region
  const rows = await db('invoices as i')
    .leftJoin('customers as c', 'c.id', 'i.customer_id')
    .whereRaw('(i.total_amount - i.paid_amount) > 0')
    .whereNotNull('c.state')
    .groupBy('c.state')
    .select('c.state as region')
    .sum({ amount: db.raw('i.total_amount - i.paid_amount') })
    .sum({ overdue: db.raw('CASE WHEN i.status = \'overdue\' THEN (i.total_amount - i.paid_amount) ELSE 0 END') })
    .catch(() => []);
  
  // If no data, return default regions
  if (!rows || rows.length === 0) {
    return [
      { region: 'North', amount: 0, overdue: 0 },
      { region: 'South', amount: 0, overdue: 0 },
      { region: 'East', amount: 0, overdue: 0 },
      { region: 'West', amount: 0, overdue: 0 },
    ];
  }
  
  return rows.map(r => ({
    region: r.region || 'Unknown',
    amount: Number(r.amount || 0),
    overdue: Number(r.overdue || 0),
  }));
}

// Monthly trends for past 12 months
async function getMonthlyTrends() {
  const db = getDb();
  if (!db) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      month: m,
      sales: 120000 + Math.random() * 50000,
      balanceDue: 80000 + Math.random() * 40000,
    }));
  }
  
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const [sales, balanceDue] = await Promise.all([
      db('invoices')
        .where('created_at', '>=', date)
        .where('created_at', '<', nextMonth)
        .sum({ total: 'total_amount' })
        .first()
        .then(r => Number(r?.total || 0))
        .catch(() => 0),
      db('invoices')
        .where('created_at', '>=', date)
        .where('created_at', '<', nextMonth)
        .sum({ due: db.raw('total_amount - paid_amount') })
        .first()
        .then(r => Number(r?.due || 0))
        .catch(() => 0),
    ]);
    
    months.push({ month: monthName, sales, balanceDue });
  }
  
  return months;
}

// Top 10 customers by overdue amount
async function getTopCustomersByOverdue(limit = 10) {
  const db = getDb();
  if (!db) {
    return [
      { customer: 'Acme Corp', overdue: 125000, totalOutstanding: 180000 },
      { customer: 'Globex', overdue: 98000, totalOutstanding: 145000 },
      { customer: 'Initech', overdue: 87000, totalOutstanding: 120000 },
    ];
  }
  
  const rows = await db('invoices as i')
    .leftJoin('customers as c', 'c.id', 'i.customer_id')
    .where('i.status', 'overdue')
    .whereRaw('(i.total_amount - i.paid_amount) > 0')
    .groupBy('i.customer_id', 'c.company_name')
    .orderBy('overdue', 'desc')
    .limit(limit)
    .select('c.company_name as customer')
    .sum({ overdue: db.raw('i.total_amount - i.paid_amount') })
    .sum({ totalOutstanding: db.raw('i.total_amount - i.paid_amount') })
    .catch(() => []);
  
  return rows.map(r => ({
    customer: r.customer || 'Unknown',
    overdue: Number(r.overdue || 0),
    totalOutstanding: Number(r.totalOutstanding || 0),
  }));
}

// Cash inflow estimates (actual vs estimated)
async function getCashInflowComparison() {
  const db = getDb();
  if (!db) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      month: m,
      actual: 120000 + Math.random() * 30000,
      estimated: 130000 + Math.random() * 20000,
    }));
  }
  
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    const [actual, estimated] = await Promise.all([
      db('payments')
        .where('payment_date', '>=', date)
        .where('payment_date', '<', nextMonth)
        .sum({ total: 'amount' })
        .first()
        .then(r => Number(r?.total || 0))
        .catch(() => 0),
      // Estimate based on invoices due in that month (80% collection rate)
      db('invoices')
        .where('due_date', '>=', date)
        .where('due_date', '<', nextMonth)
        .sum({ total: 'total_amount' })
        .first()
        .then(r => Number(r?.total || 0) * 0.8)
        .catch(() => 0),
    ]);
    
    months.push({ month: monthName, actual, estimated });
  }
  
  return months;
}

module.exports = {
  getKpis,
  listAlerts,
  recentInvoices,
  topCustomersByOutstanding,
  getAgingAnalysis,
  getRegionalBreakup,
  getMonthlyTrends,
  getTopCustomersByOverdue,
  getCashInflowComparison,
};



const { getDb } = require('../config/db');

// Repository layer: uses MySQL via Knex when configured, otherwise returns mock data

function applyDateFilter(query, column, filters = {}) {
  if (!filters) return query;
  const { startDate, endDate } = filters;
  if (startDate) {
    query = query.where(column, '>=', startDate);
  }
  if (endDate) {
    query = query.where(column, '<=', endDate);
  }
  return query;
}

async function getKpis(userId = null, filters = {}) {
  const db = getDb();
  if (!db) {
    return {
      customers: 0,
      invoices: 0,
      outstanding: 0,
      overdue: 0,
      collectedThisMonth: 0,
    };
  }
  
  // Build base queries with user filtering if userId is provided
  // CRITICAL: Always filter by userId when provided, and exclude NULL created_by for security
  const customerQuery = userId 
    ? db('customers').where('created_by', userId).whereNotNull('created_by')
    : db('customers');
  
  let invoiceQuery = userId
    ? db('invoices').where('created_by', userId).whereNotNull('created_by')
    : db('invoices');
  invoiceQuery = applyDateFilter(invoiceQuery, 'created_at', filters);
  
  const [customers, invoices, paidSumRow, totalSumRow, overdue] = await Promise.all([
    customerQuery.clone().count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
    invoiceQuery.clone().count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
    invoiceQuery.clone().sum({ paid: 'paid_amount' }).first().catch(() => ({ paid: 0 })),
    invoiceQuery.clone().sum({ total: 'total_amount' }).first().catch(() => ({ total: 0 })),
    invoiceQuery.clone().where({ status: 'overdue' }).count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
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

async function listAlerts(limit = 10, userId = null) {
  const db = getDb();
  if (!db) {
    return [];
  }
  // Alerts are typically global, but if we want user-specific alerts, we can filter by user_id
  // For now, keeping it global but can be extended later
  return db('alerts').orderBy('created_at', 'desc').limit(limit).select('*');
}

async function recentInvoices(limit = 6, userId = null, filters = {}) {
  const db = getDb();
  if (!db) return [];
  let query = db('invoices as i')
    .leftJoin('customers as c', 'c.id', 'i.customer_id');
  
  // Filter by user if userId is provided
  // CRITICAL: Always exclude NULL created_by for security
  if (userId) {
    query = query.where('i.created_by', userId).whereNotNull('i.created_by');
  }
  query = applyDateFilter(query, 'i.created_at', filters);
  
  const rows = await query
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

async function topCustomersByOutstanding(limit = 5, userId = null, filters = {}) {
  const db = getDb();
  if (!db) return [];
  let query = db('invoices as i')
    .leftJoin('customers as c', 'c.id', 'i.customer_id');
  
  // Filter by user if userId is provided
  // CRITICAL: Always exclude NULL created_by for security
  if (userId) {
    query = query.where('i.created_by', userId).whereNotNull('i.created_by');
  }
  query = applyDateFilter(query, 'i.created_at', filters);
  
  const rows = await query
    .groupBy('i.customer_id','c.company_name')
    .orderBy('outstanding','desc')
    .limit(limit)
    .select('i.customer_id as customerId','c.company_name as customer')
    .sum({ outstanding: db.raw('i.total_amount - i.paid_amount') });
  return rows.map(r => ({ customerId: r.customerId, customer: r.customer, outstanding: Number(r.outstanding || 0) }));
}

// Aging Analysis: Breakdown of AR balance by time periods
async function getAgingAnalysis(userId = null, filters = {}) {
  const db = getDb();
  if (!db) {
    return [
      { period: '0-30', amount: 0, count: 0 },
      { period: '31-60', amount: 0, count: 0 },
      { period: '61-90', amount: 0, count: 0 },
      { period: '90+', amount: 0, count: 0 },
    ];
  }
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  // Helper to build base query with user filter
  const buildQuery = () => {
    let q = db('invoices as i');
    if (userId) {
      q = q.where('i.created_by', userId);
    }
    q = applyDateFilter(q, 'i.created_at', filters);
    return q;
  };
  
  const [bucket0_30, bucket31_60, bucket61_90, bucket90Plus] = await Promise.all([
    buildQuery()
      .where('i.due_date', '>=', thirtyDaysAgo)
      .where('i.due_date', '<=', now)
      .whereRaw('(i.total_amount - i.paid_amount) > 0')
      .sum({ amount: db.raw('i.total_amount - i.paid_amount') })
      .count({ count: '*' })
      .first()
      .catch(() => ({ amount: 0, count: 0 })),
    buildQuery()
      .where('i.due_date', '>=', sixtyDaysAgo)
      .where('i.due_date', '<', thirtyDaysAgo)
      .whereRaw('(i.total_amount - i.paid_amount) > 0')
      .sum({ amount: db.raw('i.total_amount - i.paid_amount') })
      .count({ count: '*' })
      .first()
      .catch(() => ({ amount: 0, count: 0 })),
    buildQuery()
      .where('i.due_date', '>=', ninetyDaysAgo)
      .where('i.due_date', '<', sixtyDaysAgo)
      .whereRaw('(i.total_amount - i.paid_amount) > 0')
      .sum({ amount: db.raw('i.total_amount - i.paid_amount') })
      .count({ count: '*' })
      .first()
      .catch(() => ({ amount: 0, count: 0 })),
    buildQuery()
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
async function getRegionalBreakup(userId = null, filters = {}) {
  const db = getDb();
  if (!db) {
    return [
      { region: 'North', amount: 0, overdue: 0 },
      { region: 'South', amount: 0, overdue: 0 },
      { region: 'East', amount: 0, overdue: 0 },
      { region: 'West', amount: 0, overdue: 0 },
    ];
  }
  
  // Group by state/region - using state as region
  let query = db('invoices as i')
    .leftJoin('customers as c', 'c.id', 'i.customer_id')
    .whereRaw('(i.total_amount - i.paid_amount) > 0')
    .whereNotNull('c.state');
  
  // Filter by user if userId is provided
  // CRITICAL: Always exclude NULL created_by for security
  if (userId) {
    query = query.where('i.created_by', userId).whereNotNull('i.created_by');
  }
  query = applyDateFilter(query, 'i.created_at', filters);
  
  const rows = await query
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
async function getMonthlyTrends(userId = null, filters = {}) {
  const db = getDb();
  if (!db) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m) => ({
      month: m,
      sales: 0,
      balanceDue: 0,
    }));
  }
  
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

    if (filters?.startDate && nextMonth <= filters.startDate) {
      continue;
    }
    if (filters?.endDate && date > filters.endDate) {
      continue;
    }
    
    // Build base queries with user filtering
    const buildInvoiceQuery = () => {
      let q = db('invoices')
        .where('created_at', '>=', date)
        .where('created_at', '<', nextMonth);
      if (userId) {
        q = q.where('created_by', userId);
      }
      return q;
    };
    
    const [sales, balanceDue] = await Promise.all([
      buildInvoiceQuery()
        .clone()
        .sum({ total: 'total_amount' })
        .first()
        .then(r => Number(r?.total || 0))
        .catch(() => 0),
      buildInvoiceQuery()
        .clone()
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
async function getTopCustomersByOverdue(limit = 10, userId = null, filters = {}) {
  const db = getDb();
  if (!db) {
    return [];
  }
  
  let query = db('invoices as i')
    .leftJoin('customers as c', 'c.id', 'i.customer_id')
    .where('i.status', 'overdue')
    .whereRaw('(i.total_amount - i.paid_amount) > 0');
  
  // Filter by user if userId is provided
  // CRITICAL: Always exclude NULL created_by for security
  if (userId) {
    query = query.where('i.created_by', userId).whereNotNull('i.created_by');
  }
  query = applyDateFilter(query, 'i.created_at', filters);
  
  const rows = await query
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
async function getCashInflowComparison(userId = null, filters = {}) {
  const db = getDb();
  if (!db) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m) => ({
      month: m,
      actual: 0,
      estimated: 0,
    }));
  }
  
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

    if (filters?.startDate && nextMonth <= filters.startDate) {
      continue;
    }
    if (filters?.endDate && date > filters.endDate) {
      continue;
    }
    
    // Build queries with user filtering
    const buildPaymentQuery = () => {
      let q = db('payments')
        .where('payment_date', '>=', date)
        .where('payment_date', '<', nextMonth);
      // Payments don't have created_by, but we can filter by invoice's created_by via join
      // For now, if userId is provided, we'll filter payments by invoices created_by
      return q;
    };
    
    const buildInvoiceQuery = () => {
      let q = db('invoices')
        .where('due_date', '>=', date)
        .where('due_date', '<', nextMonth);
      if (userId) {
        q = q.where('created_by', userId);
      }
      return q;
    };
    
    // For payments, we need to join with invoices to filter by user
    // This is a simplified version - in production, you might want to add created_by to payments table
    let actualQuery = db('payments')
      .where('payment_date', '>=', date)
      .where('payment_date', '<', nextMonth);
    
    if (userId) {
      actualQuery = actualQuery
        .leftJoin('invoices as i', 'i.id', 'payments.invoice_id')
        .where('i.created_by', userId);
    }
    
    const [actual, estimated] = await Promise.all([
      actualQuery
        .sum({ total: 'payments.amount' })
        .first()
        .then(r => Number(r?.total || 0))
        .catch(() => 0),
      // Estimate based on invoices due in that month (80% collection rate)
      buildInvoiceQuery()
        .sum({ total: 'total_amount' })
        .first()
        .then(r => Number(r?.total || 0) * 0.8)
        .catch(() => 0),
    ]);
    
    months.push({ month: monthName, actual, estimated });
  }
  
  return months;
}

// Check if database has any data
async function hasData(userId = null) {
  const db = getDb();
  if (!db) {
    return false;
  }
  try {
    const customerQuery = userId 
      ? db('customers').where('created_by', userId)
      : db('customers');
    
    const invoiceQuery = userId
      ? db('invoices').where('created_by', userId)
      : db('invoices');
    
    const [customerCount, invoiceCount, paymentCount] = await Promise.all([
      customerQuery.clone().count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
      invoiceQuery.clone().count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
      // Payments don't have created_by, but we can check via invoices
      userId 
        ? db('payments')
            .leftJoin('invoices as i', 'i.id', 'payments.invoice_id')
            .where('i.created_by', userId)
            .count({ c: '*' })
            .first()
            .then(r => Number(r?.c || 0))
            .catch(() => 0)
        : db('payments').count({ c: '*' }).first().then(r => Number(r?.c || 0)).catch(() => 0),
    ]);
    return (customerCount + invoiceCount + paymentCount) > 0;
  } catch (error) {
    return false;
  }
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
  hasData,
};



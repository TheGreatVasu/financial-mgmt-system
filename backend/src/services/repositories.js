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

module.exports = {
  getKpis,
  listAlerts,
  recentInvoices,
  topCustomersByOutstanding,
};



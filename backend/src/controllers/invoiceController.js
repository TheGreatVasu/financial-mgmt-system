const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const Invoice = require('../models/Invoice');

function computeTotals(items = [], taxRate = 0) {
  const subTotal = Number(items.reduce((s, it) => s + Number(it.amount || it.total || it.price || 0), 0));
  const tax = Math.round((subTotal * Number(taxRate || 0)) / 100);
  const total = subTotal + tax;
  return { subTotal, tax, total };
}

// List invoices with basic filters
const getInvoices = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 20, status, customer, from, to, q } = req.query;
  if (db) {
    const qb = db('invoices as i').leftJoin('customers as c', 'c.id', 'i.customer_id');
    if (status) qb.where('i.status', status);
    if (customer) qb.where('i.customer_id', customer);
    if (from) qb.where('i.created_at', '>=', new Date(from));
    if (to) qb.where('i.created_at', '<=', new Date(to));
    if (q) qb.whereILike('i.invoice_number', `%${q}%`);
    const rows = await qb
      .clone()
      .orderBy('i.created_at', 'desc')
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit))
      .select('i.*', 'c.company_name as customer_name');
    const [{ c }] = await qb.clone().count({ c: '*' });
    return res.json({ success: true, data: rows, meta: { page: Number(page), limit: Number(limit), total: Number(c) } });
  }
  // Mongoose fallback
  const filter = {};
  if (status) filter.status = status;
  if (customer) filter.customer = customer;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (q) filter.invoiceNumber = new RegExp(q, 'i');
  const docs = await Invoice.find(filter).populate('customer', 'companyName').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  const count = await Invoice.countDocuments(filter);
  res.json({ success: true, data: docs, meta: { page: Number(page), limit: Number(limit), total: count } });
});

const getInvoice = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  if (db) {
    const row = await db('invoices').where({ id }).first();
    if (!row) return res.status(404).json({ success: false, message: 'Invoice not found' });
    return res.json({ success: true, data: row });
  }
  const doc = await Invoice.findById(id).populate('customer', 'companyName');
  if (!doc) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.json({ success: true, data: doc });
});

const createInvoice = asyncHandler(async (req, res) => {
  const db = getDb();
  const payload = req.body || {};
  const { total } = computeTotals(payload.items || [], payload.taxRate || 0);
  const now = new Date();
  if (db) {
    const row = {
      invoice_number: payload.invoiceNumber,
      customer_id: payload.customerId,
      po_ref: payload.poRef || null,
      payment_terms: payload.paymentTerms || null,
      tax_rate: Number(payload.taxRate || 0),
      total_amount: Number(total || 0),
      paid_amount: 0,
      status: 'pending',
      due_date: payload.dueDate ? new Date(payload.dueDate) : null,
      created_at: now,
    };
    const [id] = await db('invoices').insert(row);
    return res.status(201).json({ success: true, data: { id, ...row } });
  }
  const doc = await Invoice.create({
    invoiceNumber: payload.invoiceNumber,
    customer: payload.customerId,
    poRef: payload.poRef,
    paymentTerms: payload.paymentTerms,
    taxRate: Number(payload.taxRate || 0),
    totalAmount: Number(total || 0),
    paidAmount: 0,
    status: 'pending',
    dueDate: payload.dueDate,
  });
  res.status(201).json({ success: true, data: doc });
});

const updateInvoice = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const payload = req.body || {};
  if (db) {
    const next = { ...payload };
    if (payload.items || payload.taxRate != null) {
      const { total } = computeTotals(payload.items || [], payload.taxRate || 0);
      next.total_amount = Number(total || 0);
    }
    await db('invoices').where({ id }).update(next);
    const row = await db('invoices').where({ id }).first();
    return res.json({ success: true, data: row });
  }
  if (payload.items || payload.taxRate != null) {
    const { total } = computeTotals(payload.items || [], payload.taxRate || 0);
    payload.totalAmount = Number(total || 0);
  }
  const doc = await Invoice.findByIdAndUpdate(id, payload, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.json({ success: true, data: doc });
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  if (db) {
    await db('invoices').where({ id }).delete();
    return res.json({ success: true });
  }
  await Invoice.findByIdAndDelete(id);
  res.json({ success: true });
});

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice };

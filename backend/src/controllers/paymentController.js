const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

const getPayments = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 20, method, status, from, to, q } = req.query;
  if (db) {
    const qb = db('payments as p').leftJoin('invoices as i', 'i.id', 'p.invoice_id');
    if (method) qb.where('p.payment_method', method);
    if (status) qb.where('p.status', status);
    if (from) qb.where('p.payment_date', '>=', new Date(from));
    if (to) qb.where('p.payment_date', '<=', new Date(to));
    if (q) qb.whereILike('p.reference', `%${q}%`);
    const rows = await qb.clone().orderBy('p.payment_date', 'desc').limit(Number(limit)).offset((Number(page)-1)*Number(limit)).select('p.*','i.invoice_number');
    const [{ c }] = await qb.clone().count({ c: '*' });
    return res.json({ success: true, data: rows, meta: { page: Number(page), limit: Number(limit), total: Number(c) } });
  }
  const filter = {};
  if (method) filter.paymentMethod = method;
  if (status) filter.status = status;
  if (from || to) {
    filter.paymentDate = {};
    if (from) filter.paymentDate.$gte = new Date(from);
    if (to) filter.paymentDate.$lte = new Date(to);
  }
  const docs = await Payment.find(filter).sort({ paymentDate: -1 }).skip((page-1)*limit).limit(Number(limit));
  const count = await Payment.countDocuments(filter);
  res.json({ success: true, data: docs, meta: { page: Number(page), limit: Number(limit), total: count } });
});

const createPayment = asyncHandler(async (req, res) => {
  const db = getDb();
  const payload = req.body || {};
  const now = new Date();
  if (db) {
    // find invoice and update paid amount
    const inv = await db('invoices').where({ invoice_number: payload.invoiceNumber }).first();
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
    const paymentRow = {
      invoice_id: inv.id,
      amount: Number(payload.amount || 0),
      payment_date: payload.paymentDate ? new Date(payload.paymentDate) : now,
      payment_method: payload.method || 'upi',
      reference: payload.reference || 'manual',
      status: 'completed',
      created_at: now,
    };
    const [pid] = await db('payments').insert(paymentRow);
    const newPaid = Number(inv.paid_amount || 0) + paymentRow.amount;
    const nextStatus = newPaid >= Number(inv.total_amount || 0) ? 'paid' : 'partial';
    await db('invoices').where({ id: inv.id }).update({ paid_amount: newPaid, status: nextStatus });
    return res.status(201).json({ success: true, data: { id: pid, ...paymentRow } });
  }
  // Mongoose fallback
  const inv = await Invoice.findOne({ invoiceNumber: payload.invoiceNumber });
  if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
  const paymentDoc = await Payment.create({
    invoice: inv._id,
    customer: inv.customer,
    amount: Number(payload.amount || 0),
    paymentDate: payload.paymentDate || now,
    paymentMethod: payload.method || 'upi',
    reference: payload.reference || 'manual',
    status: 'completed',
    processedBy: req.user?._id,
  });
  const newPaid = Number(inv.paidAmount || 0) + Number(payload.amount || 0);
  inv.paidAmount = newPaid;
  inv.status = newPaid >= Number(inv.totalAmount || 0) ? 'paid' : 'partial';
  await inv.save();
  res.status(201).json({ success: true, data: paymentDoc });
});

module.exports = { getPayments, createPayment };

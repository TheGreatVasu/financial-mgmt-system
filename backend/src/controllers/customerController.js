const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const Customer = require('../models/Customer');
const { broadcastDashboardUpdate } = require('../services/socketService');

const getCustomers = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 50, q } = req.query;
  if (db) {
    const qb = db('customers');
    if (q) qb.whereILike('company_name', `%${q}%`).orWhereILike('name', `%${q}%`);
    const rows = await qb.clone().orderBy('created_at', 'desc').limit(Number(limit)).offset((Number(page)-1)*Number(limit)).select('*');
    const [{ c }] = await qb.clone().count({ c: '*' });
    return res.json({ success: true, data: rows, meta: { page: Number(page), limit: Number(limit), total: Number(c) } });
  }
  const filter = q ? { companyName: new RegExp(q, 'i') } : {};
  const docs = await Customer.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
  const count = await Customer.countDocuments(filter);
  res.json({ success: true, data: docs, meta: { page: Number(page), limit: Number(limit), total: count } });
});

const getCustomer = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  if (db) {
    const row = await db('customers').where({ id }).first();
    if (!row) return res.status(404).json({ success: false, message: 'Customer not found' });
    return res.json({ success: true, data: row });
  }
  const doc = await Customer.findById(id);
  if (!doc) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.json({ success: true, data: doc });
});

const createCustomer = asyncHandler(async (req, res) => {
  const db = getDb();
  const p = req.body || {};
  const now = new Date();
  if (db) {
    const row = {
      name: p.name || null,
      company_name: p.companyName || null,
      email: p.email || null,
      phone: p.phone || null,
      gst_number: p.gstNumber || null,
      created_at: now,
    };
    const [id] = await db('customers').insert(row);
    // Emit dashboard update
    broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
    return res.status(201).json({ success: true, data: { id, ...row } });
  }
  const doc = await Customer.create({ name: p.name, companyName: p.companyName, email: p.email, phone: p.phone, gstNumber: p.gstNumber });
  // Emit dashboard update
  broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
  res.status(201).json({ success: true, data: doc });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const p = req.body || {};
  if (db) {
    await db('customers').where({ id }).update({ name: p.name, company_name: p.companyName, email: p.email, phone: p.phone, gst_number: p.gstNumber });
    const row = await db('customers').where({ id }).first();
    // Emit dashboard update
    broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
    return res.json({ success: true, data: row });
  }
  const doc = await Customer.findByIdAndUpdate(id, { name: p.name, companyName: p.companyName, email: p.email, phone: p.phone, gstNumber: p.gstNumber }, { new: true });
  if (!doc) return res.status(404).json({ success: false, message: 'Customer not found' });
  // Emit dashboard update
  broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
  res.json({ success: true, data: doc });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  if (db) {
    await db('customers').where({ id }).delete();
    // Emit dashboard update
    broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
    return res.json({ success: true });
  }
  await Customer.findByIdAndDelete(id);
  // Emit dashboard update
  broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
  res.json({ success: true });
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };

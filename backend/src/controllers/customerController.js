const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const Customer = require('../models/Customer');
const { broadcastDashboardUpdate } = require('../services/socketService');
const excelService = require('../services/excelService');
const path = require('path');
const fs = require('fs');

const getCustomers = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 50, q } = req.query;
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to view customers' 
    });
  }
  
  if (db) {
    const qb = db('customers');
    
    // CRITICAL: Filter by user to ensure data isolation
    // Also exclude NULL created_by to prevent showing orphaned data
    qb.where('created_by', userId).whereNotNull('created_by');
    
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
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to view customer' 
    });
  }
  
  if (db) {
    const row = await db('customers')
      .where({ id })
      .where('created_by', userId) // CRITICAL: Ensure user can only access their own customers
      .first();
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
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to create customer' 
    });
  }
  
  if (db) {
    const row = {
      name: p.name || null,
      company_name: p.companyName || null,
      email: p.email || null,
      phone: p.phone || null,
      gst_number: p.gstNumber || null,
      created_by: userId, // Set the user who created this customer
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
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to update customer' 
    });
  }
  
  if (db) {
    // CRITICAL: Only allow update of customers created by the user
    const updated = await db('customers')
      .where({ id })
      .where('created_by', userId)
      .update({ name: p.name, company_name: p.companyName, email: p.email, phone: p.phone, gst_number: p.gstNumber });
    
    if (updated === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found or you do not have permission to update it' 
      });
    }
    
    const row = await db('customers')
      .where({ id })
      .where('created_by', userId)
      .first();
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
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to delete customer' 
    });
  }
  
  if (db) {
    // CRITICAL: Only allow deletion of customers created by the user
    const deleted = await db('customers')
      .where({ id })
      .where('created_by', userId)
      .delete();
    
    if (deleted === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found or you do not have permission to delete it' 
      });
    }
    // Emit dashboard update
    broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
    return res.json({ success: true });
  }
  await Customer.findByIdAndDelete(id);
  // Emit dashboard update
  broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
  res.json({ success: true });
});

// @desc    Export PO Entry to Excel
// @route   POST /api/customers/po-entry/export
// @access  Private
const exportPOEntry = asyncHandler(async (req, res) => {
  const poData = req.body;
  
  // Generate Excel workbook with PO entry data
  const workbook = excelService.createPOEntryExcel(poData);
  
  // Generate filename with PO number and date
  const poNumber = poData.poNo || 'PO-Entry';
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `Customer_PO_Entry_${poNumber}_${dateStr}.xlsx`;
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Write workbook to response
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Download PO Entry Template
// @route   GET /api/customers/po-entry/template
// @access  Private
const downloadPOEntryTemplate = asyncHandler(async (req, res) => {
  const templatePath = path.join(__dirname, '../../templates/Customer_PO_Entry_Template.xlsx');
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({
      success: false,
      message: 'Template file not found. Please generate it first using: npm run create-po-template'
    });
  }
  
  // Send template file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="Customer_PO_Entry_Template.xlsx"');
  res.sendFile(templatePath);
});

module.exports = { 
  getCustomers, 
  getCustomer, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  exportPOEntry,
  downloadPOEntryTemplate
};

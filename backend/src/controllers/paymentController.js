const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const { broadcastDashboardUpdate } = require('../services/socketService');

const getPayments = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 20, method, status, from, to, q, customer } = req.query;
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to view payments' 
    });
  }
  
  if (db) {
    // Try to join with sales_invoice_master first, fallback to invoices
    let qb = db('payments as p')
      .leftJoin('sales_invoice_master as sim', function() {
        this.on('sim.id', '=', db.raw('CAST(p.invoice_id AS CHAR)'))
          .orOn('sim.gst_tax_invoice_no', '=', db.raw('CAST(p.invoice_id AS CHAR)'));
      })
      .leftJoin('invoices as i', 'i.id', 'p.invoice_id');
    
    // CRITICAL: Filter by user - check both sales_invoice_master and invoices
    qb.where(function() {
      this.where('sim.created_by', userId).whereNotNull('sim.created_by')
        .orWhere('i.created_by', userId).whereNotNull('i.created_by');
    });
    
    // Filter by payment method (legacy column name is "method")
    if (method) qb.where('p.method', method);
    if (status) qb.where('p.status', status);
    if (from) qb.where('p.payment_date', '>=', new Date(from));
    if (to) qb.where('p.payment_date', '<=', new Date(to));
    if (customer) qb.where(function() {
      this.where('sim.customer_name', 'like', `%${customer}%`)
        .orWhere('p.customer_name', 'like', `%${customer}%`);
    });
    if (q) {
      qb.where(function() {
        this.where('p.reference', 'like', `%${q}%`)
          .orWhere('sim.gst_tax_invoice_no', 'like', `%${q}%`)
          .orWhere('sim.internal_invoice_no', 'like', `%${q}%`)
          .orWhere('i.invoice_number', 'like', `%${q}%`)
          .orWhere('p.customer_name', 'like', `%${q}%`);
      });
    }
    
    const rows = await qb.clone()
      .orderBy('p.payment_date', 'desc')
      .limit(Number(limit))
      .offset((Number(page)-1)*Number(limit))
      .select(
        'p.*',
        'sim.customer_name as sim_customer_name',
        'sim.business_unit as sim_project_name',
        'sim.material_description as sim_package_name',
        'sim.gst_tax_invoice_no',
        'i.invoice_number'
      );
    
    // Map rows to include customer_name, project_name, package_name from sales invoice or payment
    const mappedRows = rows.map(row => ({
      ...row,
      customer_name: row.customer_name || row.sim_customer_name || null,
      project_name: row.project_name || row.sim_project_name || null,
      package_name: row.package_name || row.sim_package_name || null,
    }));
    
    const [{ c }] = await qb.clone().count({ c: '*' });
    return res.json({ success: true, data: mappedRows, meta: { page: Number(page), limit: Number(limit), total: Number(c) } });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
});

const createPayment = asyncHandler(async (req, res) => {
  const db = getDb();
  const payload = req.body || {};
  const now = new Date();
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to create payment' 
    });
  }
  
  if (db) {
    // Try to find invoice in sales_invoice_master first, then fallback to invoices table
    let invoiceId = null;
    let inv = null;
    
    // Check sales_invoice_master table
    if (payload.invoiceId) {
      inv = await db('sales_invoice_master')
        .where(function() {
          this.where('id', payload.invoiceId)
            .orWhere('gst_tax_invoice_no', payload.invoiceId)
            .orWhere('internal_invoice_no', payload.invoiceId);
        })
        .where('created_by', userId)
        .first();
      
      if (inv) {
        invoiceId = inv.id || inv.gst_tax_invoice_no;
      }
    }
    
    // Fallback to invoices table if not found in sales_invoice_master
    if (!inv && payload.invoiceId) {
      inv = await db('invoices')
        .where({ invoice_number: payload.invoiceId })
        .where('created_by', userId)
        .first();
      
      if (inv) {
        invoiceId = inv.id;
      }
    }
    
    if (!inv) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found or you do not have permission to create payment for it' 
      });
    }
    
    // Generate payment code
    const paymentCode = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const paymentRow = {
      payment_code: paymentCode,
      invoice_id: invoiceId,
      customer_id: inv.customer_id || 0, // May not exist for sales invoices
      amount: Number(payload.paymentAmount || payload.amount || 0),
      payment_date: payload.paymentReceiptDate
        ? new Date(payload.paymentReceiptDate)
        : (payload.paymentDate ? new Date(payload.paymentDate) : now),
      // IMPORTANT: underlying column is "method" in the legacy schema
      method: payload.method || 'bank_transfer',
      reference: payload.reference || paymentCode,
      status: 'completed',
      created_at: now,
      // New fields - these columns may need to be added via migration
      payment_receipt_date: payload.paymentReceiptDate ? new Date(payload.paymentReceiptDate) : now,
      customer_name: payload.customerName || inv.customer_name || null,
      project_name: payload.projectName || inv.business_unit || inv.sales_order_no || null,
      package_name: payload.packageName || inv.material_description || null,
      payment_type: payload.paymentType || '1st Due',
      bank_name: payload.bankName || null,
      bank_credit_date: payload.bankCreditDate ? new Date(payload.bankCreditDate) : null,
    };
    
    // Remove undefined values
    Object.keys(paymentRow).forEach(key => {
      if (paymentRow[key] === undefined) delete paymentRow[key];
    });
    
    try {
      const [pid] = await db('payments').insert(paymentRow);
      
      // Update invoice paid amount if it's a regular invoice
      if (inv.paid_amount !== undefined) {
        const newPaid = Number(inv.paid_amount || 0) + paymentRow.amount;
        const nextStatus = newPaid >= Number(inv.total_amount || 0) ? 'paid' : 'partial';
        await db('invoices').where({ id: inv.id }).update({ paid_amount: newPaid, status: nextStatus });
      }
      
      // Emit dashboard update
      broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
      return res.status(201).json({ success: true, data: { id: pid, ...paymentRow } });
    } catch (err) {
      // If columns don't exist, try without new fields
      if (err.code === 'ER_BAD_FIELD_ERROR' || err.message.includes('Unknown column')) {
        console.warn('New payment columns not found, creating payment without them:', err.message);
        const basicPaymentRow = {
          payment_code: paymentCode,
          invoice_id: invoiceId,
          customer_id: inv.customer_id || 0,
          amount: Number(payload.paymentAmount || payload.amount || 0),
          payment_date: payload.paymentReceiptDate ? new Date(payload.paymentReceiptDate) : now,
          // Use legacy "method" column only – safe on existing schema
          method: payload.method || 'bank_transfer',
          reference: payload.reference || paymentCode,
          status: 'completed',
          created_at: now,
        };
        const [pid] = await db('payments').insert(basicPaymentRow);
        return res.status(201).json({ success: true, data: { id: pid, ...basicPaymentRow } });
      }
      throw err;
    }
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
});

const updatePayment = asyncHandler(async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const payload = req.body || {};
  
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to update payment' 
    });
  }
  
  if (db) {
    // Verify payment belongs to user
    const payment = await db('payments as p')
      .leftJoin('sales_invoice_master as sim', function() {
        this.on('sim.id', '=', db.raw('CAST(p.invoice_id AS CHAR)'))
          .orOn('sim.gst_tax_invoice_no', '=', db.raw('CAST(p.invoice_id AS CHAR)'));
      })
      .leftJoin('invoices as i', 'i.id', 'p.invoice_id')
      .where('p.id', id)
      .where(function() {
        this.where('sim.created_by', userId).whereNotNull('sim.created_by')
          .orWhere('i.created_by', userId).whereNotNull('i.created_by');
      })
      .select('p.*')
      .first();
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found or you do not have permission to update it' 
      });
    }
    
    const updateData = {};
    if (payload.paymentReceiptDate !== undefined) updateData.payment_receipt_date = new Date(payload.paymentReceiptDate);
    if (payload.paymentAmount !== undefined || payload.amount !== undefined) updateData.amount = Number(payload.paymentAmount || payload.amount);
    if (payload.customerName !== undefined) updateData.customer_name = payload.customerName;
    if (payload.projectName !== undefined) updateData.project_name = payload.projectName;
    if (payload.packageName !== undefined) updateData.package_name = payload.packageName;
    if (payload.paymentType !== undefined) updateData.payment_type = payload.paymentType;
    if (payload.bankName !== undefined) updateData.bank_name = payload.bankName;
    if (payload.bankCreditDate !== undefined) updateData.bank_credit_date = payload.bankCreditDate ? new Date(payload.bankCreditDate) : null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.paymentDate !== undefined) updateData.payment_date = new Date(payload.paymentDate);
    
    updateData.updated_at = new Date();
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });
    
    try {
      await db('payments').where({ id }).update(updateData);
      const updated = await db('payments').where({ id }).first();
      broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
      return res.json({ success: true, data: updated });
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR' || err.message.includes('Unknown column')) {
        // Remove new fields if columns don't exist
        const basicUpdateData = {
          amount: updateData.amount,
          payment_date: updateData.payment_date,
          status: updateData.status,
          updated_at: updateData.updated_at,
        };
        Object.keys(basicUpdateData).forEach(key => {
          if (basicUpdateData[key] === undefined) delete basicUpdateData[key];
        });
        await db('payments').where({ id }).update(basicUpdateData);
        const updated = await db('payments').where({ id }).first();
        return res.json({ success: true, data: updated });
      }
      throw err;
    }
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
});

const deletePayment = asyncHandler(async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to delete payment' 
    });
  }
  
  if (db) {
    // Verify payment belongs to user
    const payment = await db('payments as p')
      .leftJoin('sales_invoice_master as sim', function() {
        this.on('sim.id', '=', db.raw('CAST(p.invoice_id AS CHAR)'))
          .orOn('sim.gst_tax_invoice_no', '=', db.raw('CAST(p.invoice_id AS CHAR)'));
      })
      .leftJoin('invoices as i', 'i.id', 'p.invoice_id')
      .where('p.id', id)
      .where(function() {
        this.where('sim.created_by', userId).whereNotNull('sim.created_by')
          .orWhere('i.created_by', userId).whereNotNull('i.created_by');
      })
      .select('p.*')
      .first();
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found or you do not have permission to delete it' 
      });
    }
    
    await db('payments').where({ id }).delete();
    broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
    return res.json({ success: true, message: 'Payment deleted successfully' });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
});

module.exports = { getPayments, createPayment, updatePayment, deletePayment };

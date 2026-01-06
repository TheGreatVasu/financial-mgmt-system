const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const { broadcastDashboardUpdate } = require('../services/socketService');

/**
 * GET PAYMENTS
 */
const getPayments = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 20, method, status, from, to, q, customer } = req.query;

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to view payments'
    });
  }

  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  let qb = db('payments as p')
    .leftJoin('sales_invoice_master as sim', function () {
      this.on('sim.id', '=', 'p.invoice_id');
    })
    .leftJoin('invoices as i', 'i.id', 'p.invoice_id');

  // 🔐 User isolation
  qb.where(function () {
    this.where('sim.created_by', userId).whereNotNull('sim.created_by')
      .orWhere('i.created_by', userId).whereNotNull('i.created_by');
  });

  if (method) qb.where('p.method', method);
  if (status) qb.where('p.status', status);
  if (from) qb.where('p.payment_date', '>=', new Date(from));
  if (to) qb.where('p.payment_date', '<=', new Date(to));

  if (customer) {
    qb.where(function () {
      this.where('sim.customer_name', 'like', `%${customer}%`)
        .orWhere('p.customer_name', 'like', `%${customer}%`);
    });
  }

  if (q) {
    qb.where(function () {
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
    .offset((Number(page) - 1) * Number(limit))
    .select(
      'p.*',
      'sim.customer_name as sim_customer_name',
      'sim.business_unit as sim_project_name',
      'sim.material_description as sim_package_name',
      'sim.gst_tax_invoice_no',
      'i.invoice_number'
    );

  const mappedRows = rows.map(row => ({
    ...row,
    customer_name: row.customer_name || row.sim_customer_name || null,
    project_name: row.project_name || row.sim_project_name || null,
    package_name: row.package_name || row.sim_package_name || null,
  }));

  const [{ c }] = await qb.clone().count({ c: '*' });

  return res.json({
    success: true,
    data: mappedRows,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: Number(c)
    }
  });
});

/**
 * CREATE PAYMENT
 */
const createPayment = asyncHandler(async (req, res) => {
  const db = getDb();
  const payload = req.body || {};
  const now = new Date();

  // Validate authentication
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to create payment'
    });
  }

  // Validate database connection
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  // Validate required fields
  if (!payload.invoiceId) {
    return res.status(400).json({
      success: false,
      message: 'invoiceId is required'
    });
  }

  if (!payload.paymentReceiptDate) {
    return res.status(400).json({
      success: false,
      message: 'paymentReceiptDate is required'
    });
  }

  if (payload.paymentAmount === undefined || payload.paymentAmount === null || payload.paymentAmount === '') {
    return res.status(400).json({
      success: false,
      message: 'paymentAmount is required'
    });
  }

  // Validate numeric fields
  const paymentAmount = Number(payload.paymentAmount);
  if (isNaN(paymentAmount)) {
    return res.status(400).json({
      success: false,
      message: 'paymentAmount must be a valid number'
    });
  }

  if (paymentAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'paymentAmount must be greater than 0'
    });
  }

  // Lookup invoice
  let inv = null;

  // 🔎 Try sales_invoice_master first
  if (payload.invoiceId) {
    // Try as numeric ID first (only if it's actually a number)
    const numId = Number(payload.invoiceId);
    if (!isNaN(numId) && numId > 0) {
      inv = await db('sales_invoice_master')
        .where('id', numId)
        .first();
    }

    // Then try as invoice number
    if (!inv) {
      inv = await db('sales_invoice_master')
        .where('gst_tax_invoice_no', payload.invoiceId)
        .orWhere('internal_invoice_no', payload.invoiceId)
        .first();
    }
  }

  // 🔁 Fallback to invoices table
  if (!inv && payload.invoiceId) {
    const numId = Number(payload.invoiceId);
    if (!isNaN(numId) && numId > 0) {
      inv = await db('invoices')
        .where('id', numId)
        .first();
    }

    if (!inv) {
      inv = await db('invoices')
        .where('invoice_number', payload.invoiceId)
        .first();
    }
  }

  if (!inv) {
    return res.status(404).json({
      success: false,
      message: `Invoice not found with ID/Number: ${payload.invoiceId}`
    });
  }

  // Validate and prepare tax deduction fields
  const taxFields = {
    progressive_delivery: Number(payload.progressiveDelivery || 0),
    agt_commissioning: Number(payload.agtCommissioning || 0),
    gst_tds: Number(payload.gstTds || 0),
    it_tds: Number(payload.itTds || 0),
    it_tds_u194q: Number(payload.itTdsU194Q || 0),
    labour_cess: Number(payload.labourCess || 0),
    old_it_tds: Number(payload.oldItTds || 0),
    other_recovery: Number(payload.otherRecovery || 0),
    penalty: Number(payload.penalty || 0),
  };

  // Validate all tax fields are valid numbers
  for (const [key, value] of Object.entries(taxFields)) {
    if (isNaN(value)) {
      return res.status(400).json({
        success: false,
        message: `${key} must be a valid number`
      });
    }
  }

  // Generate payment code
  const paymentCode = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // Build payment row with all validated data
  const paymentRow = {
    payment_code: paymentCode,
    invoice_id: inv.id,
    customer_id: inv.customer_id || 0,
    amount: paymentAmount,
    ...taxFields,
    customer_name: payload.customerName || inv.customer_name || '',
    project_name: payload.projectName || '',
    package_name: payload.packageName || '',
    payment_type: payload.paymentType || 'normal',
    bank_name: payload.bankName || '',
    bank_credit_date: payload.bankCreditDate ? new Date(payload.bankCreditDate) : null,
    payment_date: new Date(payload.paymentReceiptDate),
    // Only use valid ENUM values for method, not paymentType
    method: 'bank_transfer', // Default to bank_transfer, as this is the most common
    reference: payload.reference || paymentCode,
    status: 'completed',
    created_at: now,
    updated_at: now
  };

  try {
    // Insert payment
    const [pid] = await db('payments').insert(paymentRow);

    // Update invoice's paid amount and status
    const currentPaidAmount = inv.paid_amount || 0;
    const newPaidAmount = currentPaidAmount + paymentAmount;
    const totalAmount = inv.total_amount || 0;

    // Determine new status
    let newStatus = inv.status || 'sent';
    if (newPaidAmount >= totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'sent'; // Partial payment
    }

    // Update invoice
    await db('invoices')
      .where('id', inv.id)
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        updated_at: now
      })
      .catch(() => {
        // Silently fail if this is a sales_invoice_master instead of invoices
      });

    // Try to update sales_invoice_master if applicable
    await db('sales_invoice_master')
      .where('id', inv.id)
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        updated_at: now
      })
      .catch(() => {
        // Silently fail - table might not have these columns
      });

    broadcastDashboardUpdate().catch(console.error);

    return res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        id: pid,
        payment_code: paymentCode,
        invoice_id: inv.id,
        amount: paymentAmount,
        ...taxFields,
      }
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to create payment: ${error.message}`
    });
  }
});

/**
 * UPDATE PAYMENT
 */
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

  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  const payment = await db('payments as p')
    .leftJoin('sales_invoice_master as sim', function () {
      this.on('sim.id', '=', 'p.invoice_id');
    })
    .leftJoin('invoices as i', 'i.id', 'p.invoice_id')
    .where('p.id', id)
    .where(function () {
      this.where('sim.created_by', userId).whereNotNull('sim.created_by')
        .orWhere('i.created_by', userId).whereNotNull('i.created_by');
    })
    .select('p.*')
    .first();

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found or access denied'
    });
  }

  const updateData = {
    amount: payload.paymentAmount || payload.amount,
    progressive_delivery: Number(payload.progressiveDelivery || 0),
    agt_commissioning: Number(payload.agtCommissioning || 0),
    gst_tds: Number(payload.gstTds || 0),
    it_tds: Number(payload.itTds || 0),
    it_tds_u194q: Number(payload.itTdsU194Q || 0),
    labour_cess: Number(payload.labourCess || 0),
    old_it_tds: Number(payload.oldItTds || 0),
    other_recovery: Number(payload.otherRecovery || 0),
    penalty: Number(payload.penalty || 0),
    customer_name: payload.customerName,
    project_name: payload.projectName,
    package_name: payload.packageName,
    payment_type: payload.paymentType,
    bank_name: payload.bankName,
    bank_credit_date: payload.bankCreditDate ? new Date(payload.bankCreditDate) : undefined,
    status: payload.status,
    payment_date: payload.paymentReceiptDate ? new Date(payload.paymentReceiptDate) : undefined,
    method: payload.paymentType,
    updated_at: new Date()
  };

  Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

  await db('payments').where({ id }).update(updateData);
  const updated = await db('payments').where({ id }).first();

  broadcastDashboardUpdate().catch(console.error);

  return res.json({ success: true, data: updated });
});

/**
 * DELETE PAYMENT
 */
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

  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  const payment = await db('payments as p')
    .leftJoin('sales_invoice_master as sim', function () {
      this.on('sim.id', '=', 'p.invoice_id');
    })
    .leftJoin('invoices as i', 'i.id', 'p.invoice_id')
    .where('p.id', id)
    .where(function () {
      this.where('sim.created_by', userId).whereNotNull('sim.created_by')
        .orWhere('i.created_by', userId).whereNotNull('i.created_by');
    })
    .select('p.id')
    .first();

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found or access denied'
    });
  }

  await db('payments').where({ id }).delete();
  broadcastDashboardUpdate().catch(console.error);

  return res.json({
    success: true,
    message: 'Payment deleted successfully'
  });
});

module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
};

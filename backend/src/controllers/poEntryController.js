const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');

// @desc    Get all PO entries
// @route   GET /api/po-entry
// @access  Private
const getPOEntries = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 50, q } = req.query;
  
  if (db) {
    const qb = db('po_entries');
    if (q) {
      qb.whereILike('customer_name', `%${q}%`)
        .orWhereILike('po_no', `%${q}%`)
        .orWhereILike('contract_agreement_no', `%${q}%`);
    }
    const rows = await qb.clone()
      .orderBy('created_at', 'desc')
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit))
      .select('*');
    const [{ c }] = await qb.clone().count({ c: '*' });
    return res.json({ 
      success: true, 
      data: rows, 
      meta: { 
        page: Number(page), 
        limit: Number(limit), 
        total: Number(c) 
      } 
    });
  }
  
  res.status(500).json({ success: false, message: 'Database not available' });
});

// @desc    Get single PO entry
// @route   GET /api/po-entry/:id
// @access  Private
const getPOEntry = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  
  if (db) {
    const row = await db('po_entries').where({ id }).first();
    if (!row) {
      return res.status(404).json({ success: false, message: 'PO Entry not found' });
    }
    return res.json({ success: true, data: row });
  }
  
  res.status(500).json({ success: false, message: 'Database not available' });
});

// @desc    Create PO entry
// @route   POST /api/po-entry
// @access  Private
const createPOEntry = asyncHandler(async (req, res) => {
  const db = getDb();
  const p = req.body || {};
  const now = new Date();
  const userId = req.user?.id || req.user?.userId;
  
  if (db) {
    const row = {
      customer_name: p.customerName || null,
      customer_address: p.customerAddress || null,
      state: p.state || null,
      country: p.country || null,
      gst_no: p.gstNo || null,
      business_type: p.businessType || null,
      segment: p.segment || null,
      zone: p.zone || null,
      contract_agreement_no: p.contractAgreementNo || null,
      ca_date: p.caDate || null,
      po_no: p.poNo || null,
      po_date: p.poDate || null,
      letter_of_intent_no: p.letterOfIntentNo || null,
      tender_reference_no: p.tenderReferenceNo || null,
      tender_date: p.tenderDate || null,
      description: p.description || null,
      payment_type: p.paymentType || null,
      payment_terms: p.paymentTerms || null,
      insurance_types: p.insuranceTypes || null,
      advance_bank_guarantee_no: p.advanceBankGuaranteeNo || null,
      abg_date: p.abgDate || null,
      performance_bank_guarantee_no: p.performanceBankGuaranteeNo || null,
      pbg_date: p.pbgDate || null,
      sales_manager: p.salesManager || null,
      sales_head: p.salesHead || null,
      agent_name: p.agentName || null,
      agent_commission: p.agentCommission || null,
      delivery_schedule: p.deliverySchedule || null,
      liquidated_damages: p.liquidatedDamages || null,
      po_signed_concern_name: p.poSignedConcernName || null,
      boq_as_per_po: p.boqAsPerPO || null,
      total_ex_works: p.totalExWorks ? parseFloat(p.totalExWorks) : null,
      freight_amount: p.freightAmount ? parseFloat(p.freightAmount) : null,
      gst: p.gst ? parseFloat(p.gst) : null,
      total_po_value: p.totalPOValue ? parseFloat(p.totalPOValue) : null,
      created_by: userId || null,
      created_at: now,
      updated_at: now
    };
    
    const [id] = await db('po_entries').insert(row);
    const newRow = await db('po_entries').where({ id }).first();
    
    return res.status(201).json({ success: true, data: newRow });
  }
  
  res.status(500).json({ success: false, message: 'Database not available' });
});

// @desc    Update PO entry
// @route   PUT /api/po-entry/:id
// @access  Private
const updatePOEntry = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const p = req.body || {};
  const now = new Date();
  
  if (db) {
    const existing = await db('po_entries').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'PO Entry not found' });
    }
    
    const updates = {
      customer_name: p.customerName !== undefined ? p.customerName : existing.customer_name,
      customer_address: p.customerAddress !== undefined ? p.customerAddress : existing.customer_address,
      state: p.state !== undefined ? p.state : existing.state,
      country: p.country !== undefined ? p.country : existing.country,
      gst_no: p.gstNo !== undefined ? p.gstNo : existing.gst_no,
      business_type: p.businessType !== undefined ? p.businessType : existing.business_type,
      segment: p.segment !== undefined ? p.segment : existing.segment,
      zone: p.zone !== undefined ? p.zone : existing.zone,
      contract_agreement_no: p.contractAgreementNo !== undefined ? p.contractAgreementNo : existing.contract_agreement_no,
      ca_date: p.caDate !== undefined ? p.caDate : existing.ca_date,
      po_no: p.poNo !== undefined ? p.poNo : existing.po_no,
      po_date: p.poDate !== undefined ? p.poDate : existing.po_date,
      letter_of_intent_no: p.letterOfIntentNo !== undefined ? p.letterOfIntentNo : existing.letter_of_intent_no,
      tender_reference_no: p.tenderReferenceNo !== undefined ? p.tenderReferenceNo : existing.tender_reference_no,
      tender_date: p.tenderDate !== undefined ? p.tenderDate : existing.tender_date,
      description: p.description !== undefined ? p.description : existing.description,
      payment_type: p.paymentType !== undefined ? p.paymentType : existing.payment_type,
      payment_terms: p.paymentTerms !== undefined ? p.paymentTerms : existing.payment_terms,
      insurance_types: p.insuranceTypes !== undefined ? p.insuranceTypes : existing.insurance_types,
      advance_bank_guarantee_no: p.advanceBankGuaranteeNo !== undefined ? p.advanceBankGuaranteeNo : existing.advance_bank_guarantee_no,
      abg_date: p.abgDate !== undefined ? p.abgDate : existing.abg_date,
      performance_bank_guarantee_no: p.performanceBankGuaranteeNo !== undefined ? p.performanceBankGuaranteeNo : existing.performance_bank_guarantee_no,
      pbg_date: p.pbgDate !== undefined ? p.pbgDate : existing.pbg_date,
      sales_manager: p.salesManager !== undefined ? p.salesManager : existing.sales_manager,
      sales_head: p.salesHead !== undefined ? p.salesHead : existing.sales_head,
      agent_name: p.agentName !== undefined ? p.agentName : existing.agent_name,
      agent_commission: p.agentCommission !== undefined ? p.agentCommission : existing.agent_commission,
      delivery_schedule: p.deliverySchedule !== undefined ? p.deliverySchedule : existing.delivery_schedule,
      liquidated_damages: p.liquidatedDamages !== undefined ? p.liquidatedDamages : existing.liquidated_damages,
      po_signed_concern_name: p.poSignedConcernName !== undefined ? p.poSignedConcernName : existing.po_signed_concern_name,
      boq_as_per_po: p.boqAsPerPO !== undefined ? p.boqAsPerPO : existing.boq_as_per_po,
      total_ex_works: p.totalExWorks !== undefined ? (p.totalExWorks ? parseFloat(p.totalExWorks) : null) : existing.total_ex_works,
      freight_amount: p.freightAmount !== undefined ? (p.freightAmount ? parseFloat(p.freightAmount) : null) : existing.freight_amount,
      gst: p.gst !== undefined ? (p.gst ? parseFloat(p.gst) : null) : existing.gst,
      total_po_value: p.totalPOValue !== undefined ? (p.totalPOValue ? parseFloat(p.totalPOValue) : null) : existing.total_po_value,
      updated_at: now
    };
    
    await db('po_entries').where({ id }).update(updates);
    const updated = await db('po_entries').where({ id }).first();
    
    return res.json({ success: true, data: updated });
  }
  
  res.status(500).json({ success: false, message: 'Database not available' });
});

// @desc    Delete PO entry
// @route   DELETE /api/po-entry/:id
// @access  Private
const deletePOEntry = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  
  if (db) {
    const existing = await db('po_entries').where({ id }).first();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'PO Entry not found' });
    }
    
    await db('po_entries').where({ id }).delete();
    return res.json({ success: true, message: 'PO Entry deleted successfully' });
  }
  
  res.status(500).json({ success: false, message: 'Database not available' });
});

module.exports = {
  getPOEntries,
  getPOEntry,
  createPOEntry,
  updatePOEntry,
  deletePOEntry
};

const { asyncHandler } = require('../middleware/errorHandler');
const { getDb } = require('../config/db');

function mapPOEntry(row) {
  if (!row) return null;
  const toNumber = (value) => (value === null || value === undefined ? null : Number(value));
  const parseJSON = (value) => {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (err) {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  };
  return {
    id: row.id,
    customerName: row.customer_name,
    legalEntityName: row.legal_entity_name,
    customerAddress: row.customer_address,
    district: row.district,
    state: row.state,
    country: row.country,
    pinCode: row.pin_code,
    gstNo: row.gst_no,
    businessType: row.business_type,
    businessUnit: row.business_unit,
    segment: row.segment,
    zone: row.zone,
    contractAgreementNo: row.contract_agreement_no,
    contractAgreementDate: row.contract_agreement_date,
    caDate: row.ca_date,
    poNo: row.po_no,
    poDate: row.po_date,
    letterOfIntentNo: row.letter_of_intent_no,
    letterOfIntentDate: row.letter_of_intent_date,
    letterOfAwardNo: row.letter_of_award_no,
    letterOfAwardDate: row.letter_of_award_date,
    tenderReferenceNo: row.tender_reference_no,
    tenderDate: row.tender_date,
    projectDescription: row.project_description,
    description: row.description,
    paymentType: row.payment_type,
    paymentTerms: row.payment_terms,
    paymentTermsClauseInPO: row.payment_terms_clause_in_po,
    insuranceType: row.insurance_type,
    insuranceTypes: row.insurance_types,
    policyNo: row.policy_no,
    policyDate: row.policy_date,
    policyCompany: row.policy_company,
    policyValidUpto: row.policy_valid_upto,
    policyClauseInPO: row.policy_clause_in_po,
    policyRemarks: row.policy_remarks,
    bankGuaranteeType: row.bank_guarantee_type,
    bankGuaranteeNo: row.bank_guarantee_no,
    bankGuaranteeDate: row.bank_guarantee_date,
    bankGuaranteeValue: toNumber(row.bank_guarantee_value),
    bankName: row.bank_name,
    bankGuaranteeValidity: row.bank_guarantee_validity,
    bankGuaranteeReleaseValidityClauseInPO: row.bank_guarantee_release_validity_clause_in_po,
    bankGuaranteeRemarks: row.bank_guarantee_remarks,
    advanceBankGuaranteeNo: row.advance_bank_guarantee_no,
    abgDate: row.abg_date,
    performanceBankGuaranteeNo: row.performance_bank_guarantee_no,
    pbgDate: row.pbg_date,
    salesManager: row.sales_manager,
    salesHead: row.sales_head,
    businessHead: row.business_head,
    projectManager: row.project_manager,
    projectHead: row.project_head,
    collectionIncharge: row.collection_incharge,
    salesAgentName: row.sales_agent_name,
    salesAgentCommission: toNumber(row.sales_agent_commission),
    collectionAgentName: row.collection_agent_name,
    collectionAgentCommission: toNumber(row.collection_agent_commission),
    agentName: row.agent_name,
    agentCommission: toNumber(row.agent_commission),
    deliverySchedule: row.delivery_schedule,
    deliveryScheduleClause: row.delivery_schedule_clause,
    liquidatedDamages: row.liquidated_damages,
    liquidatedDamagesClause: row.liquidated_damages_clause,
    lastDateOfDelivery: row.last_date_of_delivery,
    poValidity: row.po_validity,
    poSignedConcernName: row.po_signed_concern_name,
    boqAsPerPO: row.boq_as_per_po,
    boqEnabled: Boolean(row.boq_enabled),
    boqItems: parseJSON(row.boq_items),
    totalExWorks: toNumber(row.total_ex_works),
    totalFreightAmount: toNumber(row.total_freight_amount),
    freightAmount: toNumber(row.freight_amount),
    gst: toNumber(row.gst),
    totalPOValue: toNumber(row.total_po_value),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
      data: rows.map(mapPOEntry), 
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
    return res.json({ success: true, data: mapPOEntry(row) });
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
    // Try to find customer by name or GST to link PO entry
    let customerId = p.customerId || null;
    try {
    if (!customerId && p.customerName) {
      const customer = await db('customers')
          .where(function() {
            this.where('company_name', p.customerName)
        .orWhere('legal_entity_name', p.customerName)
          })
        .where('created_by', userId)
        .first();
      if (customer) {
        customerId = customer.id;
      }
    }
    if (!customerId && p.gstNo) {
      const customer = await db('customers')
        .where('gst_number', p.gstNo)
        .where('created_by', userId)
        .first();
      if (customer) {
        customerId = customer.id;
      }
      }
    } catch (customerLookupError) {
      // Customer lookup is optional, continue without linking
      console.warn('Customer lookup failed (non-critical):', customerLookupError.message);
    }

    // Handle BOQ items if provided
    const boqItems = p.boqItems || [];
    const boqData = boqItems.length > 0 ? JSON.stringify(boqItems) : null;

    const row = {
      customer_id: customerId,
      customer_name: p.customerName || null,
      legal_entity_name: p.legalEntityName || null,
      customer_address: p.customerAddress || null,
      district: p.district || null,
      state: p.state || null,
      country: p.country || null,
      pin_code: p.pinCode || null,
      gst_no: p.gstNo || null,
      business_type: p.businessType || null,
      business_unit: p.businessUnit || null,
      segment: p.segment || null,
      zone: p.zone || null,
      contract_agreement_no: p.contractAgreementNo || null,
      contract_agreement_date: p.contractAgreementDate || null,
      ca_date: p.caDate || null,
      po_no: p.poNo || null,
      po_date: p.poDate || null,
      letter_of_intent_no: p.letterOfIntentNo || null,
      letter_of_intent_date: p.letterOfIntentDate || null,
      letter_of_award_no: p.letterOfAwardNo || null,
      letter_of_award_date: p.letterOfAwardDate || null,
      tender_reference_no: p.tenderReferenceNo || null,
      tender_date: p.tenderDate || null,
      project_description: p.projectDescription || null,
      description: p.description || null,
      payment_type: p.paymentType || null,
      payment_terms: p.paymentTerms || null,
      payment_terms_clause_in_po: p.paymentTermsClauseInPO || null,
      insurance_type: p.insuranceType || null,
      policy_no: p.policyNo || null,
      policy_date: p.policyDate || null,
      policy_company: p.policyCompany || null,
      policy_valid_upto: p.policyValidUpto || null,
      policy_clause_in_po: p.policyClauseInPO || null,
      policy_remarks: p.policyRemarks || null,
      bank_guarantee_type: p.bankGuaranteeType || null,
      bank_guarantee_no: p.bankGuaranteeNo || null,
      bank_guarantee_date: p.bankGuaranteeDate || null,
      bank_guarantee_value: p.bankGuaranteeValue ? parseFloat(p.bankGuaranteeValue) : null,
      bank_name: p.bankName || null,
      bank_guarantee_validity: p.bankGuaranteeValidity || null,
      bank_guarantee_release_validity_clause_in_po: p.bankGuaranteeReleaseValidityClauseInPO || null,
      bank_guarantee_remarks: p.bankGuaranteeRemarks || null,
      insurance_types: p.insuranceTypes || null,
      advance_bank_guarantee_no: p.advanceBankGuaranteeNo || null,
      abg_date: p.abgDate || null,
      performance_bank_guarantee_no: p.performanceBankGuaranteeNo || null,
      pbg_date: p.pbgDate || null,
      sales_manager: p.salesManager || null,
      sales_head: p.salesHead || null,
      business_head: p.businessHead || null,
      project_manager: p.projectManager || null,
      project_head: p.projectHead || null,
      collection_incharge: p.collectionIncharge || null,
      sales_agent_name: p.salesAgentName || null,
      sales_agent_commission: p.salesAgentCommission ? parseFloat(p.salesAgentCommission) : null,
      collection_agent_name: p.collectionAgentName || null,
      collection_agent_commission: p.collectionAgentCommission ? parseFloat(p.collectionAgentCommission) : null,
      agent_name: p.agentName || null,
      agent_commission: p.agentCommission ? parseFloat(p.agentCommission) : null,
      delivery_schedule: p.deliverySchedule || null,
      delivery_schedule_clause: p.deliveryScheduleClause || null,
      liquidated_damages: p.liquidatedDamages || null,
      liquidated_damages_clause: p.liquidatedDamagesClause || null,
      last_date_of_delivery: p.lastDateOfDelivery || null,
      po_validity: p.poValidity || null,
      po_signed_concern_name: p.poSignedConcernName || null,
      boq_as_per_po: p.boqAsPerPO || null,
      boq_enabled: p.boqEnabled ? 1 : 0,
      boq_items: boqData,
      total_ex_works: p.totalExWorks ? parseFloat(p.totalExWorks) : null,
      total_freight_amount: p.totalFreightAmount ? parseFloat(p.totalFreightAmount) : null,
      freight_amount: p.freightAmount ? parseFloat(p.freightAmount) : null,
      gst: p.gst ? parseFloat(p.gst) : null,
      total_po_value: p.totalPOValue ? parseFloat(p.totalPOValue) : null,
      created_by: userId || null,
      created_at: now,
      updated_at: now
    };
    
    try {
      // Only insert columns that exist in the database
      // Remove undefined and null values that might cause issues
      const cleanRow = {};
      Object.keys(row).forEach(key => {
        if (row[key] !== undefined) {
          cleanRow[key] = row[key];
        }
      });
      
      const [id] = await db('po_entries').insert(cleanRow);
    const newRow = await db('po_entries').where({ id }).first();
    
    return res.status(201).json({ success: true, data: mapPOEntry(newRow) });
    } catch (error) {
      console.error('Error creating PO entry:', error);
      console.error('Error code:', error.code);
      console.error('Error sqlMessage:', error.sqlMessage);
      console.error('Row data keys:', Object.keys(row));
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to create PO entry';
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        errorMessage = `Database column error: ${error.sqlMessage}. Please run migrations.`;
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        errorMessage = 'PO entries table not found. Please run migrations.';
      } else if (error.sqlMessage) {
        errorMessage = `Database error: ${error.sqlMessage}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return res.status(500).json({ 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          sqlMessage: error.sqlMessage,
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
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
    
    return res.json({ success: true, data: mapPOEntry(updated) });
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

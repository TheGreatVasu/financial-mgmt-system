const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const { broadcastDashboardUpdate } = require('../services/socketService');
const excelService = require('../services/excelService');
const path = require('path');
const fs = require('fs');

const ROLE_MAP = {
  'sales manager': 'sales_manager',
  'sales head': 'sales_head',
  'business head': 'business_head',
  'collection person incharge': 'collection_incharge',
  'collection incharge': 'collection_incharge',
  'sales agent': 'sales_agent',
  'collection agent': 'collection_agent',
  'primary': 'primary',
  'customer': 'customer_contact',
  'customer contact': 'customer_contact'
};

function toSnakeRole(role = '') {
  if (!role) return 'custom';
  const normalized = role.trim().toLowerCase();
  return ROLE_MAP[normalized] || normalized.replace(/\s+/g, '_') || 'custom';
}

function safeJsonParse(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
}

function extractMasterPayload(payload = {}) {
  const metadata = payload.metadata || {};
  return {
    metadata,
    companyProfile: metadata.companyProfile || {},
    customerProfile: metadata.customerProfile || {},
    paymentTerms: metadata.paymentTerms || [],
    teamProfiles: metadata.teamProfiles || []
  };
}

function deriveBaseCustomerRow(payload = {}, masterPayload = {}, existing = {}) {
  const { companyProfile = {}, customerProfile = {}, teamProfiles = [] } = masterPayload || {};
  const fallbackContact =
    payload.name ||
    customerProfile.contactPersonName ||
    companyProfile.primaryContact?.name ||
    existing.name ||
    null;
  const companyName =
    payload.companyName ||
    companyProfile.companyName ||
    companyProfile.legalEntityName ||
    existing.company_name ||
    'Unnamed Customer';
  const fallbackEmail =
    payload.email ||
    customerProfile.emailId ||
    companyProfile.primaryContact?.email ||
    existing.email ||
    'unknown@example.com';
  const fallbackPhone =
    payload.phone ||
    customerProfile.contactPersonNumber ||
    companyProfile.primaryContact?.contactNumber ||
    existing.phone ||
    'NA';
  const gstCandidate =
    payload.gstNumber ||
    companyProfile.gstNumbers?.find((gst) => gst) ||
    companyProfile.corporateOffice?.gstNumber ||
    existing.gst_number ||
    null;
  const country =
    payload.country ||
    companyProfile.country ||
    customerProfile.country ||
    existing.country ||
    null;
  const state =
    payload.state ||
    companyProfile.state ||
    customerProfile.state ||
    existing.state ||
    null;
  const zone = payload.zone || companyProfile.zone || customerProfile.zone || existing.zone || null;
  const segment =
    payload.segment ||
    customerProfile.segment ||
    companyProfile.segment ||
    existing.segment ||
    null;
  const businessType =
    payload.businessType ||
    companyProfile.businessType ||
    customerProfile.businessType ||
    existing.business_type ||
    null;
  const customerAddress =
    payload.customerAddress ||
    companyProfile.correspondenceAddress ||
    existing.customer_address ||
    null;
  const salesManager =
    payload.salesManager ||
    (teamProfiles.find((member) => toSnakeRole(member.role) === 'sales_manager') || {}).name ||
    existing.sales_manager ||
    null;
  const salesHead =
    payload.salesHead ||
    (teamProfiles.find((member) => toSnakeRole(member.role) === 'sales_head') || {}).name ||
    existing.sales_head ||
    null;

  return {
    name: fallbackContact,
    company_name: companyName,
    email: fallbackEmail,
    phone: fallbackPhone,
    gst_number: gstCandidate,
    customer_address: customerAddress,
    country,
    state,
    zone,
    segment,
    business_type: businessType,
    sales_manager: salesManager,
    sales_head: salesHead
  };
}

async function replaceCustomerMasterData(trx, customerId, masterPayload) {
  const {
    companyProfile = {},
    customerProfile = {},
    paymentTerms = [],
    teamProfiles = []
  } = masterPayload || {};

  await trx('customer_master_profiles').where({ customer_id: customerId }).delete();
  if (companyProfile && (companyProfile.companyName || companyProfile.legalEntityName)) {
    await trx('customer_master_profiles').insert({
      customer_id: customerId,
      company_name: companyProfile.companyName || companyProfile.legalEntityName || '',
      legal_entity_name: companyProfile.legalEntityName || companyProfile.companyName || '',
      corporate_office: companyProfile.corporateOffice?.addressLine || null,
      marketing_office: companyProfile.marketingOffice?.addressLine || null,
      correspondence_address: companyProfile.correspondenceAddress || null,
      gst_numbers: companyProfile.gstNumbers?.length ? JSON.stringify(companyProfile.gstNumbers) : null,
      metadata: JSON.stringify(companyProfile || null)
    });
  }

  await trx('customer_addresses').where({ customer_id: customerId }).delete();
  const addresses = [];
  (companyProfile.siteOffices || []).forEach((site, index) => {
    if (!site) return;
    addresses.push({
      customer_id: customerId,
      address_type: 'site_office',
      label: site.label || `Site Office ${index + 1}`,
      address_line: site.addressLine || null,
      contact_number: site.contactNumber || null,
      gst_number: site.gstNumber || null
    });
  });
  (companyProfile.plantAddresses || []).forEach((plant, index) => {
    if (!plant) return;
    addresses.push({
      customer_id: customerId,
      address_type: 'plant',
      label: plant.label || `Plant Address ${index + 1}`,
      address_line: plant.addressLine || null,
      contact_number: plant.contactNumber || null,
      gst_number: plant.gstNumber || null
    });
  });
  if (addresses.length) {
    await trx('customer_addresses').insert(addresses);
  }

  await trx('customer_contacts').where({ customer_id: customerId }).delete();
  const contacts = [];
  if (companyProfile.primaryContact?.name) {
    contacts.push({
      customer_id: customerId,
      contact_role: 'primary',
      name: companyProfile.primaryContact.name,
      email: companyProfile.primaryContact.email || null,
      phone: companyProfile.primaryContact.contactNumber || null,
      department: companyProfile.primaryContact.department || null,
      designation: companyProfile.primaryContact.designation || null,
      job_role: companyProfile.primaryContact.jobRole || null,
      segment: companyProfile.primaryContact.segment || null,
      metadata: JSON.stringify(companyProfile.primaryContact)
    });
  }
  if (customerProfile.contactPersonName) {
    contacts.push({
      customer_id: customerId,
      contact_role: 'customer_contact',
      name: customerProfile.contactPersonName,
      email: customerProfile.emailId || null,
      phone: customerProfile.contactPersonNumber || null,
      department: customerProfile.department || null,
      designation: customerProfile.designation || null,
      job_role: customerProfile.jobRole || null,
      segment: customerProfile.segment || null,
      metadata: JSON.stringify(customerProfile)
    });
  }
  (teamProfiles || []).forEach((member) => {
    if (!member) return;
    contacts.push({
      customer_id: customerId,
      contact_role: toSnakeRole(member.role),
      name: member.name || null,
      email: member.email || null,
      phone: member.contactNumber || null,
      department: member.department || null,
      designation: member.designation || null,
      job_role: member.jobRole || null,
      segment: member.segment || null,
      metadata: JSON.stringify(member)
    });
  });
  if (contacts.length) {
    await trx('customer_contacts').insert(contacts);
  }

  await trx('customer_payment_terms').where({ customer_id: customerId }).delete();
  const paymentRows = (paymentTerms || [])
    .filter((term) => term && term.title)
    .map((term) => ({
      customer_id: customerId,
      title: term.title,
      term_type: term.type || term.term_type || null,
      credit_days: term.creditDays ?? null,
      applicable_for: term.applicableFor || null,
      description: term.description || null,
      metadata: JSON.stringify(term)
    }));
  if (paymentRows.length) {
    await trx('customer_payment_terms').insert(paymentRows);
  }
}

async function hydrateCustomer(db, customerId, userId) {
  const baseQuery = db('customers').where({ id: customerId });
  if (userId) {
    baseQuery.where('created_by', userId);
  }
  const base = await baseQuery.first();
  if (!base) return null;

  const [profile, addresses, contacts, paymentTerms] = await Promise.all([
    db('customer_master_profiles').where({ customer_id: customerId }).first(),
    db('customer_addresses').where({ customer_id: customerId }).orderBy('id', 'asc'),
    db('customer_contacts').where({ customer_id: customerId }).orderBy('id', 'asc'),
    db('customer_payment_terms').where({ customer_id: customerId }).orderBy('id', 'asc')
  ]);

  return {
    ...base,
    metadata: safeJsonParse(base.metadata),
    masterProfile: profile
      ? {
          ...profile,
          gst_numbers: safeJsonParse(profile.gst_numbers),
          metadata: safeJsonParse(profile.metadata)
        }
      : null,
    siteOffices: (addresses || []).filter((addr) => addr.address_type === 'site_office'),
    plantAddresses: (addresses || []).filter((addr) => addr.address_type === 'plant'),
    contacts: (contacts || []).map((contact) => ({
      ...contact,
      metadata: safeJsonParse(contact.metadata)
    })),
    paymentTerms: (paymentTerms || []).map((term) => ({
      ...term,
      metadata: safeJsonParse(term.metadata)
    }))
  };
}


const getCustomers = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 50, q, includeMaster } = req.query;
  
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
    const rawRows = await qb
      .clone()
      .orderBy('created_at', 'desc')
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit))
      .select('*');

    let rows;
    if (includeMaster && includeMaster !== '0' && includeMaster !== 'false') {
      const hydrated = await Promise.all(
        rawRows.map((row) => hydrateCustomer(db, row.id, userId))
      );
      rows = hydrated.filter(Boolean);
    } else {
      rows = rawRows.map((row) => ({
        ...row,
        metadata: safeJsonParse(row.metadata)
      }));
    }
    const [{ c }] = await qb.clone().count({ c: '*' });
    return res.json({ success: true, data: hydratedRows, meta: { page: Number(page), limit: Number(limit), total: Number(c) } });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
});

const getCustomerMasterOptions = asyncHandler(async (req, res) => {
  const db = getDb();
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to view master data'
    });
  }

  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  const rows = await db('customers')
    .where('created_by', userId)
    .whereNotNull('created_by')
    .select('id')
    .orderBy('company_name', 'asc');

  const hydrated = (
    await Promise.all(rows.map((row) => hydrateCustomer(db, row.id, userId)))
  ).filter(Boolean);

  const customers = hydrated.map((customer) => ({
    id: customer.id,
    name: customer.name,
    companyName: customer.company_name,
    customerAddress: customer.customer_address,
    country: customer.country,
    state: customer.state,
    zone: customer.zone,
    segment: customer.segment,
    businessType: customer.business_type,
    gstNumber: customer.gst_number,
    salesManager: customer.sales_manager,
    salesHead: customer.sales_head,
    metadata: customer.metadata,
    masterProfile: customer.masterProfile,
    siteOffices: customer.siteOffices,
    plantAddresses: customer.plantAddresses,
    contacts: customer.contacts,
    paymentTerms: customer.paymentTerms
  }));

  const unique = (arr = []) =>
    Array.from(new Set(arr.filter((item) => typeof item === 'string' && item.trim().length)));

  const segments = unique(customers.map((c) => c.segment));
  const zones = unique(customers.map((c) => c.zone));
  const businessTypes = unique(customers.map((c) => c.businessType));
  const countries = unique(customers.map((c) => c.country));

  const paymentTerms = unique(
    customers.flatMap((customer) => (customer.paymentTerms || []).map((term) => term.title))
  );

  const salesContacts = unique(
    customers.flatMap((customer) => [
      customer.salesManager,
      customer.salesHead,
      ...(customer.contacts || []).map((contact) => contact.name)
    ])
  );

  res.json({
    success: true,
    data: {
      customers,
      segments,
      zones,
      businessTypes,
      paymentTerms,
      countries,
      salesContacts
    }
  });
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
    const customer = await hydrateCustomer(db, id, userId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    return res.json({ success: true, data: customer });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
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
    const masterPayload = extractMasterPayload(p);
    const baseRow = deriveBaseCustomerRow(p, masterPayload);
    const trx = await db.transaction();
    try {
      const [id] = await trx('customers').insert({
        ...baseRow,
        metadata: masterPayload.metadata && Object.keys(masterPayload.metadata).length
          ? JSON.stringify(masterPayload.metadata)
          : null,
        created_by: userId,
        created_at: now
      });

      await replaceCustomerMasterData(trx, id, masterPayload);
      await trx.commit();

      const customer = await hydrateCustomer(db, id, userId);
      // Emit dashboard update
      broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
      return res.status(201).json({ success: true, data: customer });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
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
    const existing = await db('customers')
      .where({ id })
      .where('created_by', userId)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found or you do not have permission to update it'
      });
    }

    const masterPayload = extractMasterPayload(p);
    const derivedRow = deriveBaseCustomerRow(p, masterPayload, existing);
    const trx = await db.transaction();
    try {
      await trx('customers')
        .where({ id })
        .update({
          ...derivedRow,
          metadata:
            masterPayload.metadata && Object.keys(masterPayload.metadata).length
              ? JSON.stringify(masterPayload.metadata)
              : existing.metadata
        });

      await replaceCustomerMasterData(trx, id, masterPayload);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    const customer = await hydrateCustomer(db, id, userId);
    // Emit dashboard update
    broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
    return res.json({ success: true, data: customer });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
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
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
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
  downloadPOEntryTemplate,
  getCustomerMasterOptions
};

const { getDb } = require('../config/db');

const memoryStore = { byUser: {} };

async function ensureTable(db) {
  const exists = await db.schema.hasTable('master_data');
  if (!exists) {
    await db.schema.createTable('master_data', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().unique();
      table.text('data', 'longtext').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
  }
}

function hasDb() {
  return Boolean(getDb());
}

function safeParse(value, fallback = {}) {
  try {
    if (!value) return fallback;
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

async function loadFromDb(userId) {
  const db = getDb();
  if (!db) return null;
  await ensureTable(db);
  const row = await db('master_data').where({ user_id: userId }).first();
  if (!row) return null;
  return safeParse(row.data, {});
}

async function saveToDb(userId, data) {
  const db = getDb();
  if (!db) return null;
  await ensureTable(db);
  const payload = {
    user_id: userId,
    data: JSON.stringify(data || {}),
    updated_at: db.fn.now(),
  };
  const existing = await db('master_data').where({ user_id: userId }).first();
  if (existing) {
    await db('master_data').where({ user_id: userId }).update(payload);
  } else {
    payload.created_at = db.fn.now();
    await db('master_data').insert(payload);
  }
  return data;
}

async function getMasterData(userId) {
  if (!userId) throw new Error('User ID is required');
  const db = getDb();
  if (db) {
    return (await loadFromDb(userId)) || {};
  }
  return memoryStore.byUser[userId] || {};
}

async function saveMasterData(userId, data) {
  if (!userId) throw new Error('User ID is required');
  const db = getDb();
  if (db) {
    return saveToDb(userId, data);
  }
  memoryStore.byUser[userId] = data || {};
  return memoryStore.byUser[userId];
}

async function mergeSection(userId, sectionKey, payload) {
  const existing = (await getMasterData(userId)) || {};
  const next = { ...existing, [sectionKey]: payload };
  return saveMasterData(userId, next);
}

async function getStatus(userId) {
  const data = (await getMasterData(userId)) || {};
  const sections = ['companyProfile', 'customerProfile', 'paymentTerms', 'teamProfiles', 'additionalStep'];
  const completion = {};
  sections.forEach((section) => {
    completion[section] = Boolean(data[section] && Object.keys(data[section]).length);
  });
  return {
    ...completion,
    completed: sections.filter((s) => completion[s]).length,
    total: sections.length,
    percent: Math.round((sections.filter((s) => completion[s]).length / sections.length) * 100),
  };
}

/**
 * Sync customer profile from master data to customers table
 * This ensures customer data from master data wizard is available in the customers table
 */
async function syncMasterDataToCustomers(userId, masterData) {
  const db = getDb();
  if (!db) {
    console.warn('Database not available, skipping customer sync');
    return null;
  }

  const customerProfile = masterData.customerProfile || {};
  if (!customerProfile.customerName && !customerProfile.legalEntityName) {
    // No customer data to sync
    return null;
  }

  const companyName = customerProfile.customerName || customerProfile.legalEntityName;
  const legalEntityName = customerProfile.legalEntityName || customerProfile.customerName;
  
  // Check if customer already exists by name or GST (only for this user)
  let existingCustomer = null;
  if (customerProfile.gstNumber) {
    existingCustomer = await db('customers')
      .where('gst_number', customerProfile.gstNumber)
      .where('created_by', userId)
      .whereNotNull('created_by')
      .first();
  }
  
  if (!existingCustomer && companyName) {
    existingCustomer = await db('customers')
      .where('company_name', companyName)
      .where('created_by', userId)
      .whereNotNull('created_by')
      .first();
  }

  const customerData = {
    company_name: companyName,
    legal_entity_name: legalEntityName,
    customer_address: customerProfile.corporateOfficeAddress || customerProfile.customerAddress || '',
    district: customerProfile.district || '',
    state: customerProfile.state || '',
    country: customerProfile.country || 'India',
    pin_code: customerProfile.pinCode || '',
    gst_number: customerProfile.gstNumber || null,
    segment: customerProfile.segment || null,
    zone: customerProfile.zone || null,
    contact_email: customerProfile.emailId || customerProfile.contactEmail || null,
    contact_phone: customerProfile.contactNumber || customerProfile.contactPhone || null,
    status: 'active',
    created_by: userId,
    updated_at: db.fn.now(),
  };

  if (existingCustomer) {
    // Update existing customer (ensure created_by is preserved)
    await db('customers')
      .where('id', existingCustomer.id)
      .where('created_by', userId) // Extra safety check
      .update({
        ...customerData,
        created_by: userId, // Ensure created_by is set
        updated_at: db.fn.now(),
      });
    console.log(`Updated existing customer ${companyName} (ID: ${existingCustomer.id}) for user ${userId}`);
    return { id: existingCustomer.id, action: 'updated' };
  } else {
    // Create new customer
    customerData.created_at = db.fn.now();
    customerData.created_by = userId; // Ensure created_by is set
    const [id] = await db('customers').insert(customerData);
    console.log(`Created new customer ${companyName} (ID: ${id}) for user ${userId}`);
    return { id, action: 'created' };
  }
}

module.exports = {
  hasDb,
  getMasterData,
  saveMasterData,
  mergeSection,
  getStatus,
  syncMasterDataToCustomers,
};


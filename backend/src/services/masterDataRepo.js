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

module.exports = {
  hasDb,
  getMasterData,
  saveMasterData,
  mergeSection,
  getStatus,
};


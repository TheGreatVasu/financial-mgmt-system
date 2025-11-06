const { getDb } = require('../config/db');

// In-memory fallback when MySQL is not configured
const memoryStore = { seq: 1, items: [] };

function hasDb() {
  return Boolean(getDb());
}

async function createActionItem({ actionId, title, ownerName, ownerEmail, dueDate, status = 'open', notes }) {
  const db = getDb();
  if (!db) {
    const id = String(memoryStore.seq++);
    const row = { id, actionId, title, ownerName, ownerEmail, dueDate, status, notes, createdAt: new Date().toISOString() };
    memoryStore.items.push(row);
    return row;
  }
  const [id] = await db('action_items').insert({
    action_id: actionId,
    title,
    owner_name: ownerName,
    owner_email: ownerEmail,
    due_date: dueDate,
    status,
    notes,
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });
  return await findById(id);
}

async function findById(id) {
  const db = getDb();
  if (!db) return memoryStore.items.find(i => i.id === String(id)) || null;
  const row = await db('action_items')
    .select('id','action_id as actionId','title','owner_name as ownerName','owner_email as ownerEmail','due_date as dueDate','status','notes','created_at as createdAt','updated_at as updatedAt')
    .where({ id })
    .first();
  return row || null;
}

async function list({ ownerEmail, status }) {
  const db = getDb();
  if (!db) {
    return memoryStore.items.filter(i => (!ownerEmail || i.ownerEmail === ownerEmail) && (!status || i.status === status));
  }
  let q = db('action_items')
    .select('id','action_id as actionId','title','owner_name as ownerName','owner_email as ownerEmail','due_date as dueDate','status','notes','created_at as createdAt','updated_at as updatedAt')
    .orderBy('due_date','asc');
  if (ownerEmail) q = q.where({ owner_email: ownerEmail });
  if (status) q = q.andWhere({ status });
  return await q;
}

async function update(id, changes) {
  const db = getDb();
  if (!db) {
    const idx = memoryStore.items.findIndex(i => i.id === String(id));
    if (idx === -1) return null;
    memoryStore.items[idx] = { ...memoryStore.items[idx], ...changes };
    return memoryStore.items[idx];
  }
  const payload = {};
  if (changes.title != null) payload.title = changes.title;
  if (changes.ownerName != null) payload.owner_name = changes.ownerName;
  if (changes.ownerEmail != null) payload.owner_email = changes.ownerEmail;
  if (changes.dueDate != null) payload.due_date = changes.dueDate;
  if (changes.status != null) payload.status = changes.status;
  if (changes.notes != null) payload.notes = changes.notes;
  if (Object.keys(payload).length === 0) return await findById(id);
  await db('action_items').where({ id }).update({ ...payload, updated_at: db.fn.now() });
  return await findById(id);
}

module.exports = { hasDb, createActionItem, findById, list, update };



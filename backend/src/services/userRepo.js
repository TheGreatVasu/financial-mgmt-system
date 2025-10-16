const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');

function hasDb() {
  return Boolean(getDb());
}

async function findByEmailWithPassword(email) {
  const db = getDb();
  if (!db) return null;
  return db('users').where({ email }).first();
}

async function findById(id) {
  const db = getDb();
  if (!db) return null;
  return db('users').select('id','username','email','first_name as firstName','last_name as lastName','role','is_active as isActive','last_login as lastLogin').where({ id }).first();
}

async function isEmailTaken(email, excludeId) {
  const db = getDb();
  if (!db) return false;
  const q = db('users').where({ email });
  if (excludeId) q.andWhereNot({ id: excludeId });
  const row = await q.first('id');
  return Boolean(row);
}

async function createUser({ username, email, password, firstName, lastName }) {
  const db = getDb();
  if (!db) return null;
  const hash = await bcrypt.hash(password, 12);
  const [id] = await db('users').insert({
    username,
    email,
    password_hash: hash,
    first_name: firstName,
    last_name: lastName,
    role: 'admin',
    is_active: 1,
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });
  return await findById(id);
}

async function updateProfileById(id, { firstName, lastName, email }) {
  const db = getDb();
  if (!db) return null;
  await db('users').where({ id }).update({
    first_name: firstName,
    last_name: lastName,
    email,
    updated_at: db.fn.now()
  });
  return await findById(id);
}

async function updateLastLogin(id) {
  const db = getDb();
  if (!db) return;
  await db('users').where({ id }).update({ last_login: db.fn.now(), updated_at: db.fn.now() });
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function changePassword(id, newPassword) {
  const db = getDb();
  if (!db) return;
  const hash = await bcrypt.hash(newPassword, 12);
  await db('users').where({ id }).update({ password_hash: hash, updated_at: db.fn.now() });
}

async function audit({ action, entity, entityId, performedBy, ipAddress, userAgent, changes }) {
  const db = getDb();
  if (!db) return; // no-op in mock mode
  await db('audit_logs').insert({
    action,
    entity,
    entity_id: entityId,
    performed_by: performedBy,
    ip_address: ipAddress,
    user_agent: userAgent,
    changes: changes ? JSON.stringify(changes) : null,
    created_at: db.fn.now(),
  });
}

module.exports = {
  hasDb,
  findByEmailWithPassword,
  findById,
  isEmailTaken,
  createUser,
  updateProfileById,
  updateLastLogin,
  comparePassword,
  changePassword,
  audit,
};



const { getDb } = require('../config/db');

function formatSequence(prefix, sequence, width = 4) {
  return `${prefix}${String(sequence).padStart(width, '0')}`;
}

async function getNextSequence(db, table, column, prefix, width) {
  const likeValue = `${prefix}%`;
  const substringStart = prefix.length + 1; // SUBSTRING positions are 1-based
  const [{ maxSeq }] = await db(table)
    .where(column, 'like', likeValue)
    .max({
      maxSeq: db.raw('CAST(SUBSTRING(??, ?) AS UNSIGNED)', [column, substringStart])
    });

  return (maxSeq || 0) + 1;
}

function fallbackSequence(prefix, width) {
  const suffix = String(Date.now()).slice(-width);
  return `${prefix}${suffix}`;
}

async function generateInvoiceNumber(issueDate = new Date()) {
  const year = issueDate.getFullYear();
  const prefix = `INV-${year}`;
  const db = getDb();

  if (!db) {
    return fallbackSequence(prefix, 4);
  }

  const sequence = await getNextSequence(db, 'invoices', 'invoice_number', prefix, 4);
  return formatSequence(prefix, sequence, 4);
}

async function generateInvoiceKeyId(prefix = 'KID') {
  const normalizedPrefix = `${prefix.toUpperCase()}-`;
  const db = getDb();

  if (!db) {
    return fallbackSequence(normalizedPrefix, 5);
  }

  const sequence = await getNextSequence(db, 'invoices', 'key_id', normalizedPrefix, 5);
  return formatSequence(normalizedPrefix, sequence, 5);
}

module.exports = { generateInvoiceNumber, generateInvoiceKeyId };


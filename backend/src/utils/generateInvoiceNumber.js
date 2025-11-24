const { getDb } = require('../config/db');

/**
 * Generates a sequential invoice number in the format: INV-YYYYNNNN
 * Where:
 * - INV: Invoice prefix
 * - YYYY: 4-digit year
 * - NNNN: 4-digit sequential number (resets each year)
 * 
 * Examples:
 * - INV-20250001
 * - INV-20250002
 * - INV-20260001 (resets when year changes)
 * 
 * @param {Date} issueDate - The issue date of the invoice (defaults to current date)
 * @returns {Promise<string>} The generated invoice number
 */
async function generateInvoiceNumber(issueDate = new Date()) {
  const db = getDb();
  const year = new Date(issueDate).getFullYear();
  const yearPrefix = `INV-${year}`;
  
  if (db) {
    // MySQL/Knex implementation
    // Find all invoices that match the year prefix pattern
    const invoices = await db('invoices')
      .where('invoice_number', 'like', `${yearPrefix}%`)
      .orderBy('id', 'desc')
      .select('invoice_number');
    
    // Extract the sequence number from existing invoices
    let maxSequence = 0;
    
    invoices.forEach(inv => {
      const invNum = inv.invoice_number || '';
      if (invNum.startsWith(yearPrefix)) {
        // Extract sequence part after the year (e.g., "INV-2025" -> "0001")
        const sequencePart = invNum.substring(yearPrefix.length);
        const sequence = parseInt(sequencePart, 10);
        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    });
    
    // Generate next sequence number
    const nextSequence = maxSequence + 1;
    return `${yearPrefix}${String(nextSequence).padStart(4, '0')}`;
  } else {
    // Database not available - return a timestamp-based number
    const timestamp = Date.now();
    return `${yearPrefix}${String(timestamp % 10000).padStart(4, '0')}`;
  }
}

module.exports = { generateInvoiceNumber };


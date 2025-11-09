/**
 * Script to ensure invoice table has all required columns
 * Run this if you get "Unknown column" errors
 */

const { getDb } = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function ensureColumns() {
  const db = getDb();
  if (!db) {
    console.error('Database not connected');
    process.exit(1);
  }

  try {
    console.log('Checking invoice table columns...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '202510150005_add_invoice_items.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    console.log('Running migration to add missing columns...');
    await db.raw(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('Invoice table now has: items, notes, po_ref, payment_terms columns');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Columns already exist, no action needed');
      process.exit(0);
    } else {
      console.error('Full error:', error);
      process.exit(1);
    }
  }
}

ensureColumns();


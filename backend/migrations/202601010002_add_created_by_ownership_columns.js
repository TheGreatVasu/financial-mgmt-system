/**
 * PRODUCTION SCHEMA FIX: Add created_by columns to tables that reference users
 * 
 * This migration adds the `created_by` column to tables that the backend code
 * references for row-level access control and data ownership tracking.
 * 
 * Tables being updated:
 * - customers: Foreign key to users.id, tracks which user created each customer
 * - invoices: Foreign key to users.id, tracks invoice creator (may already have, ensure it exists)
 * - payment_moms: Foreign key to users.id, tracks MOM creator
 * - po_entries: Foreign key to users.id, tracks PO entry creator (may already have)
 * - sales_invoice_master: Foreign key to users.id, tracks sales invoice creator
 * 
 * All `created_by` columns are nullable to maintain backward compatibility with existing data.
 * This allows historic data without ownership tracking to remain intact.
 */

const TABLES = [
  { name: 'customers', column: 'created_by' },
  { name: 'invoices', column: 'created_by' },
  { name: 'payment_moms', column: 'created_by' },
  { name: 'po_entries', column: 'created_by' },
  { name: 'sales_invoice_master', column: 'created_by' }
];

async function ensureColumn(knex, tableName, columnName, definitionCallback) {
  const hasTable = await knex.schema.hasTable(tableName);
  if (!hasTable) {
    console.warn(`Table ${tableName} does not exist, skipping column ${columnName}`);
    return;
  }

  const exists = await knex.schema.hasColumn(tableName, columnName);
  if (!exists) {
    console.log(`Adding column ${columnName} to ${tableName} table`);
    await knex.schema.alterTable(tableName, definitionCallback);
  } else {
    console.log(`Column ${columnName} already exists in ${tableName}, skipping`);
  }
}

exports.up = async function (knex) {
  for (const { name: tableName, column: columnName } of TABLES) {
    await ensureColumn(knex, tableName, columnName, (table) => {
      table.bigInteger(columnName).unsigned().nullable();
    });
  }
};

exports.down = async function (knex) {
  // Rollback by removing all created_by columns
  for (const { name: tableName, column: columnName } of TABLES) {
    const hasTable = await knex.schema.hasTable(tableName);
    if (!hasTable) continue;

    const exists = await knex.schema.hasColumn(tableName, columnName);
    if (exists) {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropColumn(columnName);
      });
    }
  }
};

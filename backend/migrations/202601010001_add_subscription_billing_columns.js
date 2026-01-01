/**
 * PRODUCTION SCHEMA FIX: Add subscription and billing columns to users table
 * 
 * This migration adds all subscription-related columns that the backend code
 * expects but are missing in the production database schema.
 * 
 * Columns being added (all nullable with sensible defaults):
 * - plan_id: Current subscription plan identifier
 * - plan_name: Human-readable plan name
 * - plan_price: Monthly plan cost
 * - plan_interval: Billing interval (monthly, yearly, etc.)
 * - storage_used: Current storage usage in GB
 * - storage_limit: Maximum allowed storage in GB
 * - invoices_this_month: Count of invoices created this billing period
 * - invoice_limit: Maximum invoices allowed per billing period
 * - billing_status: Current billing status (active, suspended, etc.)
 * - billing_renews_at: Next billing renewal date
 * - payment_method: Stored payment method identifier (if using payment processor)
 * 
 * All columns default to free plan values to avoid breaking existing users.
 */

const TABLE = 'users';

async function ensureColumn(knex, columnName, definitionCallback) {
  const hasTable = await knex.schema.hasTable(TABLE);
  if (!hasTable) {
    console.warn(`Table ${TABLE} does not exist, skipping column ${columnName}`);
    return;
  }

  const exists = await knex.schema.hasColumn(TABLE, columnName);
  if (!exists) {
    console.log(`Adding column ${columnName} to ${TABLE} table`);
    await knex.schema.alterTable(TABLE, definitionCallback);
  } else {
    console.log(`Column ${columnName} already exists, skipping`);
  }
}

exports.up = async function (knex) {
  // Plan information columns
  await ensureColumn(knex, 'plan_id', (table) => {
    table.string('plan_id', 50).nullable().defaultTo('free');
  });

  await ensureColumn(knex, 'plan_name', (table) => {
    table.string('plan_name', 100).nullable().defaultTo('Free');
  });

  await ensureColumn(knex, 'plan_price', (table) => {
    table.decimal('plan_price', 10, 2).nullable().defaultTo(0);
  });

  await ensureColumn(knex, 'plan_interval', (table) => {
    table.enum('plan_interval', ['mo', 'year', 'lifetime']).nullable().defaultTo('mo');
  });

  // Storage quota columns
  await ensureColumn(knex, 'storage_used', (table) => {
    table.decimal('storage_used', 12, 2).nullable().defaultTo(0);
  });

  await ensureColumn(knex, 'storage_limit', (table) => {
    table.decimal('storage_limit', 12, 2).nullable().defaultTo(15);
  });

  // Invoice quota columns
  await ensureColumn(knex, 'invoices_this_month', (table) => {
    table.integer('invoices_this_month').unsigned().nullable().defaultTo(0);
  });

  await ensureColumn(knex, 'invoice_limit', (table) => {
    table.integer('invoice_limit').unsigned().nullable().defaultTo(50);
  });

  // Billing status columns
  await ensureColumn(knex, 'billing_status', (table) => {
    table.enum('billing_status', ['active', 'suspended', 'cancelled']).nullable().defaultTo('active');
  });

  await ensureColumn(knex, 'billing_renews_at', (table) => {
    table.dateTime('billing_renews_at').nullable();
  });

  // Payment method storage
  await ensureColumn(knex, 'payment_method', (table) => {
    table.string('payment_method', 100).nullable();
  });
};

exports.down = async function (knex) {
  // Rollback by removing all columns (in reverse order)
  const hasTable = await knex.schema.hasTable(TABLE);
  if (!hasTable) return;

  await knex.schema.alterTable(TABLE, (table) => {
    const columns = [
      'plan_id',
      'plan_name',
      'plan_price',
      'plan_interval',
      'storage_used',
      'storage_limit',
      'invoices_this_month',
      'invoice_limit',
      'billing_status',
      'billing_renews_at',
      'payment_method'
    ];

    columns.forEach((col) => {
      if (table.hasColumn && table.hasColumn(col)) {
        table.dropColumn(col);
      }
    });
  });
};

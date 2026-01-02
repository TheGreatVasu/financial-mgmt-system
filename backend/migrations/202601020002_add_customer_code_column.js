/**
 * PRODUCTION SCHEMA FIX: Add customer_code column
 * 
 * The createCustomer endpoint tries to insert customer_code
 * which doesn't exist in the production database, causing 500 errors.
 * 
 * This migration adds the customer_code column to the customers table.
 */

exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('customers');
  if (!hasTable) {
    console.warn('Table customers does not exist, skipping migration');
    return;
  }

  const hasCustomerCode = await knex.schema.hasColumn('customers', 'customer_code');
  if (!hasCustomerCode) {
    console.log('Adding customer_code column to customers table');
    await knex.schema.alterTable('customers', (table) => {
      table.string('customer_code', 50).nullable().unique();
    });
  } else {
    console.log('Column customer_code already exists in customers, skipping');
  }
};

exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable('customers');
  if (!hasTable) {
    console.warn('Table customers does not exist, skipping rollback');
    return;
  }

  const hasCustomerCode = await knex.schema.hasColumn('customers', 'customer_code');
  if (hasCustomerCode) {
    await knex.schema.alterTable('customers', (table) => {
      table.dropColumn('customer_code');
    });
  }
};

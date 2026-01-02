/**
 * PRODUCTION SCHEMA FIX: Add contact_email and contact_phone columns
 * 
 * The createCustomer endpoint tries to insert contact_email and contact_phone
 * columns which don't exist in the production database, causing 500 errors.
 * 
 * This migration adds these columns to the customers table for schema compatibility.
 */

exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('customers');
  if (!hasTable) {
    console.warn('Table customers does not exist, skipping migration');
    return;
  }

  // Add contact_email column
  const hasContactEmail = await knex.schema.hasColumn('customers', 'contact_email');
  if (!hasContactEmail) {
    console.log('Adding contact_email column to customers table');
    await knex.schema.alterTable('customers', (table) => {
      table.string('contact_email', 255).nullable();
    });
  } else {
    console.log('Column contact_email already exists in customers, skipping');
  }

  // Add contact_phone column
  const hasContactPhone = await knex.schema.hasColumn('customers', 'contact_phone');
  if (!hasContactPhone) {
    console.log('Adding contact_phone column to customers table');
    await knex.schema.alterTable('customers', (table) => {
      table.string('contact_phone', 20).nullable();
    });
  } else {
    console.log('Column contact_phone already exists in customers, skipping');
  }
};

exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable('customers');
  if (!hasTable) {
    console.warn('Table customers does not exist, skipping rollback');
    return;
  }

  const hasContactEmail = await knex.schema.hasColumn('customers', 'contact_email');
  if (hasContactEmail) {
    await knex.schema.alterTable('customers', (table) => {
      table.dropColumn('contact_email');
    });
  }

  const hasContactPhone = await knex.schema.hasColumn('customers', 'contact_phone');
  if (hasContactPhone) {
    await knex.schema.alterTable('customers', (table) => {
      table.dropColumn('contact_phone');
    });
  }
};

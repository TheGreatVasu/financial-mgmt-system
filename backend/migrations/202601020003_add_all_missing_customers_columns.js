/**
 * PRODUCTION SCHEMA FIX: Add all missing columns to customers table
 * 
 * The production database was created from an older schema that's missing
 * essential columns. This migration adds all missing columns required by
 * the application code.
 * 
 * Missing columns being added:
 * - customer_code: Unique identifier for customer
 * - status: Customer status (active, inactive, suspended)
 * - name: Contact person name
 * - email: Contact email
 * - phone: Contact phone
 * - contact_email: Alternative email field for compatibility
 * - contact_phone: Alternative phone field for compatibility
 * - gst_number: GST number
 * - customer_address: Full address
 * - country: Country
 * - state: State/Province
 * - zone: Sales zone
 * - segment: Customer segment
 * - business_type: Type of business
 * - sales_manager: Assigned sales manager
 * - sales_head: Assigned sales head
 * - metadata: JSON metadata for master data
 * - created_by: User who created the record
 * - created_at: Creation timestamp
 */

exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('customers');
  if (!hasTable) {
    console.warn('Table customers does not exist, skipping migration');
    return;
  }

  const columnsToAdd = [
    { name: 'customer_code', definition: (table) => table.string('customer_code', 50).nullable().unique() },
    { name: 'status', definition: (table) => table.enum('status', ['active', 'inactive', 'suspended']).nullable().defaultTo('active') },
    { name: 'name', definition: (table) => table.string('name', 255).nullable() },
    { name: 'email', definition: (table) => table.string('email', 255).nullable() },
    { name: 'phone', definition: (table) => table.string('phone', 20).nullable() },
    { name: 'contact_email', definition: (table) => table.string('contact_email', 255).nullable() },
    { name: 'contact_phone', definition: (table) => table.string('contact_phone', 20).nullable() },
    { name: 'gst_number', definition: (table) => table.string('gst_number', 50).nullable() },
    { name: 'customer_address', definition: (table) => table.text('customer_address').nullable() },
    { name: 'country', definition: (table) => table.string('country', 100).nullable() },
    { name: 'state', definition: (table) => table.string('state', 100).nullable() },
    { name: 'zone', definition: (table) => table.string('zone', 100).nullable() },
    { name: 'segment', definition: (table) => table.string('segment', 100).nullable() },
    { name: 'business_type', definition: (table) => table.string('business_type', 100).nullable() },
    { name: 'sales_manager', definition: (table) => table.string('sales_manager', 255).nullable() },
    { name: 'sales_head', definition: (table) => table.string('sales_head', 255).nullable() },
    { name: 'metadata', definition: (table) => table.longText('metadata').nullable() },
    { name: 'created_by', definition: (table) => table.bigInteger('created_by').unsigned().nullable() },
    { name: 'created_at', definition: (table) => table.dateTime('created_at').nullable() }
  ];

  for (const { name, definition } of columnsToAdd) {
    const hasColumn = await knex.schema.hasColumn('customers', name);
    if (!hasColumn) {
      console.log(`Adding column ${name} to customers table`);
      await knex.schema.alterTable('customers', definition);
    } else {
      console.log(`Column ${name} already exists in customers, skipping`);
    }
  }

  // Ensure updated_at column exists with proper default
  const hasUpdatedAt = await knex.schema.hasColumn('customers', 'updated_at');
  if (!hasUpdatedAt) {
    console.log('Adding updated_at column to customers table');
    await knex.schema.alterTable('customers', (table) => {
      table.dateTime('updated_at').nullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
  }
};

exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable('customers');
  if (!hasTable) {
    console.warn('Table customers does not exist, skipping rollback');
    return;
  }

  const columnsToRemove = [
    'customer_code', 'status', 'name', 'email', 'phone', 
    'contact_email', 'contact_phone', 'gst_number', 'customer_address',
    'country', 'state', 'zone', 'segment', 'business_type',
    'sales_manager', 'sales_head', 'metadata', 'created_by', 'created_at', 'updated_at'
  ];

  for (const columnName of columnsToRemove) {
    const hasColumn = await knex.schema.hasColumn('customers', columnName);
    if (hasColumn) {
      await knex.schema.alterTable('customers', (table) => {
        table.dropColumn(columnName);
      });
    }
  }
};

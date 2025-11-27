/**
 * Migration: Ensure customer contact columns exist on `customers` table.
 *
 * This aligns the schema with the expectations in `customerController`,
 * which reads/writes `name`, `email`, and `phone` on the `customers` table.
 *
 * The migration is defensive:
 * - Only adds columns if they do not already exist
 * - Backfills `email` and `phone` from legacy `contact_email` / `contact_phone`
 */

async function ensureColumn(knex, tableName, columnName, callback) {
  const hasTable = await knex.schema.hasTable(tableName);
  if (!hasTable) return;

  const hasCol = await knex.schema.hasColumn(tableName, columnName);
  if (!hasCol) {
    await knex.schema.alterTable(tableName, callback);
  }
}

exports.up = async function up(knex) {
  const tableName = 'customers';

  // Add missing columns expected by the application logic
  await ensureColumn(knex, tableName, 'name', (table) => {
    table.string('name', 191).nullable().after('company_name');
  });

  await ensureColumn(knex, tableName, 'email', (table) => {
    table.string('email', 191).nullable().after('name');
  });

  await ensureColumn(knex, tableName, 'phone', (table) => {
    table.string('phone', 50).nullable().after('email');
  });

  // Best-effort backfill from legacy contact_* columns, if present
  const hasContactEmail = await knex.schema.hasColumn(tableName, 'contact_email');
  const hasEmail = await knex.schema.hasColumn(tableName, 'email');
  if (hasContactEmail && hasEmail) {
    await knex.raw(
      `UPDATE ?? SET ?? = COALESCE(??, ??)`,
      [tableName, 'email', 'email', 'contact_email']
    );
  }

  const hasContactPhone = await knex.schema.hasColumn(tableName, 'contact_phone');
  const hasPhone = await knex.schema.hasColumn(tableName, 'phone');
  if (hasContactPhone && hasPhone) {
    await knex.raw(
      `UPDATE ?? SET ?? = COALESCE(??, ??)`,
      [tableName, 'phone', 'phone', 'contact_phone']
    );
  }
};

exports.down = async function down(knex) {
  const tableName = 'customers';
  const hasTable = await knex.schema.hasTable(tableName);
  if (!hasTable) return;

  const dropIfExists = async (columnName) => {
    const hasCol = await knex.schema.hasColumn(tableName, columnName);
    if (hasCol) {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropColumn(columnName);
      });
    }
  };

  await dropIfExists('phone');
  await dropIfExists('email');
  await dropIfExists('name');
};



const TABLE = 'invoices'
const COLUMN = 'key_id'

exports.up = async function up(knex) {
  const hasColumn = await knex.schema.hasColumn(TABLE, COLUMN)
  if (!hasColumn) {
    await knex.schema.alterTable(TABLE, (table) => {
      table.string(COLUMN, 100).nullable().unique().comment('System generated unique key for invoice')
    })
  }
}

exports.down = async function down(knex) {
  const hasColumn = await knex.schema.hasColumn(TABLE, COLUMN)
  if (hasColumn) {
    await knex.schema.alterTable(TABLE, (table) => {
      table.dropUnique([COLUMN])
      table.dropColumn(COLUMN)
    })
  }
}

/**
 * Ensure po_entries exists with all required columns used by the PO Entry controller.
 * This replaces the older .sql migration that may not have run under Knex and also
 * adds missing columns such as letter_of_intent_no.
 */

const TABLE = 'po_entries'

async function ensureTable(knex) {
  const hasTable = await knex.schema.hasTable(TABLE)
  if (hasTable) return

  await knex.schema.createTable(TABLE, (table) => {
    table.bigIncrements('id').primary()
    table.string('customer_name', 255).nullable()
    table.text('customer_address').nullable()
    table.string('state', 100).nullable()
    table.string('country', 100).nullable()
    table.string('gst_no', 50).nullable()
    table.string('business_type', 100).nullable()
    table.string('segment', 100).nullable()
    table.string('zone', 100).nullable()
    table.string('contract_agreement_no', 100).nullable()
    table.date('ca_date').nullable()
    table.string('po_no', 100).nullable()
    table.date('po_date').nullable()
    table.string('letter_of_intent_no', 100).nullable()
    table.string('tender_reference_no', 120).nullable()
    table.date('tender_date').nullable()
    table.text('description').nullable()
    table.string('payment_type', 100).nullable()
    table.text('payment_terms').nullable()
    table.string('insurance_types', 255).nullable()
    table.string('advance_bank_guarantee_no', 100).nullable()
    table.date('abg_date').nullable()
    table.string('performance_bank_guarantee_no', 100).nullable()
    table.date('pbg_date').nullable()
    table.string('sales_manager', 150).nullable()
    table.string('sales_head', 150).nullable()
    table.string('agent_name', 150).nullable()
    table.decimal('agent_commission', 15, 2).nullable()
    table.text('delivery_schedule').nullable()
    table.string('liquidated_damages', 255).nullable()
    table.string('po_signed_concern_name', 255).nullable()
    table.text('boq_as_per_po').nullable()
    table.decimal('total_ex_works', 15, 2).nullable()
    table.decimal('freight_amount', 15, 2).nullable()
    table.decimal('gst', 15, 2).nullable()
    table.decimal('total_po_value', 15, 2).nullable()
    table.bigInteger('created_by').unsigned().nullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    table.index('customer_name', 'idx_po_entries_customer')
    table.index('po_no', 'idx_po_entries_po_no')
    table.index('created_at', 'idx_po_entries_created')
  })
}

async function ensureColumn(knex, column, definitionCallback) {
  const exists = await knex.schema.hasColumn(TABLE, column)
  if (!exists) {
    await knex.schema.alterTable(TABLE, definitionCallback)
  }
}

exports.up = async function (knex) {
  await ensureTable(knex)

  // Ensure critical columns exist even if the table was created previously from SQL.
  await ensureColumn(knex, 'letter_of_intent_no', (table) => {
    table.string('letter_of_intent_no', 100).nullable()
  })
  await ensureColumn(knex, 'tender_reference_no', (table) => {
    table.string('tender_reference_no', 120).nullable()
  })
}

exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable(TABLE)
  if (hasTable) {
    await knex.schema.dropTableIfExists(TABLE)
  }
}


/**
 * Add missing columns to po_entries table that are used by the PO Entry controller
 */

const TABLE = 'po_entries'

async function ensureColumn(knex, column, definitionCallback) {
  const hasTable = await knex.schema.hasTable(TABLE)
  if (!hasTable) return
  
  const exists = await knex.schema.hasColumn(TABLE, column)
  if (!exists) {
    await knex.schema.alterTable(TABLE, definitionCallback)
  }
}

exports.up = async function (knex) {
  await ensureColumn(knex, 'customer_id', (table) => {
    table.bigInteger('customer_id').unsigned().nullable()
  })
  
  await ensureColumn(knex, 'legal_entity_name', (table) => {
    table.string('legal_entity_name', 255).nullable()
  })
  
  await ensureColumn(knex, 'district', (table) => {
    table.string('district', 100).nullable()
  })
  
  await ensureColumn(knex, 'pin_code', (table) => {
    table.string('pin_code', 20).nullable()
  })
  
  await ensureColumn(knex, 'business_unit', (table) => {
    table.string('business_unit', 100).nullable()
  })
  
  await ensureColumn(knex, 'contract_agreement_date', (table) => {
    table.date('contract_agreement_date').nullable()
  })
  
  await ensureColumn(knex, 'letter_of_intent_date', (table) => {
    table.date('letter_of_intent_date').nullable()
  })
  
  await ensureColumn(knex, 'letter_of_award_no', (table) => {
    table.string('letter_of_award_no', 100).nullable()
  })
  
  await ensureColumn(knex, 'letter_of_award_date', (table) => {
    table.date('letter_of_award_date').nullable()
  })
  
  await ensureColumn(knex, 'project_description', (table) => {
    table.text('project_description').nullable()
  })
  
  await ensureColumn(knex, 'payment_terms_clause_in_po', (table) => {
    table.text('payment_terms_clause_in_po').nullable()
  })
  
  await ensureColumn(knex, 'insurance_type', (table) => {
    table.string('insurance_type', 100).nullable()
  })
  
  await ensureColumn(knex, 'policy_no', (table) => {
    table.string('policy_no', 100).nullable()
  })
  
  await ensureColumn(knex, 'policy_date', (table) => {
    table.date('policy_date').nullable()
  })
  
  await ensureColumn(knex, 'policy_company', (table) => {
    table.string('policy_company', 255).nullable()
  })
  
  await ensureColumn(knex, 'policy_valid_upto', (table) => {
    table.date('policy_valid_upto').nullable()
  })
  
  await ensureColumn(knex, 'policy_clause_in_po', (table) => {
    table.text('policy_clause_in_po').nullable()
  })
  
  await ensureColumn(knex, 'policy_remarks', (table) => {
    table.text('policy_remarks').nullable()
  })
  
  await ensureColumn(knex, 'bank_guarantee_type', (table) => {
    table.string('bank_guarantee_type', 100).nullable()
  })
  
  await ensureColumn(knex, 'bank_guarantee_no', (table) => {
    table.string('bank_guarantee_no', 100).nullable()
  })
  
  await ensureColumn(knex, 'bank_guarantee_date', (table) => {
    table.date('bank_guarantee_date').nullable()
  })
  
  await ensureColumn(knex, 'bank_guarantee_value', (table) => {
    table.decimal('bank_guarantee_value', 15, 2).nullable()
  })
  
  await ensureColumn(knex, 'bank_name', (table) => {
    table.string('bank_name', 255).nullable()
  })
  
  await ensureColumn(knex, 'bank_guarantee_validity', (table) => {
    table.date('bank_guarantee_validity').nullable()
  })
  
  await ensureColumn(knex, 'bank_guarantee_release_validity_clause_in_po', (table) => {
    table.text('bank_guarantee_release_validity_clause_in_po').nullable()
  })
  
  await ensureColumn(knex, 'bank_guarantee_remarks', (table) => {
    table.text('bank_guarantee_remarks').nullable()
  })
  
  await ensureColumn(knex, 'business_head', (table) => {
    table.string('business_head', 150).nullable()
  })
  
  await ensureColumn(knex, 'project_manager', (table) => {
    table.string('project_manager', 150).nullable()
  })
  
  await ensureColumn(knex, 'project_head', (table) => {
    table.string('project_head', 150).nullable()
  })
  
  await ensureColumn(knex, 'collection_incharge', (table) => {
    table.string('collection_incharge', 150).nullable()
  })
  
  await ensureColumn(knex, 'sales_agent_name', (table) => {
    table.string('sales_agent_name', 150).nullable()
  })
  
  await ensureColumn(knex, 'sales_agent_commission', (table) => {
    table.decimal('sales_agent_commission', 15, 2).nullable()
  })
  
  await ensureColumn(knex, 'collection_agent_name', (table) => {
    table.string('collection_agent_name', 150).nullable()
  })
  
  await ensureColumn(knex, 'collection_agent_commission', (table) => {
    table.decimal('collection_agent_commission', 15, 2).nullable()
  })
  
  await ensureColumn(knex, 'delivery_schedule_clause', (table) => {
    table.text('delivery_schedule_clause').nullable()
  })
  
  await ensureColumn(knex, 'liquidated_damages_clause', (table) => {
    table.text('liquidated_damages_clause').nullable()
  })
  
  await ensureColumn(knex, 'last_date_of_delivery', (table) => {
    table.date('last_date_of_delivery').nullable()
  })
  
  await ensureColumn(knex, 'po_validity', (table) => {
    table.date('po_validity').nullable()
  })
  
  await ensureColumn(knex, 'boq_enabled', (table) => {
    table.boolean('boq_enabled').defaultTo(false)
  })
  
  await ensureColumn(knex, 'boq_items', (table) => {
    table.text('boq_items').nullable()
  })
  
  await ensureColumn(knex, 'total_freight_amount', (table) => {
    table.decimal('total_freight_amount', 15, 2).nullable()
  })
}

exports.down = async function (knex) {
  // In a real scenario, you might want to drop these columns
  // For safety, we'll leave them in place
}

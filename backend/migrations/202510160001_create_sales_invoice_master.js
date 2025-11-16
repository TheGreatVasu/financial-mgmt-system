/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sales_invoice_master', function(table) {
    // Basic Invoice Information (Columns 1-5)
    table.increments('id').primary();
    table.string('key_id', 100).unique();
    table.string('gst_tax_invoice_no', 100).notNullable();
    table.date('gst_tax_invoice_date');
    table.string('internal_invoice_no', 100);
    table.string('invoice_type', 50);
    
    // Business & Customer Information (Columns 6-10)
    table.string('business_unit', 100);
    table.string('customer_name', 255).notNullable();
    table.string('segment', 100);
    table.string('region', 100);
    table.string('zone', 100);
    
    // Order & Reference Information (Columns 11-14)
    table.string('sales_order_no', 100);
    table.string('account_manager_name', 255);
    table.string('po_no_reference', 100);
    table.date('po_date');
    
    // Party & Material Information (Columns 15-17)
    table.string('bill_to_party', 255);
    table.text('material_description');
    table.string('state_of_supply', 100);
    
    // Quantity & Pricing (Columns 18-22)
    table.decimal('qty', 15, 3).defaultTo(0);
    table.string('unit', 50);
    table.string('currency', 10).defaultTo('INR');
    table.decimal('basic_rate', 15, 2).defaultTo(0);
    table.decimal('basic_value', 15, 2).defaultTo(0);
    
    // Freight Information (Columns 23-25)
    table.string('freight_invoice_no', 100);
    table.decimal('freight_rate', 15, 2).defaultTo(0);
    table.decimal('freight_value', 15, 2).defaultTo(0);
    
    // Tax Information (Columns 26-30)
    table.decimal('sgst_output', 15, 2).defaultTo(0);
    table.decimal('cgst_output', 15, 2).defaultTo(0);
    table.decimal('igst_output', 15, 2).defaultTo(0);
    table.decimal('ugst_output', 15, 2).defaultTo(0);
    table.decimal('tcs', 15, 2).defaultTo(0);
    
    // Financial Totals (Columns 31-32)
    table.decimal('subtotal', 15, 2).defaultTo(0);
    table.decimal('total_invoice_value', 15, 2).defaultTo(0);
    
    // Address Information (Columns 33-36)
    table.text('consignee_name_address');
    table.string('consignee_city', 100);
    table.text('payer_name_address');
    table.string('city', 100);
    
    // Logistics & Document Information (Columns 37-50)
    table.string('lr_no', 100);
    table.date('lr_date');
    table.string('delivery_challan_no', 100);
    table.date('delivery_challan_date');
    table.date('inspection_offer_date');
    table.date('inspection_date');
    table.date('delivery_instruction_date');
    table.date('last_date_of_dispatch');
    table.date('last_date_of_material_receipt');
    table.date('invoice_ready_date');
    table.string('courier_document_no', 100);
    table.date('courier_document_date');
    table.string('courier_name', 255);
    table.date('invoice_receipt_date');
    
    // Payment Terms (Columns 51-52)
    table.text('payment_text');
    table.string('payment_terms', 255);
    
    // 1st Due Payment Information (Columns 53-60)
    table.date('first_due_date');
    table.decimal('first_due_amount', 15, 2).defaultTo(0);
    table.decimal('payment_received_amount_first_due', 15, 2).defaultTo(0);
    table.date('receipt_date_first_due');
    table.decimal('first_due_balance', 15, 2).defaultTo(0);
    table.decimal('not_due_first_due', 15, 2).defaultTo(0);
    table.decimal('over_due_first_due', 15, 2).defaultTo(0);
    table.integer('no_of_days_of_payment_receipt_first_due').defaultTo(0);
    
    // 2nd Due Payment Information (Columns 61-68)
    table.date('second_due_date');
    table.decimal('second_due_amount', 15, 2).defaultTo(0);
    table.decimal('payment_received_amount_second_due', 15, 2).defaultTo(0);
    table.date('receipt_date_second_due');
    table.decimal('second_due_balance', 15, 2).defaultTo(0);
    table.decimal('not_due_second_due', 15, 2).defaultTo(0);
    table.decimal('over_due_second_due', 15, 2).defaultTo(0);
    table.integer('no_of_days_of_payment_receipt_second_due').defaultTo(0);
    
    // 3rd Due Payment Information (Columns 69-76)
    table.date('third_due_date');
    table.decimal('third_due_amount', 15, 2).defaultTo(0);
    table.decimal('payment_received_amount_third_due', 15, 2).defaultTo(0);
    table.date('receipt_date_third_due');
    table.decimal('third_due_balance', 15, 2).defaultTo(0);
    table.decimal('not_due_third_due', 15, 2).defaultTo(0);
    table.decimal('over_due_third_due', 15, 2).defaultTo(0);
    table.integer('no_of_days_of_payment_receipt_third_due').defaultTo(0);
    
    // Total Balance Information (Columns 77-79)
    table.decimal('total_balance', 15, 2).defaultTo(0);
    table.decimal('not_due_total', 15, 2).defaultTo(0);
    table.decimal('over_due_total', 15, 2).defaultTo(0);
    
    // TDS & Deductions (Columns 80-85)
    table.decimal('it_tds_2_percent_service', 15, 2).defaultTo(0);
    table.decimal('it_tds_1_percent_194q_supply', 15, 2).defaultTo(0);
    table.decimal('lcess_boq_1_percent_works', 15, 2).defaultTo(0);
    table.decimal('tds_2_percent_cgst_sgst', 15, 2).defaultTo(0);
    table.decimal('tds_on_cgst_1_percent', 15, 2).defaultTo(0);
    table.decimal('tds_on_sgst_1_percent', 15, 2).defaultTo(0);
    
    // Reconciliation & Exception Fields (Columns 86-93)
    table.decimal('excess_supply_qty', 15, 3).defaultTo(0);
    table.decimal('interest_on_advance', 15, 2).defaultTo(0);
    table.string('any_hold', 100);
    table.decimal('penalty_ld_deduction', 15, 2).defaultTo(0);
    table.decimal('bank_charges', 15, 2).defaultTo(0);
    table.decimal('lc_discrepancy_charge', 15, 2).defaultTo(0);
    table.decimal('provision_for_bad_debts', 15, 2).defaultTo(0);
    table.decimal('bad_debts', 15, 2).defaultTo(0);
    
    // Metadata
    table.integer('created_by');
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index('gst_tax_invoice_no');
    table.index('internal_invoice_no');
    table.index('customer_name');
    table.index('business_unit');
    table.index('region');
    table.index('zone');
    table.index('gst_tax_invoice_date');
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('sales_invoice_master');
};


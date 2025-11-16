/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('sales_invoice_master', function(table) {
    // Change created_by from INT to BIGINT UNSIGNED to match users.id
    table.bigInteger('created_by').unsigned().alter();
    
    // Add index for performance if it doesn't exist
    table.index('created_by', 'idx_sales_invoice_master_created_by');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('sales_invoice_master', function(table) {
    // Revert to INT (though this might cause data loss if values exceed INT range)
    table.integer('created_by').alter();
    table.dropIndex('created_by', 'idx_sales_invoice_master_created_by');
  });
};


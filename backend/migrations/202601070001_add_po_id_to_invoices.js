exports.up = function(knex) {
  return knex.schema.hasColumn('invoices', 'po_id').then(exists => {
    if (!exists) {
      return knex.schema.table('invoices', table => {
        table.bigInteger('po_id').unsigned().nullable().after('invoice_number');
        table.foreign('po_id').references('id').inTable('po_entries').onDelete('SET NULL');
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.hasColumn('invoices', 'po_id').then(exists => {
    if (exists) {
      return knex.schema.table('invoices', table => {
        table.dropForeign('po_id');
        table.dropColumn('po_id');
      });
    }
  });
};

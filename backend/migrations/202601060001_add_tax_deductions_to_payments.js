exports.up = async function(knex) {
  try {
    // Check and add each column individually
    const columns = [
      ['progressive_delivery', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['agt_commissioning', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['gst_tds', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['it_tds', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['it_tds_u194q', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['labour_cess', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['old_it_tds', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['other_recovery', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['penalty', 'DECIMAL(12,2) NOT NULL DEFAULT 0'],
      ['customer_name', 'VARCHAR(191)'],
      ['project_name', 'VARCHAR(191)'],
      ['package_name', 'VARCHAR(191)'],
      ['payment_type', 'VARCHAR(50)'],
      ['bank_name', 'VARCHAR(191)'],
      ['bank_credit_date', 'DATETIME'],
    ];

    for (const [columnName, columnDef] of columns) {
      const hasColumn = await knex.schema.hasColumn('payments', columnName);
      if (!hasColumn) {
        await knex.schema.table('payments', table => {
          knex.raw(`ALTER TABLE payments ADD COLUMN ${columnName} ${columnDef}`);
        });
        console.log(`✅ Added column: ${columnName}`);
      }
    }
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    throw error;
  }
};

exports.down = async function(knex) {
  try {
    const columns = [
      'progressive_delivery',
      'agt_commissioning',
      'gst_tds',
      'it_tds',
      'it_tds_u194q',
      'labour_cess',
      'old_it_tds',
      'other_recovery',
      'penalty',
      'customer_name',
      'project_name',
      'package_name',
      'payment_type',
      'bank_name',
      'bank_credit_date',
    ];

    for (const columnName of columns) {
      const hasColumn = await knex.schema.hasColumn('payments', columnName);
      if (hasColumn) {
        await knex.schema.table('payments', table => {
          table.dropColumn(columnName);
        });
        console.log(`✅ Dropped column: ${columnName}`);
      }
    }
  } catch (error) {
    console.error('❌ Error removing columns:', error.message);
  }
};

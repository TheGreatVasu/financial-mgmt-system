const { asyncHandler } = require('../middleware/errorHandler');
const { getDb } = require('../config/db');
const knexfile = require('../../knexfile');
const knexLib = require('knex');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Get database status
const getDatabaseStatus = asyncHandler(async (req, res) => {
  const db = getDb();
  
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  try {
    // Get all tables
    const tables = await db.raw(`
      SELECT 
        TABLE_NAME as name,
        TABLE_ROWS as rowCount,
        ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS sizeMB,
        CREATE_TIME as createdAt
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

    // Get migration status
    const knex = knexLib(knexfile);
    let migrations;
    try {
      migrations = await knex.migrate.list();
    } finally {
      await knex.destroy();
    }
    
    // Get seed files
    const seedDir = path.join(__dirname, '../../seeds');
    const seedFiles = fs.existsSync(seedDir) 
      ? fs.readdirSync(seedDir)
          .filter(file => file.endsWith('.sql'))
          .map(file => ({
            name: file,
            path: path.join(seedDir, file)
          }))
      : [];

    // Get database info
    const dbInfo = await db.raw('SELECT DATABASE() as name, VERSION() as version');
    const connectionInfo = await db.raw('SELECT CONNECTION_ID() as connectionId, NOW() as serverTime');

    res.json({
      success: true,
      data: {
        database: {
          name: dbInfo[0][0]?.name || 'unknown',
          version: dbInfo[0][0]?.version || 'unknown',
          connectionId: connectionInfo[0][0]?.connectionId,
          serverTime: connectionInfo[0][0]?.serverTime
        },
        tables: tables[0] || [],
        migrations: {
          completed: migrations[0] || [],
          pending: migrations[1] || []
        },
        seeds: seedFiles,
        stats: {
          totalTables: tables[0]?.length || 0,
          totalRows: tables[0]?.reduce((sum, table) => sum + (parseInt(table.rowCount) || 0), 0) || 0,
          totalSizeMB: tables[0]?.reduce((sum, table) => sum + (parseFloat(table.sizeMB) || 0), 0) || 0
        }
      }
    });
  } catch (error) {
    throw error;
  }
});

// Run migrations
const runMigrations = asyncHandler(async (req, res) => {
  const db = getDb();
  
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  const knex = knexLib(knexfile);
  try {
    const [batchNo, log] = await knex.migrate.latest();
    
    res.json({
      success: true,
      message: 'Migrations completed successfully',
      data: {
        batchNo,
        migrations: log
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  } finally {
    await knex.destroy();
  }
});

// Rollback migrations
const rollbackMigrations = asyncHandler(async (req, res) => {
  const db = getDb();
  
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  const knex = knexLib(knexfile);
  try {
    const [batchNo, log] = await knex.migrate.rollback();
    
    res.json({
      success: true,
      message: 'Migrations rolled back successfully',
      data: {
        batchNo,
        migrations: log
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Rollback failed',
      error: error.message
    });
  } finally {
    await knex.destroy();
  }
});

// Run seeds
const runSeeds = asyncHandler(async (req, res) => {
  const db = getDb();
  
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  const knex = knexLib(knexfile);
  try {
    const seedResults = await knex.seed.run();
    
    res.json({
      success: true,
      message: 'Seeds completed successfully',
      data: {
        seeds: seedResults[0] || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message
    });
  } finally {
    await knex.destroy();
  }
});

// Get table structure
const getTableStructure = asyncHandler(async (req, res) => {
  const db = getDb();
  const { tableName } = req.params;
  
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  if (!tableName) {
    return res.status(400).json({
      success: false,
      message: 'Table name is required'
    });
  }

  try {
    // Get columns
    const columns = await db.raw(`
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_DEFAULT as defaultValue,
        COLUMN_KEY as key,
        EXTRA as extra,
        COLUMN_COMMENT as comment
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [tableName]);

    // Get indexes
    const indexes = await db.raw(`
      SELECT 
        INDEX_NAME as name,
        COLUMN_NAME as columnName,
        NON_UNIQUE as nonUnique,
        SEQ_IN_INDEX as sequence
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `, [tableName]);

    // Get row count
    const rowCount = await db(tableName).count('* as count').first();

    res.json({
      success: true,
      data: {
        tableName,
        columns: columns[0] || [],
        indexes: indexes[0] || [],
        rowCount: rowCount?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get table structure',
      error: error.message
    });
  }
});

// Export all database data to Excel
const exportAllData = asyncHandler(async (req, res) => {
  const db = getDb();
  
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Financial Management System';
    workbook.created = new Date();

    // Export Users
    const users = await db('users').select('*');
    const usersSheet = workbook.addWorksheet('Users');
    usersSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'First Name', key: 'first_name', width: 15 },
      { header: 'Last Name', key: 'last_name', width: 15 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'Active', key: 'is_active', width: 10 },
      { header: 'Last Login', key: 'last_login', width: 20 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];
    users.forEach(user => usersSheet.addRow(user));

    // Export Customers
    const customers = await db('customers').select('*');
    const customersSheet = workbook.addWorksheet('Customers');
    customersSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Customer Code', key: 'customer_code', width: 15 },
      { header: 'Company Name', key: 'company_name', width: 30 },
      { header: 'Contact Email', key: 'contact_email', width: 30 },
      { header: 'Contact Phone', key: 'contact_phone', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];
    customers.forEach(customer => customersSheet.addRow(customer));

    // Export Invoices
    const invoices = await db('invoices').select('*');
    const invoicesSheet = workbook.addWorksheet('Invoices');
    invoicesSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Invoice Number', key: 'invoice_number', width: 20 },
      { header: 'Customer ID', key: 'customer_id', width: 12 },
      { header: 'Issue Date', key: 'issue_date', width: 15 },
      { header: 'Due Date', key: 'due_date', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Tax Rate', key: 'tax_rate', width: 12 },
      { header: 'Tax Amount', key: 'tax_amount', width: 15 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Paid Amount', key: 'paid_amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];
    invoices.forEach(invoice => invoicesSheet.addRow(invoice));

    // Export Payments
    const payments = await db('payments').select('*');
    const paymentsSheet = workbook.addWorksheet('Payments');
    paymentsSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Invoice ID', key: 'invoice_id', width: 12 },
      { header: 'Payment Date', key: 'payment_date', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Payment Method', key: 'payment_method', width: 15 },
      { header: 'Reference Number', key: 'reference_number', width: 20 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];
    payments.forEach(payment => paymentsSheet.addRow(payment));

    // Export Action Items
    const actionItems = await db('action_items').select('*');
    if (actionItems.length > 0) {
      const actionItemsSheet = workbook.addWorksheet('Action Items');
      actionItemsSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Due Date', key: 'due_date', width: 15 },
        { header: 'Created At', key: 'created_at', width: 20 }
      ];
      actionItems.forEach(item => actionItemsSheet.addRow(item));
    }

    // Export Alerts
    const alerts = await db('alerts').select('*');
    if (alerts.length > 0) {
      const alertsSheet = workbook.addWorksheet('Alerts');
      alertsSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Type', key: 'type', width: 12 },
        { header: 'Message', key: 'message', width: 50 },
        { header: 'Read', key: 'is_read', width: 10 },
        { header: 'Created At', key: 'created_at', width: 20 }
      ];
      alerts.forEach(alert => alertsSheet.addRow(alert));
    }

    // Export Audit Logs
    const auditLogs = await db('audit_logs').select('*');
    if (auditLogs.length > 0) {
      const auditLogsSheet = workbook.addWorksheet('Audit Logs');
      auditLogsSheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Action', key: 'action', width: 15 },
        { header: 'Entity', key: 'entity', width: 15 },
        { header: 'Entity ID', key: 'entity_id', width: 12 },
        { header: 'Performed By', key: 'performed_by', width: 15 },
        { header: 'IP Address', key: 'ip_address', width: 15 },
        { header: 'Created At', key: 'created_at', width: 20 }
      ];
      auditLogs.forEach(log => auditLogsSheet.addRow(log));
    }

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=financial_data_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
});

module.exports = {
  getDatabaseStatus,
  runMigrations,
  rollbackMigrations,
  runSeeds,
  getTableStructure,
  exportAllData
};


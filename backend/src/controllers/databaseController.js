const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const knexfile = require('../../knexfile');
const knexLib = require('knex');
const fs = require('fs');
const path = require('path');

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

module.exports = {
  getDatabaseStatus,
  runMigrations,
  rollbackMigrations,
  runSeeds,
  getTableStructure
};


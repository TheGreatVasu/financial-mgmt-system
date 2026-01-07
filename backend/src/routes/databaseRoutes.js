const express = require('express');
const router = express.Router();
const {
  getDatabaseStatus,
  runMigrations,
  rollbackMigrations,
  runSeeds,
  getTableStructure,
  exportAllData
} = require('../controllers/databaseController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Get database status and information
router.get('/status', getDatabaseStatus);

// Migration operations
router.post('/migrations/run', runMigrations);
router.post('/migrations/rollback', rollbackMigrations);

// Seed operations
router.post('/seeds/run', runSeeds);

// Table structure
router.get('/tables/:tableName/structure', getTableStructure);

// Export all data to Excel
router.get('/export', exportAllData);

module.exports = router;


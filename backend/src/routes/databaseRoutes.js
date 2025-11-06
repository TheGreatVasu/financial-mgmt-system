const express = require('express');
const router = express.Router();
const {
  getDatabaseStatus,
  runMigrations,
  rollbackMigrations,
  runSeeds,
  getTableStructure
} = require('../controllers/databaseController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

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

module.exports = router;


const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getReports, getDSOReport, getAgingReport, generatePDFReport } = require('../controllers/reportController');

const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/', authMiddleware, getReports);

router.get('/dso', authMiddleware, getDSOReport);

router.get('/aging', authMiddleware, getAgingReport);

// PDF export route
router.post('/pdf', authMiddleware, generatePDFReport);

module.exports = router;

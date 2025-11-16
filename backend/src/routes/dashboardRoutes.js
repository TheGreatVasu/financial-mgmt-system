const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getDashboard, streamDashboard } = require('../controllers/dashboardController');
const { getSalesInvoiceDashboard } = require('../controllers/salesInvoiceDashboardController');

// Dashboard routes now require authentication - each user gets their own dashboard
router.get('/', authMiddleware, getDashboard);
router.get('/events', authMiddleware, streamDashboard);
router.get('/sales-invoice', authMiddleware, getSalesInvoiceDashboard);

module.exports = router;



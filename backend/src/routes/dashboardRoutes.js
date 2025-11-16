const express = require('express');
const router = express.Router();
const { optionalAuth, authMiddleware } = require('../middlewares/authMiddleware');
const { getDashboard, streamDashboard } = require('../controllers/dashboardController');
const { getSalesInvoiceDashboard } = require('../controllers/salesInvoiceDashboardController');

router.get('/', optionalAuth, getDashboard);
router.get('/events', optionalAuth, streamDashboard);
router.get('/sales-invoice', authMiddleware, getSalesInvoiceDashboard);

module.exports = router;



const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/authMiddleware');
const { getDashboard, streamDashboard } = require('../controllers/dashboardController');

router.get('/', optionalAuth, getDashboard);
router.get('/events', optionalAuth, streamDashboard);

module.exports = router;



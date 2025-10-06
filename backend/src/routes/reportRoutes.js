const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Report routes - Coming soon',
    data: []
  });
});

router.get('/dso', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'DSO report - Coming soon',
    data: []
  });
});

router.get('/aging', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Aging report - Coming soon',
    data: []
  });
});

module.exports = router;

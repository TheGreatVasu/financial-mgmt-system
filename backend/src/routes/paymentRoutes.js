const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Payment routes - Coming soon',
    data: []
  });
});

router.post('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Create payment - Coming soon',
    data: req.body
  });
});

module.exports = router;

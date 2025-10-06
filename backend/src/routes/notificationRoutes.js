const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Notification routes - Coming soon',
    data: []
  });
});

router.post('/mark-read', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Mark notification as read - Coming soon',
    data: req.body
  });
});

module.exports = router;

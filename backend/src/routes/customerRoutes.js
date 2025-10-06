const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Customer routes - Coming soon',
    data: []
  });
});

router.get('/:id', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Customer detail - Coming soon',
    data: { id: req.params.id }
  });
});

router.post('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Create customer - Coming soon',
    data: req.body
  });
});

router.put('/:id', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Update customer - Coming soon',
    data: { id: req.params.id, ...req.body }
  });
});

router.delete('/:id', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Delete customer - Coming soon',
    data: { id: req.params.id }
  });
});

module.exports = router;

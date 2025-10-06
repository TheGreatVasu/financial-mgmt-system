const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Invoice routes - Coming soon',
    data: []
  });
});

router.get('/:id', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Invoice detail - Coming soon',
    data: { id: req.params.id }
  });
});

router.post('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Create invoice - Coming soon',
    data: req.body
  });
});

router.put('/:id', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Update invoice - Coming soon',
    data: { id: req.params.id, ...req.body }
  });
});

router.delete('/:id', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Delete invoice - Coming soon',
    data: { id: req.params.id }
  });
});

module.exports = router;

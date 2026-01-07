const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/poEntryController');

const router = express.Router();

router.use(authMiddleware);

// PO Entry routes
router.get('/', ctrl.getPOEntries);
router.post('/', ctrl.createPOEntry);
router.get('/:id', ctrl.getPOEntry);
router.put('/:id', ctrl.updatePOEntry);
router.delete('/:id', ctrl.deletePOEntry);

module.exports = router;


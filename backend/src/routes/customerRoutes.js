const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/customerController');

const router = express.Router();

router.use(authMiddleware);

// PO Entry routes (must be before /:id route to avoid conflicts)
router.post('/po-entry/export', ctrl.exportPOEntry);
router.get('/po-entry/template', ctrl.downloadPOEntryTemplate);

// Customer CRUD routes
router.get('/', ctrl.getCustomers);
router.get('/:id', ctrl.getCustomer);
router.post('/', ctrl.createCustomer);
router.put('/:id', ctrl.updateCustomer);
router.delete('/:id', ctrl.deleteCustomer);

module.exports = router;

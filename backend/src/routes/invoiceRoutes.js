const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/invoiceController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', ctrl.getInvoices);
router.get('/:id', ctrl.getInvoice);
router.post('/', ctrl.createInvoice);
router.put('/:id', ctrl.updateInvoice);
router.delete('/:id', ctrl.deleteInvoice);

module.exports = router;

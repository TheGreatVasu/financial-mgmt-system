const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/paymentController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', ctrl.getPayments);
router.post('/', ctrl.createPayment);
router.put('/:id', ctrl.updatePayment);
router.delete('/:id', ctrl.deletePayment);

module.exports = router;

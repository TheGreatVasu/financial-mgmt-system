const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/paymentController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', ctrl.getPayments);
router.post('/', ctrl.createPayment);

module.exports = router;

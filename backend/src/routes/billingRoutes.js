const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middlewares/authMiddleware')
const {
  getSubscription,
  changePlan,
  cancelSubscription,
  resumeSubscription,
  updatePaymentMethod
} = require('../controllers/billingController')

// All billing routes require authentication
router.use(authMiddleware)

// Get current subscription
router.get('/subscription', getSubscription)

// Change subscription plan
router.post('/change-plan', changePlan)

// Cancel subscription
router.post('/cancel', cancelSubscription)

// Resume subscription
router.post('/resume', resumeSubscription)

// Update payment method
router.put('/payment-method', updatePaymentMethod)

module.exports = router


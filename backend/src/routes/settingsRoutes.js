const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middlewares/authMiddleware')
const {
  getSettings,
  updateSettings
} = require('../controllers/settingsController')

// All settings routes require authentication
router.use(authMiddleware)

// Get user settings
router.get('/', getSettings)

// Update user settings
router.put('/', updateSettings)

module.exports = router


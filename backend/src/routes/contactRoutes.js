const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/authMiddleware')
const { submitContact } = require('../controllers/contactController')

// Contact routes require authentication
router.use(authMiddleware)

router.post('/', submitContact)

module.exports = router



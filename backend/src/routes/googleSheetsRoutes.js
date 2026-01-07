const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/googleSheetsController');

const router = express.Router();

// Protect these routes - only logged-in app users can call server to read/write sheets
router.use(authMiddleware);

router.get('/values', ctrl.getValues);
router.put('/values', ctrl.putValues);

module.exports = router;



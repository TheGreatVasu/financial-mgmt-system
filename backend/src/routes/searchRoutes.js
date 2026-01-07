const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { searchSuggestions } = require('../controllers/searchController');

const router = express.Router();

// All search endpoints require authentication so that we can respect per-user data rules.
router.use(authMiddleware);

router.get('/suggestions', searchSuggestions);

module.exports = router;



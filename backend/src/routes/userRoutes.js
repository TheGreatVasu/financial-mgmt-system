const express = require('express');
const { getAllUsersController, exportUsers } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Routes
router.get('/', getAllUsersController);
router.get('/export', exportUsers);

module.exports = router;


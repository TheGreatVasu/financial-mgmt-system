const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  googleLogin,
  completeGoogleProfile,
  uploadAvatar,
  updatePreferences,
  uploadAvatarMiddleware
} = require('../controllers/authController');
const {
  getSessions,
  logoutSession,
  logoutAllSessions,
  updateActivity
} = require('../controllers/sessionController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be a valid international format (with country code)'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['business_user', 'company_admin', 'system_admin'])
    .withMessage('Role must be one of: business_user, company_admin, or system_admin'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one number, and one special symbol'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const completeGoogleProfileValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be a valid international format (with country code)'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['business_user', 'company_admin', 'system_admin'])
    .withMessage('Role must be one of: business_user, company_admin, or system_admin')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/google-login', googleLogin);
router.post('/complete-google-profile', authMiddleware, completeGoogleProfileValidation, completeGoogleProfile);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfileValidation, updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidation, changePassword);
router.post('/avatar', authMiddleware, uploadAvatarMiddleware, uploadAvatar);
router.put('/preferences', authMiddleware, updatePreferences);
router.post('/logout', authMiddleware, logout);

// Session management routes
router.get('/sessions', authMiddleware, getSessions);
router.post('/sessions/activity', authMiddleware, updateActivity);
router.delete('/sessions', authMiddleware, logoutAllSessions);
router.delete('/sessions/:sessionToken', authMiddleware, logoutSession);

module.exports = router;

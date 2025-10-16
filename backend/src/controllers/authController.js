const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/env');
const { asyncHandler } = require('../middlewares/errorHandler');
const {
  createUser,
  findByEmailWithPassword,
  updateProfileById,
  isEmailTaken,
  updateLastLogin,
  comparePassword,
  findById,
  changePassword: repoChangePassword,
  audit
} = require('../services/userRepo');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const emailTaken = await isEmailTaken(email);

  if (emailTaken) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await createUser({ username, email, password, firstName, lastName });

  // Generate token
  const token = generateToken(user.id);

  // Log registration
  await audit({ action: 'create', entity: 'user', entityId: user.id, performedBy: user.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Check for user
  const found = await findByEmailWithPassword(email);

  if (!found) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (found.is_active === 0) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check password
  const isMatch = await comparePassword(password, found.password_hash);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  await updateLastLogin(found.id);

  // Generate token
  const token = generateToken(found.id);

  // Log login
  await audit({ action: 'login', entity: 'user', entityId: found.id, performedBy: found.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: await findById(found.id), token }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { firstName, lastName, email } = req.body;
  const userId = req.user.id;

  // Check if email is already taken by another user
  if (email && email !== req.user.email) {
    const taken = await isEmailTaken(email, userId);
    if (taken) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken'
      });
    }
  }

  const user = await updateProfileById(userId, { firstName, lastName, email });

  // Log profile update
  await audit({ action: 'update', entity: 'user', entityId: userId, changes: { firstName, lastName, email }, performedBy: userId, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get user with password
  const found = await findByEmailWithPassword(req.user.email);

  // Check current password
  const isMatch = await comparePassword(currentPassword, found.password_hash);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  await repoChangePassword(userId, newPassword);

  // Log password change
  await audit({ action: 'update', entity: 'user', entityId: userId, changes: { passwordChanged: true }, performedBy: userId, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Log logout
  await audit({ action: 'logout', entity: 'user', entityId: req.user.id, performedBy: req.user.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
};

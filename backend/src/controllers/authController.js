const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/env');
const { asyncHandler } = require('../middlewares/errorHandler');
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createUser,
  findByEmailWithPassword,
  updateProfileById,
  updateUserPreferences,
  isEmailTaken,
  isPhoneTaken,
  updateLastLogin,
  comparePassword,
  findById,
  changePassword: repoChangePassword,
  audit,
  initializeUserDashboard
} = require('../services/userRepo');
const { createOrUpdateSession } = require('../services/sessionRepo');
const { getIOInstance } = require('../services/socketService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

// Google OAuth client (ID and Secret from env)
// Load from env at module load time
let googleClientId = process.env.GOOGLE_CLIENT_ID || '';
let googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
// For ID token verification, we only need Client ID
// Client Secret is stored for potential future use (server-side OAuth flows)
let googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

// Function to reinitialize Google client (useful if env changes)
function initializeGoogleClient() {
  googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
  
  if (googleClientId) {
    console.log('✅ Google OAuth client initialized');
    console.log(`   Client ID: ${googleClientId.substring(0, 20)}...${googleClientId.substring(googleClientId.length - 10)}`);
    if (googleClientSecret) {
      console.log('   Client Secret: ✅ Configured');
    } else {
      console.log('   Client Secret: ⚠️  Not set (optional for ID token verification)');
    }
  } else {
    console.warn('⚠️  Google OAuth client not initialized: GOOGLE_CLIENT_ID not set');
  }
}

// Initialize on module load
initializeGoogleClient();

// Configure multer for avatar uploads
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${userId}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract first error message for better UX
    const firstError = errors.array()[0];
    const errorMessage = firstError.msg || 'Validation failed';
    
    return res.status(400).json({
      success: false,
      message: errorMessage,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  const { email, password, firstName, lastName, phoneNumber, role: requestedRole } = req.body;
  
  // Generate username from email if not provided
  const emailUsername = email.split('@')[0];
  const username = emailUsername.substring(0, 30).replace(/[^a-zA-Z0-9_]/g, '_');

  // Check if user already exists by email
  const emailTaken = await isEmailTaken(email);
  if (emailTaken) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email. Please use a different email or log in.'
    });
  }

  // Check if user already exists by phone number (if provided)
  if (phoneNumber) {
    const phoneTaken = await isPhoneTaken(phoneNumber);
    if (phoneTaken) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number. Please use a different phone number or log in.'
      });
    }
  }

  // Validate role - new professional roles
  const validRoles = ['business_user', 'company_admin', 'system_admin'];
  if (!requestedRole || !validRoles.includes(requestedRole)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Please select a valid role: Business User, Company Admin, or System Admin.'
    });
  }
  const userRole = requestedRole;

  // Check database connection before attempting registration
  const { hasDb } = require('../services/userRepo');
  if (!hasDb()) {
    console.error('Registration failed: Database not connected');
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.'
    });
  }

  // Create user
  const user = await createUser({ username, email, password, firstName, lastName, phoneNumber, role: userRole });

  if (!user) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again or contact support.'
    });
  }

  // Initialize user's dashboard
  try {
    await initializeUserDashboard(user.id);
    console.log(`✅ Dashboard initialized for new user: ${user.email} (ID: ${user.id})`);
  } catch (dashboardError) {
    // Don't fail registration if dashboard initialization fails
    console.warn(`Failed to initialize dashboard for user ${user.id}:`, dashboardError);
  }

  // Log registration
  await audit({ action: 'create', entity: 'user', entityId: user.id, performedBy: user.id, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.status(201).json({
    success: true,
    message: 'Account created successfully! Please log in.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
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

  // Normalize email (lowercase, trim)
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Check database connection
  const { hasDb } = require('../services/userRepo');
  if (!hasDb()) {
    console.error('Login attempt failed: Database not connected');
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please contact support.'
    });
  }

  // Check for user
  let found;
  try {
    found = await findByEmailWithPassword(normalizedEmail);
    if (config.NODE_ENV !== 'production') {
      console.log(`User lookup for ${normalizedEmail}:`, found ? `Found (ID: ${found.id})` : 'Not found - user must register first');
    }
  } catch (dbError) {
    console.error('Database error during login lookup:', dbError);
    return res.status(500).json({
      success: false,
      message: 'Database error. Please try again later.'
    });
  }

  // User not found - require registration first
  if (!found) {
    console.log(`❌ Login attempt failed: User not found for email: ${normalizedEmail}`);
    return res.status(401).json({
      success: false,
      message: 'User not found. Please create an account first.',
      code: 'USER_NOT_FOUND'
    });
  }


  // Check if user is active (handle both 0/1 and boolean values)
  const isActive = found.is_active === 1 || found.is_active === true || found.isActive === true;
  if (!isActive) {
    console.warn(`Login attempt failed: Account deactivated for email: ${normalizedEmail}`);
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact support.'
    });
  }

  // Role is determined during registration, not login
  // User's role is stored in database and used for authorization

  // Validate password hash exists
  // Google OAuth users have NULL password_hash, so they must use Google login
  if (!found.password_hash) {
    console.log(`Login attempt with password for Google OAuth user: ${normalizedEmail} (ID: ${found.id})`);
    return res.status(401).json({
      success: false,
      message: 'This account was created with Google. Please use "Sign in with Google" to log in.',
      code: 'GOOGLE_OAUTH_ACCOUNT'
    });
  }

  // Check password
  let isMatch = false;
  try {
    if (config.NODE_ENV !== 'production') {
      console.log(`🔐 Comparing password for user: ${normalizedEmail} (ID: ${found.id})`);
    }
    isMatch = await comparePassword(password, found.password_hash);
    
    if (!isMatch) {
      console.warn(`❌ Login attempt failed: Invalid password for email: ${normalizedEmail} (User ID: ${found.id}, Role: ${found.role})`);
      // Log password hash length for debugging (don't log actual hash)
      console.warn(`Password hash length: ${found.password_hash ? found.password_hash.length : 'NULL'}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.',
        code: 'INVALID_PASSWORD'
      });
    }
  } catch (compareError) {
    console.error('❌ Password comparison error:', compareError);
    return res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.'
    });
  }

  // Update last login
  try {
    await updateLastLogin(found.id);
  } catch (updateError) {
    // Don't fail login if last login update fails, just log it
    console.warn('Failed to update last login:', updateError);
  }

  // Ensure dashboard is initialized (in case it wasn't created during registration)
  try {
    await initializeUserDashboard(found.id);
  } catch (dashboardError) {
    // Don't fail login if dashboard initialization fails
    console.warn(`Failed to ensure dashboard exists for user ${found.id}:`, dashboardError);
  }

  // Generate token
  let token;
  try {
    token = generateToken(found.id);
  } catch (tokenError) {
    console.error('Token generation error:', tokenError);
    return res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.'
    });
  }

  // Get user data for response
  let userData;
  try {
    userData = await findById(found.id);
    if (!userData) {
      console.error(`User data not found after successful login for ID: ${found.id}`);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user data. Please try again.',
        code: 'USER_DATA_ERROR'
      });
    }
  } catch (userError) {
    console.error('Error fetching user data after login:', userError);
    console.error('Error stack:', userError.stack);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user data. Please try again.',
      code: 'USER_DATA_ERROR',
      ...(process.env.NODE_ENV === 'development' && { error: userError.message })
    });
  }

  // Create or update session
  try {
    await createOrUpdateSession(userData.id, token, req);
    
    // Broadcast session update via Socket.io
    const io = getIOInstance();
    if (io) {
      const { getUserSessions } = require('../services/sessionRepo');
      const sessions = await getUserSessions(userData.id);
      io.to(`user:${userData.id}`).emit('sessions:update', sessions);
    }
  } catch (sessionError) {
    // Don't fail login if session creation fails, just log it
    console.warn('Failed to create session:', sessionError);
  }

  // Log successful login
  try {
    await audit({ 
      action: 'login', 
      entity: 'user', 
      entityId: found.id, 
      performedBy: found.id, 
      ipAddress: req.ip, 
      userAgent: req.get('User-Agent') 
    });
  } catch (auditError) {
    // Don't fail login if audit fails, just log it
    console.warn('Failed to audit login:', auditError);
  }

  console.log(`Successful login for user: ${userData.email} (ID: ${userData.id})`);

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: userData, token }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please log in again.'
      });
    }

    // Refresh user data from database to ensure we have latest
    const freshUser = await findById(req.user.id);
    
    if (!freshUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please log in again.'
      });
    }

  res.json({
    success: true,
      data: freshUser
  });
  } catch (error) {
    console.error('Error in getMe:', error);
    throw error; // Let asyncHandler catch and format it
  }
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

  const { firstName, lastName, email, phoneNumber } = req.body;
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

  // Check if phone number is already taken by another user
  if (phoneNumber && phoneNumber !== req.user.phoneNumber) {
    const taken = await isPhoneTaken(phoneNumber, userId);
    if (taken) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already taken'
      });
    }
  }

  const user = await updateProfileById(userId, { firstName, lastName, email, phoneNumber });

  // Log profile update
  await audit({ action: 'update', entity: 'user', entityId: userId, changes: { firstName, lastName, email, phoneNumber }, performedBy: userId, ipAddress: req.ip, userAgent: req.get('User-Agent') });

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
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userId = req.user.id;
  
  // Delete current session
  if (token) {
    const { deleteSession } = require('../services/sessionRepo');
    await deleteSession(token);
  }
  
  // Broadcast session update via Socket.io
  const io = getIOInstance();
  if (io) {
    const { getUserSessions } = require('../services/sessionRepo');
    const sessions = await getUserSessions(userId);
    io.to(`user:${userId}`).emit('sessions:update', sessions);
  }
  
  // Log logout
  await audit({ action: 'logout', entity: 'user', entityId: userId, performedBy: userId, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Upload avatar
// @route   POST /api/auth/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const userId = req.user.id;
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  
  const user = await updateProfileById(userId, { avatarUrl });

  // Log avatar update
  await audit({ action: 'update', entity: 'user', entityId: userId, changes: { avatarUrl }, performedBy: userId, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: user
  });
});

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { theme, twoFactorEnabled, twoFactorMethod, emailNotifications, autoBackups, showTips } = req.body;
  const userId = req.user.id;

  // Get current preferences
  const currentUser = await findById(userId);
  const currentPrefs = currentUser?.preferences || {};

  // Merge with new preferences
  const newPrefs = {
    ...currentPrefs,
    ...(theme !== undefined && { theme }),
    ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
    ...(twoFactorMethod !== undefined && { twoFactorMethod }),
    ...(emailNotifications !== undefined && { emailNotifications }),
    ...(autoBackups !== undefined && { autoBackups }),
    ...(showTips !== undefined && { showTips })
  };

  const user = await updateUserPreferences(userId, newPrefs);

  // Log preferences update
  await audit({ action: 'update', entity: 'user', entityId: userId, changes: { preferences: newPrefs }, performedBy: userId, ipAddress: req.ip, userAgent: req.get('User-Agent') });

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: user
  });
});

// @desc    Login or register with Google ID token
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  try {
    const idToken = req.body?.idToken;
    
    if (!googleClient || !googleClientId) {
      console.error('Google login not configured: missing GOOGLE_CLIENT_ID');
      console.error('Environment check:', {
        hasGoogleClient: !!googleClient,
        hasGoogleClientId: !!googleClientId,
        googleClientIdValue: googleClientId || 'EMPTY',
        envCheck: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Google login not configured. Please ensure GOOGLE_CLIENT_ID is set in backend/.env file.',
        code: 'GOOGLE_NOT_CONFIGURED'
      });
    }
    
    if (!idToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing idToken. Please try signing in again.' 
      });
    }
    
    // Verify token with Google
    let ticket, payload;
    try {
      ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientId });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Google token. Please try signing in again.' 
      });
    }
    
    const email = payload?.email;
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google account email not found. Please use a different account.' 
      });
    }
    
    const names = (payload?.name || '').split(' ');
    const firstName = payload?.given_name || names[0] || '';
    const lastName = payload?.family_name || names.slice(1).join(' ') || '';

    // Check database connection
    const { hasDb } = require('../services/userRepo');
    if (!hasDb()) {
      console.error('Google login failed: Database not connected');
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please contact support.'
      });
    }

    // Upsert user
    let user;
    let isNewUser = false;
    try {
      // Check if user already exists before creating
      const existingUser = await require('../services/userRepo').findByEmail(email);
      user = await require('../services/userRepo').createOrGetGoogleUser({ email, firstName, lastName });
      
      // If user didn't exist before, this is a new user
      // createOrGetGoogleUser returns existing user if found, so check if it was just created
      if (!existingUser && user) {
        isNewUser = true;
      }
    } catch (userError) {
      console.error('Error creating/getting Google user:', userError);
      // Check if it's a database schema issue
      if (userError.message && userError.message.includes('password_hash')) {
        return res.status(500).json({
          success: false,
          message: 'Database configuration error. Please run migrations to update the schema.',
          error: 'SCHEMA_ERROR',
          hint: 'Run: npm run db:migrate in the backend directory'
        });
      }
      throw userError;
    }
    
    if (!user) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create or retrieve user account. Please try again.' 
      });
    }
    
    // Initialize dashboard for new users
    if (isNewUser) {
      try {
        await initializeUserDashboard(user.id);
        console.log(`✅ Dashboard initialized for new Google user: ${user.email} (ID: ${user.id})`);
      } catch (dashboardError) {
        // Don't fail login if dashboard initialization fails
        console.warn(`Failed to initialize dashboard for user ${user.id}:`, dashboardError);
      }
    }

    // Check if profile completion is needed
    // Profile completion is needed if:
    // 1. Phone number is missing
    // 2. Role is the default 'user' (needs to be set to one of the professional roles)
    const needsProfileCompletion = !user.phoneNumber || user.role === 'user';

    // Issue JWT (needed for profile completion endpoint)
    let token;
    try {
      token = generateToken(user.id);
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Authentication error. Please try again.'
      });
    }

    // Update last login
    try {
      await updateLastLogin(user.id);
    } catch (updateError) {
      console.warn('Failed to update last login:', updateError);
    }

    // Create or update session
    try {
      await createOrUpdateSession(user.id, token, req);
      
      // Broadcast session update via Socket.io
      const io = getIOInstance();
      if (io) {
        const { getUserSessions } = require('../services/sessionRepo');
        const sessions = await getUserSessions(user.id);
        io.to(`user:${user.id}`).emit('sessions:update', sessions);
      }
    } catch (sessionError) {
      console.warn('Failed to create session:', sessionError);
    }

    // Audit
    try {
      await audit({ 
        action: 'login', 
        entity: 'user', 
        entityId: user.id, 
        performedBy: user.id, 
        ipAddress: req.ip, 
        userAgent: req.get('User-Agent'), 
        changes: { provider: 'google' } 
      });
    } catch (auditError) {
      console.warn('Failed to audit login:', auditError);
    }

    console.log(`✅ Google login successful: ${user.email} (ID: ${user.id})`);

    if (needsProfileCompletion) {
      return res.json({ 
        success: true, 
        message: 'Profile completion required', 
        needsProfileCompletion: true,
        data: { user, token } 
      });
    }

    res.json({ 
      success: true, 
      message: 'Login successful', 
      needsProfileCompletion: false, 
      data: { user, token } 
    });
  } catch (error) {
    console.error('Google login error:', error);
    throw error; // Let asyncHandler handle it
  }
});

// @desc    Complete Google user profile
// @route   POST /api/auth/complete-google-profile
// @access  Private
const completeGoogleProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { firstName, lastName, phoneNumber, role } = req.body;
  const userId = req.user.id;

  // Validate role
  const validRoles = ['business_user', 'company_admin', 'system_admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Please select a valid role: business_user, company_admin, or system_admin.'
    });
  }

  // Check if phone number is already taken by another user
  if (phoneNumber) {
    const taken = await isPhoneTaken(phoneNumber, userId);
    if (taken) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already taken'
      });
    }
  }

  // Update user profile
  let user;
  try {
    user = await updateProfileById(userId, { firstName, lastName, phoneNumber, role });
  } catch (dbError) {
    // Handle database errors, especially role column truncation
    if (dbError.code === 'ROLE_COLUMN_TRUNCATION' || (dbError.message && dbError.message.includes('Role column'))) {
      console.error('Database error updating role:', dbError);
      // If auto-fix was attempted but failed, provide helpful message
      if (dbError.message && dbError.message.includes('auto-fix')) {
        return res.status(500).json({
          success: false,
          message: 'Database schema error: Role column is too small. Please run migration 202501200000_fix_role_column_comprehensive.sql to fix it.',
          error: 'ROLE_COLUMN_TRUNCATION',
          migrationFile: '202501200000_fix_role_column_comprehensive.sql'
        });
      }
      // If auto-fix was successful, tell user to retry
      return res.status(500).json({
        success: false,
        message: 'Database schema was updated. Please refresh the page and try again.',
        error: 'ROLE_COLUMN_TRUNCATION',
        retry: true
      });
    }
    // Re-throw other database errors
    throw dbError;
  }
  
  if (!user) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }

  // Log profile completion
  await audit({ 
    action: 'update', 
    entity: 'user', 
    entityId: userId, 
    changes: { firstName, lastName, phoneNumber, role, profileCompleted: true }, 
    performedBy: userId, 
    ipAddress: req.ip, 
    userAgent: req.get('User-Agent') 
  });

  // Verify the user was updated correctly and matches the token user
  const finalUser = await findById(userId);
  if (!finalUser) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve updated user data'
    });
  }

  // Verify user ID matches the token (security check)
  if (finalUser.id !== userId) {
    console.error(`❌ User ID mismatch: token user ${userId} vs returned user ${finalUser.id}`);
    return res.status(500).json({
      success: false,
      message: 'User data mismatch. Please try again.'
    });
  }

  console.log(`✅ Profile completed for user: ${finalUser.email} (ID: ${finalUser.id}, Role: ${finalUser.role})`);

  res.json({
    success: true,
    message: 'Profile completed successfully',
    data: finalUser
  });
});

// @desc    Store Google OAuth tokens for Sheets access
// @route   POST /api/auth/store-google-tokens
// @access  Private
const storeGoogleTokens = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, expiresIn } = req.body;
  const userId = req.user.id;

  if (!accessToken) {
    return res.status(400).json({
      success: false,
      message: 'Access token is required'
    });
  }

  // Calculate expiration time (expiresIn is in seconds)
  const expiresAt = expiresIn 
    ? new Date(Date.now() + expiresIn * 1000)
    : new Date(Date.now() + 3600 * 1000); // Default 1 hour

  try {
    const { updateGoogleTokens } = require('../services/userRepo');
    await updateGoogleTokens(userId, {
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt
    });

    console.log(`✅ Google tokens stored for user: ${userId}`);

    res.json({
      success: true,
      message: 'Google tokens stored successfully'
    });
  } catch (error) {
    console.error('Error storing Google tokens:', error);
    throw error;
  }
});

// @desc    Google OAuth callback (server-side flow)
// @route   GET /auth/google/callback
// @access  Public
// Initiate Google OAuth server-side flow by redirecting to Google's consent page
const googleStart = asyncHandler(async (req, res) => {
  if (!googleClientId || !googleClientSecret) {
    console.error('Google OAuth server-side flow not configured (missing client id/secret)');
    return res.status(500).send('Google OAuth not configured');
  }

  try {
    // CRITICAL: OAuth redirect URI must be exactly https://nbaurum.com/api/auth/google/callback
    // The API is served behind Nginx at /api, so the full callback URL includes /api
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || config.GOOGLE_OAUTH_REDIRECT_URI;
    if (!redirectUri) {
      console.error('Google OAuth redirect URI is not configured. Set GOOGLE_OAUTH_REDIRECT_URI environment variable.');
      return res.status(500).send('Google OAuth not configured');
    }
    const oauth2Client = new OAuth2Client(googleClientId, googleClientSecret, redirectUri);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'consent'
    });

    // Optional: preserve a "next" param for redirect after login
    const next = req.query.next ? `&state=${encodeURIComponent(JSON.stringify({ next: req.query.next }))}` : '';
    if (config.NODE_ENV !== 'production') {
      console.log('Redirecting user to Google OAuth consent screen:', authUrl + next);
    }
    return res.redirect(authUrl + next);
  } catch (err) {
    console.error('Error initiating Google OAuth flow:', err);
    return res.status(500).send('Failed to initiate Google OAuth');
  }
});

const googleCallback = asyncHandler(async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;
  
  // Handle OAuth errors from Google (user denied access, etc.)
  if (error) {
    console.error('Google OAuth error:', error, req.query.error_description || '');
    const frontend = (config.FRONTEND_URL || 'https://nbaurum.com').replace(/\/+$/, '');
    return res.redirect(`${frontend}/login?error=oauth_cancelled`);
  }
  
  // Check for missing authorization code
  if (!code) {
    console.error('Missing authorization code in Google OAuth callback');
    const frontend = (config.FRONTEND_URL || 'https://nbaurum.com').replace(/\/+$/, '');
    return res.redirect(`${frontend}/login?error=oauth_failed`);
  }

  if (!googleClientId || !googleClientSecret) {
    console.error('Google OAuth server-side flow not configured (missing client id/secret)');
    return res.status(500).send('Google OAuth not configured');
  }

  try {
    // CRITICAL: OAuth redirect URI must be exactly https://nbaurum.com/api/auth/google/callback
    // The API is served behind Nginx at /api, so the full callback URL includes /api
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || config.GOOGLE_OAUTH_REDIRECT_URI;
    if (!redirectUri) {
      console.error('Google OAuth redirect URI is not configured. Set GOOGLE_OAUTH_REDIRECT_URI environment variable.');
      return res.status(500).send('Google OAuth not configured');
    }
    if (config.NODE_ENV === 'production') {
      console.log('Using Google OAuth redirect URI:', redirectUri);
    }
    const oauth2Client = new OAuth2Client(googleClientId, googleClientSecret, redirectUri);

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    const idToken = tokens.id_token || tokens.idToken;
    if (!idToken) {
      console.error('No ID token returned from Google during code exchange');
      return res.status(400).send('No ID token from Google');
    }

    // Verify ID token and extract user info
    const ticket = await oauth2Client.verifyIdToken({ idToken, audience: googleClientId });
    const payload = ticket.getPayload();
    const email = payload.email;
    const firstName = payload.given_name || (payload.name && payload.name.split(' ')[0]) || '';
    const lastName = payload.family_name || (payload.name && payload.name.split(' ').slice(1).join(' ')) || '';

    // Create or get Google user
    const { createOrGetGoogleUser } = require('../services/userRepo');
    const user = await createOrGetGoogleUser({ email, firstName, lastName });

    // Generate JWT and create session
    const token = generateToken(user.id);
    try {
      await createOrUpdateSession(user.id, token, req);
    } catch (sessionErr) {
      console.warn('Failed to create session during Google callback:', sessionErr);
    }

    // Store Google tokens (access/refresh) if provided (used by Google Sheets integration)
    if (tokens.access_token) {
      try {
        const { updateGoogleTokens } = require('../services/userRepo');
        await updateGoogleTokens(user.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || null,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
        });
      } catch (tokenErr) {
        console.warn('Failed to store Google tokens from callback:', tokenErr);
      }
    }

    // Redirect to dedicated frontend callback page with JWT token (frontend will read token and complete login)
    const frontend = (config.FRONTEND_URL || 'https://nbaurum.com').replace(/\/+$/, '');
    const redirectUrl = `${frontend}/auth/callback?token=${encodeURIComponent(token)}`;
    if (config.NODE_ENV === 'production') {
      // Only log in production if needed for debugging
      // console.log('Redirecting to frontend auth callback after Google OAuth:', redirectUrl);
    } else {
      console.log('Redirecting to frontend auth callback after Google OAuth:', redirectUrl);
    }
    return res.redirect(redirectUrl);

  } catch (err) {
    console.error('Error handling Google OAuth callback:', err);
    return res.status(500).send('Google OAuth callback error');
  }
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  googleLogin,
  googleStart,
  googleCallback,
  completeGoogleProfile,
  uploadAvatar,
  updatePreferences,
  storeGoogleTokens,
  uploadAvatarMiddleware: upload.single('avatar')
};


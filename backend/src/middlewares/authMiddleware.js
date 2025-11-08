const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { findById } = require('../services/userRepo');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        console.error('Invalid JWT token:', jwtError.message);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token. Please log in again.' 
        });
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        console.error('Expired JWT token');
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired. Please log in again.' 
        });
      }
      
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ 
        success: false, 
        message: 'Token verification failed. Please log in again.' 
      });
    }

    if (!decoded || !decoded.id) {
      console.error('Invalid token payload:', decoded);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token format.' 
      });
    }

    // Check database connection
    const { hasDb } = require('../services/userRepo');
    if (!hasDb()) {
      console.error('Database not connected in authMiddleware');
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection unavailable. Please try again later.' 
      });
    }

    let user;
    try {
      user = await findById(decoded.id);
    } catch (dbError) {
      console.error('Database error in authMiddleware:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error retrieving user data. Please try again.' 
      });
    }
    
    if (!user) {
      console.error(`User not found for ID: ${decoded.id}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    // Check if user is active (handle both 0/1 and boolean values)
    const isActive = user.isActive === 1 || user.isActive === true || user.isActive !== false;
    if (!isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Unexpected error in authMiddleware:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication. Please try again.' 
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await findById(decoded.id);
      
      if (user && (user.isActive === undefined || user.isActive)) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuth
};

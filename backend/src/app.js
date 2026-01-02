const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const config = require('./config/env');
const { requestLogger, devLogger } = require('./middlewares/requestLogger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const momRoutes = require('./routes/momRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const billingRoutes = require('./routes/billingRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const actionItemRoutes = require('./routes/actionItemRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const userRoutes = require('./routes/userRoutes');
const poEntryRoutes = require('./routes/poEntryRoutes');
const googleSheetsRoutes = require('./routes/googleSheetsRoutes');
const importRoutes = require('./routes/importRoutes');
const searchRoutes = require('./routes/searchRoutes');
const masterDataRoutes = require('./routes/masterDataRoutes');

// Connect to database (async, but don't block server startup)
connectDB().then(() => {
  // Connection handled in db.js with console logs
}).catch((err) => {
  console.error('⚠️  Database connection error:', err.message);
});

const app = express();
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting - disabled outside production to avoid blocking local logins
if (config.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // allow more requests even in production
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', limiter);
} else {
  console.info('⚠️  Rate limiting is disabled in non-production environments.');
}

// CORS configuration - Production-ready with strict origin validation
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    // This is safe because these requests don't have cookies/credentials
    if (!origin) {
      // In production, log but allow no-origin requests (needed for health checks, etc.)
      if (config.NODE_ENV === 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    }
    
    // Production: Strict origin validation - ONLY allow configured frontend URL
    if (config.NODE_ENV === 'production') {
      // Normalize origins for comparison (remove trailing slashes)
      const normalizedOrigin = origin.replace(/\/+$/, '');
      const normalizedAllowed = config.CORS_ORIGIN?.replace(/\/+$/, '') || '';
      const normalizedFrontend = config.FRONTEND_URL?.replace(/\/+$/, '') || '';
      
      // Check against configured CORS_ORIGIN and FRONTEND_URL
      if (normalizedOrigin === normalizedAllowed || normalizedOrigin === normalizedFrontend) {
        return callback(null, true);
      }
      
      // Log blocked request in production
      if (config.NODE_ENV === 'production') {
        console.warn(`⚠️  CORS: Blocked request from origin: ${origin} (allowed: ${normalizedAllowed})`);
      }
      return callback(new Error(`Not allowed by CORS. Origin ${origin} is not authorized.`));
    }
    
    // Development: Allow common localhost origins for easier testing
    const devOrigins = [
      config.CORS_ORIGIN,
      config.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ].filter(Boolean);
    
    if (devOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // In development, allow all origins for flexibility
    return callback(null, true);
  },
  credentials: true, // Required for cookies/auth tokens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploads (avatars)
app.use('/uploads', express.static('uploads'));

// Request logging
if (config.NODE_ENV === 'development') {
  app.use(devLogger);
} else {
  app.use(requestLogger);
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Financial Management System API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// Google OAuth server-side start & callback endpoints (root paths used to match Google Console entries)
// Start: GET /auth/google -> redirects to Google consent screen
// Callback: GET /auth/google/callback -> exchange code and redirect to frontend
const { googleStart, googleCallback } = require('./controllers/authController');
app.get('/auth/google', googleStart);
app.get('/auth/google/callback', googleCallback);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mom', momRoutes);
app.use('/api/action-items', actionItemRoutes);
app.use('/api/admin/database', databaseRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/po-entry', poEntryRoutes);
app.use('/api/google-sheets', googleSheetsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin/master-data', masterDataRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);



module.exports = app;

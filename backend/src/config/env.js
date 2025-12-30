require('dotenv').config();

// Strict validation for production environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

function requireEnv(name, defaultValue = undefined, allowEmpty = false) {
  const value = process.env[name] || defaultValue;
  
  if (isProduction && !allowEmpty && (!value || value.trim() === '')) {
    console.error(`\n❌ FATAL ERROR: Required environment variable ${name} is not set in production!\n`);
    console.error(`   Please set ${name} in your production environment (PM2/systemd/Docker).\n`);
    process.exit(1);
  }
  
  return value || defaultValue;
}

// Production-required variables (fail loudly if missing)
const config = {
  PORT: parseInt(requireEnv('PORT', '5000'), 10),
  NODE_ENV,

  // Auth / Security - REQUIRED in production
  JWT_SECRET: requireEnv('JWT_SECRET', isProduction ? undefined : 'your-super-secret-jwt-key-change-in-production'),
  JWT_EXPIRE: requireEnv('JWT_EXPIRE', '7d'),

  // Email (optional)
  EMAIL_HOST: requireEnv('EMAIL_HOST', 'smtp.gmail.com', true),
  EMAIL_PORT: parseInt(requireEnv('EMAIL_PORT', '587'), 10),
  EMAIL_USER: requireEnv('EMAIL_USER', '', true),
  EMAIL_PASS: requireEnv('EMAIL_PASS', '', true),

  // Frontend + CORS - REQUIRED in production
  FRONTEND_URL: requireEnv('FRONTEND_URL', isProduction ? undefined : 'http://localhost:3001'),
  CORS_ORIGIN: requireEnv('CORS_ORIGIN', isProduction ? undefined : 'http://localhost:3001'),

  // Google OAuth - REQUIRED if using Google login
  // CRITICAL: Must be exactly https://nbaurum.com/api/auth/google/callback
  // The API is served behind Nginx at /api, so the full callback URL includes /api
  GOOGLE_OAUTH_REDIRECT_URI: requireEnv(
    'GOOGLE_OAUTH_REDIRECT_URI',
    isProduction ? undefined : 'https://nbaurum.com/api/auth/google/callback'
  ),

  // MySQL - REQUIRED in production
  MYSQL_HOST: requireEnv('MYSQL_HOST', isProduction ? undefined : '127.0.0.1'),
  MYSQL_PORT: parseInt(requireEnv('MYSQL_PORT', '3306'), 10),
  MYSQL_USER: requireEnv('MYSQL_USER', isProduction ? undefined : 'root'),
  MYSQL_PASSWORD: requireEnv('MYSQL_PASSWORD', isProduction ? undefined : ''),
  MYSQL_DATABASE: requireEnv('MYSQL_DATABASE', isProduction ? undefined : 'financial_mgmt_db')
};

// Validate production configuration
if (isProduction) {
  if (!config.FRONTEND_URL || !config.FRONTEND_URL.startsWith('https://')) {
    console.error('\n❌ FATAL ERROR: FRONTEND_URL must be a valid HTTPS URL in production!\n');
    process.exit(1);
  }
  
  if (!config.CORS_ORIGIN || !config.CORS_ORIGIN.startsWith('https://')) {
    console.error('\n❌ FATAL ERROR: CORS_ORIGIN must be a valid HTTPS URL in production!\n');
    process.exit(1);
  }
  
  if (config.GOOGLE_OAUTH_REDIRECT_URI && !config.GOOGLE_OAUTH_REDIRECT_URI.includes('/api/auth/google/callback')) {
    console.warn('\n⚠️  WARNING: GOOGLE_OAUTH_REDIRECT_URI should be https://nbaurum.com/api/auth/google/callback\n');
  }
  
  console.log('✅ Environment configuration validated for production');
  console.log(`   Frontend: ${config.FRONTEND_URL}`);
  console.log(`   CORS Origin: ${config.CORS_ORIGIN}`);
  console.log(`   OAuth Redirect: ${config.GOOGLE_OAUTH_REDIRECT_URI || 'Not set'}`);
}

module.exports = config;

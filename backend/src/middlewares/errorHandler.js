const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with full details
  logger.error(err);
  console.error('❌ Error Handler:', {
    message: err.message,
    code: err.code,
    sqlState: err.sqlState,
    sqlMessage: err.sqlMessage,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle multer errors (file upload errors)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the maximum limit of 10MB',
      error: 'FILE_TOO_LARGE'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field. Please use the field name "file"',
      error: 'INVALID_FIELD_NAME'
    });
  }

  if (err.message && err.message.includes('Only Excel files')) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: 'INVALID_FILE_TYPE'
    });
  }

  // MySQL/Database errors
  if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_TABLE') {
    const message = 'Database schema error. Please run migrations: npm run db:migrate';
    error = { message, statusCode: 500, code: err.code };
  }

  // MySQL constraint errors
  if (err.code === 'ER_DUP_ENTRY') {
    const field = err.sqlMessage?.match(/for key '(.+?)'/)?.[1] || 'field';
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // MySQL data truncation (e.g., role column too small)
  if (err.code === 'WARN_DATA_TRUNCATED' || (err.message && err.message.includes('Data truncated'))) {
    const message = 'Database schema error. Please run migrations to update the schema.';
    error = { message, statusCode: 500, code: 'SCHEMA_ERROR' };
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(error.code && { code: error.code }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: {
        code: err.code,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage
      }
    })
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};

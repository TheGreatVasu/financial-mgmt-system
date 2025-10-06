const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom token for morgan
morgan.token('user', (req) => {
  return req.user ? req.user.username : 'anonymous';
});

morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    return JSON.stringify(req.body);
  }
  return '';
});

// Custom format
const customFormat = ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Create morgan middleware
const requestLogger = morgan(customFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
});

// Development format
const devFormat = ':method :url :status :response-time ms - :res[content-length] :body';

const devLogger = morgan(devFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
});

module.exports = {
  requestLogger,
  devLogger
};

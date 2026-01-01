// Suppress punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    // Suppress punycode deprecation warnings from dependencies
    return;
  }
  // Log other warnings normally
  console.warn(warning.name, warning.message);
});

const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { findAvailablePort, killPortProcess } = require('./utils/portFinder');
const { initializeSocket, setIOInstance } = require('./services/socketService');

const DESIRED_PORT = config.PORT;
let ACTUAL_PORT = DESIRED_PORT;
let server = null;

// Function to start server with automatic port finding
async function startServer() {
  try {
    // Check if desired port is available
    const { isPortAvailable } = require('./utils/portFinder');
    const portAvailable = await isPortAvailable(DESIRED_PORT);
    
    if (!portAvailable) {
      console.log(`⚠️  Port ${DESIRED_PORT} is already in use. Attempting to find next available port...`);
      
      // Try to kill the process on the desired port first
      const killed = await killPortProcess(DESIRED_PORT);
      if (killed) {
        console.log(`✅ Killed process on port ${DESIRED_PORT}`);
        // Wait a moment for port to be released
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Check again if port is now available
      const portAvailableAfterKill = await isPortAvailable(DESIRED_PORT);
      if (portAvailableAfterKill) {
        ACTUAL_PORT = DESIRED_PORT;
        console.log(`✅ Port ${DESIRED_PORT} is now available`);
      } else {
        // Find next available port
        ACTUAL_PORT = await findAvailablePort(DESIRED_PORT, 10);
        console.log(`💡 Using alternative port: ${ACTUAL_PORT}`);
      }
    }
    
    // Start server on the determined port
    server = app.listen(ACTUAL_PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${ACTUAL_PORT} (${config.NODE_ENV})`);
      console.log(`Server started on port ${ACTUAL_PORT}`);
      
      // Initialize Socket.io after server starts
      const io = initializeSocket(server);
      setIOInstance(io);
      
      // Signal PM2 that server is ready (for wait_ready)
      if (process.send) {
        process.send('ready');
      }
    });
    
    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${ACTUAL_PORT} became unavailable: ${err.message}`);
        console.error(`❌ Port ${ACTUAL_PORT} became unavailable during startup`);
        process.exit(1);
      } else {
        logger.error(`Server error: ${err.message}`);
        console.error(`❌ Server error: ${err.message}`);
        process.exit(1);
      }
    });
    
    return server;
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    console.error(`❌ Failed to start server: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

// Start server asynchronously
startServer().catch((err) => {
  logger.error(`Fatal error starting server: ${err.message}`);
  console.error(`❌ Fatal error: ${err.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  // Don't exit on EADDRINUSE - let the server error handler deal with it
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${ACTUAL_PORT || DESIRED_PORT} is already in use.`);
    console.error(`❌ Port ${ACTUAL_PORT || DESIRED_PORT} is already in use.`);
    process.exit(1);
  }
  
  logger.error(`Uncaught Exception: ${err.message}`);
  console.error(`❌ Uncaught Exception: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }
  
  // Close server gracefully if it exists
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful shutdown handlers
function gracefulShutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('Server closed. Process terminated.');
    console.log('✅ Server closed. Process terminated.');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Handle Ctrl+C

module.exports = server;

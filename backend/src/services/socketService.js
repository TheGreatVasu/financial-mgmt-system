const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { getUserSessions } = require('./sessionRepo');
const { _buildDashboardPayload: buildDashboardPayload } = require('../controllers/dashboardController');
const { buildSalesInvoiceDashboardData } = require('../controllers/salesInvoiceDashboardController');

// Store user socket connections: userId -> Set of socketIds
const userSockets = new Map();

// Socket.io authentication middleware
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.userId = decoded.id;
    socket.token = token;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
}

// Initialize Socket.io
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGIN || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });
  
  // Authentication middleware
  io.use(authenticateSocket);
  
  // Connection handler
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const token = socket.token;
    
    console.log(`Socket connected: User ${userId}, Socket ${socket.id}`);
    
    // Add socket to user's socket set
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);
    
    // Join user's room for targeted updates
    socket.join(`user:${userId}`);
    
    // Send current sessions on connect
    try {
      const sessions = await getUserSessions(userId);
      socket.emit('sessions:update', sessions);
    } catch (error) {
      console.error('Error sending initial sessions:', error);
    }
    
    // Handle session activity updates
    socket.on('session:activity', async () => {
      try {
        const sessions = await getUserSessions(userId);
        // Broadcast to all sockets for this user
        io.to(`user:${userId}`).emit('sessions:update', sessions);
      } catch (error) {
        console.error('Error updating session activity:', error);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: User ${userId}, Socket ${socket.id}`);
      
      // Remove socket from user's set
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
  
  return io;
}

// Broadcast session update to a specific user
function broadcastSessionUpdate(userId, sessions) {
  // This will be called from the io instance, so we need to pass it
  // For now, we'll return a function that takes the io instance
  return (io) => {
    if (io) {
      io.to(`user:${userId}`).emit('sessions:update', sessions);
    }
  };
}

// Get Socket.io instance (will be set after initialization)
let ioInstance = null;

function setIOInstance(io) {
  ioInstance = io;
}

function getIOInstance() {
  return ioInstance;
}

// Broadcast dashboard update to all connected users
async function broadcastDashboardUpdate(targetUserId = null) {
  const io = getIOInstance();
  if (!io) {
    console.warn('⚠️ Socket.io instance not available for broadcast');
    return;
  }

  const connectedUserIds = targetUserId 
    ? [targetUserId] 
    : Array.from(userSockets.keys());
    
  if (connectedUserIds.length === 0) {
    console.log('ℹ️ No connected users to broadcast to');
    return;
  }

  console.log(`📡 Broadcasting dashboard update to ${connectedUserIds.length} user(s):`, connectedUserIds);

  await Promise.all(
    connectedUserIds.map(async (userId) => {
      try {
        // Build main dashboard data
        const dashboardData = await buildDashboardPayload(userId);
        io.to(`user:${userId}`).emit('dashboard:update', dashboardData);

        // Build sales invoice dashboard data
        const salesInvoiceDashboard = await buildSalesInvoiceDashboardData(userId, {});
        console.log(`📊 Broadcasting sales invoice dashboard for user ${userId}:`, {
          hasData: salesInvoiceDashboard?.hasData,
          invoiceCount: salesInvoiceDashboard?.invoices?.length || 0,
          totalAmount: salesInvoiceDashboard?.summary?.totalInvoiceAmount || 0
        });
        
        io.to(`user:${userId}`).emit('sales-invoice-dashboard:update', {
          success: true,
          data: salesInvoiceDashboard,
          userId,
        });
        
        console.log(`✅ Successfully broadcasted to user ${userId}`);
      } catch (error) {
        console.error(`❌ Error broadcasting dashboard update for user ${userId}:`, error);
      }
    })
  );
  
  console.log('✅ Dashboard broadcast completed');
}

module.exports = {
  initializeSocket,
  broadcastSessionUpdate,
  broadcastDashboardUpdate,
  setIOInstance,
  getIOInstance,
  userSockets
};


const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { getUserSessions } = require('./sessionRepo');

// Store user socket connections: userId -> Set of socketIds
const userSockets = new Map();

// Socket.io authentication middleware
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET); // ✅ changed config → env
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
      origin: env.CORS_ORIGIN || 'http://localhost:3001', // ✅ changed config → env
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

    console.log(`✅ Socket connected: User ${userId}, Socket ${socket.id}`);

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
        io.to(`user:${userId}`).emit('sessions:update', sessions);
      } catch (error) {
        console.error('Error updating session activity:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: User ${userId}, Socket ${socket.id}`);

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
  return (io) => {
    if (io) {
      io.to(`user:${userId}`).emit('sessions:update', sessions);
    }
  };
}

// Manage Socket.io instance globally
let ioInstance = null;

function setIOInstance(io) {
  ioInstance = io;
}

function getIOInstance() {
  return ioInstance;
}

module.exports = {
  initializeSocket,
  broadcastSessionUpdate,
  setIOInstance,
  getIOInstance,
  userSockets
};

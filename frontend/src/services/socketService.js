import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function initializeSocket(token) {
  if (socket?.connected) {
    return socket;
  }

  // Socket connects directly to backend, not through proxy
  // In production, use VITE_API_BASE_URL (must be set)
  // Remove trailing /api to get the base URL for socket connection

  const baseURL = typeof import.meta?.env?.VITE_API_BASE_URL === 'string' ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '') : undefined;
  if (!baseURL) {
    throw new Error('VITE_API_BASE_URL must be set (non-empty string) to initialize sockets');
  }

  const socketUrl = baseURL.replace(/\/api\/?$/, '');
  
  socket = io(socketUrl, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS
  });

  socket.on('connect', () => {
    if (import.meta.env.DEV) {
      console.log('✅ Socket.io connected');
    }
    reconnectAttempts = 0;
  });

  socket.on('disconnect', (reason) => {
    if (import.meta.env.DEV) {
      console.log('❌ Socket.io disconnected:', reason);
    }
    if (reason === 'io server disconnect') {
      // Server disconnected, reconnect manually
      socket.connect();
    }
  });

  socket.on('connect_error', (error) => {
    // Always log connection errors, but less verbosely in production
    if (import.meta.env.DEV) {
      console.error('Socket.io connection error:', error);
    }
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Socket.io: Max reconnection attempts reached');
    }
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

export function updateSocketToken(token) {
  if (socket) {
    socket.auth.token = token;
    socket.disconnect();
    socket.connect();
  }
}


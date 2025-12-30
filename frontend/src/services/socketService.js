import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function initializeSocket(token) {
  if (socket?.connected) {
    return socket;
  }

  // Socket connects directly to backend, not through proxy
  // In development, vite proxy handles /api, but socket needs direct connection
  // Use VITE_API_BASE_URL when present (remove trailing /api); otherwise fall back to window.location.origin in development

  const baseURL = typeof import.meta?.env?.VITE_API_BASE_URL === 'string' ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '') : undefined;
  if (!baseURL) {
    throw new Error('VITE_API_BASE_URL must be set (non-empty string) to initialize sockets');
  }

  const socketUrl = baseURL ? baseURL.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : 'https://api.nbaurum.com')
  
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
    console.log('✅ Socket.io connected');
    reconnectAttempts = 0;
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.io disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server disconnected, reconnect manually
      socket.connect();
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
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


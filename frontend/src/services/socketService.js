import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Gets the socket URL from environment variables.
 * Validates lazily and logs warnings instead of throwing at module scope.
 * @returns {string|undefined} The socket URL or undefined if not set
 */
function getSocketUrl() {
  const baseURL = typeof import.meta?.env?.VITE_API_BASE_URL === 'string' 
    ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '') 
    : undefined;
  
  if (!baseURL && import.meta.env.DEV) {
    console.warn('⚠️  VITE_API_BASE_URL is not set. Socket connection will likely fail.');
  }
  if (!baseURL) {
    return undefined;
  }

  // Remove trailing /api to get the base URL for socket connection
  // Socket connects directly to backend, not through /api path
  return baseURL.replace(/\/api\/?$/, '');
}

/**
 * Initializes Socket.io connection to the backend.
 * Validates environment variables lazily - only throws when actually called.
 * @param {string|null} token - Optional JWT token for authentication
 * @returns {import('socket.io-client').Socket|null} Socket instance or null if env var missing
 * @throws {Error} If VITE_API_BASE_URL is not set (only when function is called)
 */
  export function initializeSocket(token) {
  if (socket?.connected) {
    return socket;
  }

  // Lazy validation - gracefully handle missing env var
  const socketUrl = getSocketUrl();
  if (!socketUrl) {
    console.warn('⚠️  Socket initialization skipped: VITE_API_BASE_URL is not set. Real-time features will be unavailable.');
    return null;
  }
  
  try {
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
      }
      reconnectAttempts = 0;
    });

    socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
      }
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      if (import.meta.env.DEV) {
      }
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      }
    });

    return socket;
  } catch (error) {
    console.warn('⚠️  Socket connection failed:', error.message);
    socket = null;
    return null;
  }}

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


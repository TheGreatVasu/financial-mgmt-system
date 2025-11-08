import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export function initializeSocket(token) {
  if (socket?.connected) {
    return socket;
  }

  const apiBaseUrl = import.meta?.env?.VITE_API_BASE_URL || '';
  // Extract base URL for socket (remove /api if present)
  let socketUrl = apiBaseUrl || 'http://localhost:5001';
  if (socketUrl.endsWith('/api')) {
    socketUrl = socketUrl.slice(0, -4);
  } else if (!socketUrl.startsWith('http')) {
    socketUrl = `http://${socketUrl}`;
  }

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


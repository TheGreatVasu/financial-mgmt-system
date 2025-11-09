import { useEffect, useState, useRef, useCallback } from 'react';
import { initializeSocket, disconnectSocket, getSocket } from '../services/socketService';
import { fetchSubscription } from '../services/subscriptionService';

/**
 * Custom hook for real-time subscription updates using Socket.IO with fallback polling
 * @param {string} token - Authentication token
 * @returns {Object} - { data, loading, error, isLive, connectionStatus, refresh }
 */
export function useRealtimeSubscription(token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'disconnected', 'polling'
  
  const pollingIntervalRef = useRef(null);
  const mountedRef = useRef(true);
  const socketRef = useRef(null);

  // Polling fallback function
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setConnectionStatus('polling');
    setIsLive(false);
    
    // Poll every 30 seconds for subscription updates
    pollingIntervalRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      
      try {
        const subscriptionData = await fetchSubscription(token);
        if (mountedRef.current) {
          setData(subscriptionData);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err?.message || 'Failed to fetch subscription data');
        }
      }
    }, 30000); // 30 seconds
  }, [token]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Initial data load
  const loadInitialData = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const subscriptionData = await fetchSubscription(token);
      if (mountedRef.current) {
        setData(subscriptionData);
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err?.message || 'Failed to load subscription');
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!token) {
      setLoading(false);
      return;
    }

    // Load initial data
    loadInitialData();

    // Initialize Socket.IO connection
    try {
      const socket = initializeSocket(token);
      socketRef.current = socket;

      // Connection handlers
      const handleConnect = () => {
        console.log('✅ Socket.io connected - Subscription live updates enabled');
        if (mountedRef.current) {
          setIsLive(true);
          setConnectionStatus('connected');
          stopPolling(); // Stop polling when WebSocket connects
        }
      };

      const handleDisconnect = (reason) => {
        console.log('❌ Socket.io disconnected:', reason);
        if (mountedRef.current) {
          setIsLive(false);
          setConnectionStatus('disconnected');
          // Start polling fallback when WebSocket disconnects
          startPolling();
        }
      };

      const handleConnectError = (error) => {
        console.error('Socket.io connection error:', error);
        if (mountedRef.current) {
          setIsLive(false);
          setConnectionStatus('disconnected');
          // Start polling fallback on connection error
          startPolling();
        }
      };

      // Listen for subscription updates
      const handleSubscriptionUpdate = (subscriptionData) => {
        if (mountedRef.current) {
          setData(subscriptionData);
          setError(null);
          setLoading(false);
        }
      };

      // Register event listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      socket.on('subscription:update', handleSubscriptionUpdate);
      socket.on('billing:update', handleSubscriptionUpdate); // Also listen for billing updates

      // Check initial connection status
      if (socket.connected) {
        setIsLive(true);
        setConnectionStatus('connected');
        stopPolling();
      } else {
        // If not connected, start polling immediately
        startPolling();
      }

      // Cleanup function
      return () => {
        mountedRef.current = false;
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
        socket.off('subscription:update', handleSubscriptionUpdate);
        socket.off('billing:update', handleSubscriptionUpdate);
        stopPolling();
      };
    } catch (err) {
      console.error('Error initializing socket:', err);
      // Fallback to polling if socket initialization fails
      if (mountedRef.current) {
        setConnectionStatus('disconnected');
        startPolling();
      }
    }

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [token, loadInitialData, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  const refresh = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  return {
    data,
    loading,
    error,
    isLive,
    connectionStatus,
    refresh
  };
}


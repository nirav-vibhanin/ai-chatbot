'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState } from '@/store/store';
import { updateStreamingMessage, completeStreamingMessage } from '@/store/slices/chatSlice';
import { clearAuth } from '@/store/slices/authSlice';
import { getCurrentUser, isUserAuthenticated, UserData } from '@/utils/userUtils';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let globalSocket: Socket | null = null;
let globalSocketPromise: Promise<Socket> | null = null;

export function useSocket() {
  const dispatch = useDispatch();
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 5;
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const periodicCheckRef = useRef<NodeJS.Timeout | null>(null);
  const processedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else if (reduxUser) {
      const userData: UserData = {
        id: reduxUser.id,
        email: reduxUser.email || '',
        name: reduxUser.username,
      };
      setCurrentUser(userData);
    }
  }, [reduxUser]);

  const connect = useCallback(async () => {
    if (!currentUser?.id) {
      return;
    }

    if (socket?.connected) {
      return;
    }

    if (isConnecting) {
      return;
    }

    if (connectionAttempts.current >= maxConnectionAttempts) {
      setConnectionError('Failed to connect after multiple attempts');
      return;
    }

    if (globalSocket?.connected) {
      setSocket(globalSocket);
      setIsConnected(true);
      setIsConnecting(false);
      return;
    }

    if (globalSocketPromise) {
      try {
        const existingSocket = await globalSocketPromise;
        setSocket(existingSocket);
        setIsConnected(true);
        setIsConnecting(false);
        return;
      } catch (error) {
        globalSocketPromise = null;
        globalSocket = null;
      }
    }
    
    setIsConnecting(true);
    setConnectionError(null);
    connectionAttempts.current++;
    
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      const newSocket = io(`${SOCKET_URL}/chat`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        timeout: 10000,
        auth: {
          token: token || 'no-token',
        },
        extraHeaders: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setIsReconnecting(false);
        setIsInitializing(false);
        setConnectionError(null);
        connectionAttempts.current = 0;
        
        if (currentUser?.id) {
          console.log('Joining user room immediately after connection:', currentUser.id);
          newSocket.emit('join', currentUser.id);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        processedMessageIds.current.clear();
        
        if (reason === 'io client disconnect') {
          return;
        }
        
        if (reason === 'io server disconnect') {
          setConnectionError('Server disconnected');
        } else {
          setConnectionError(`Disconnected: ${reason}`);
        }
        
         if (currentUser?.id && !connectionError?.includes('Session expired')) {
          setIsReconnecting(true);
          
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          
          retryTimeoutRef.current = setTimeout(() => {
            if (!isConnected && !isConnecting) {
              connect();
            }
            setIsReconnecting(false);
            retryTimeoutRef.current = null;
          }, 2000);
        }
      });

      newSocket.on('connected', (data) => {
        // Connected to chat server
      });

      newSocket.on('joined', (data) => {
        // Joined chat room
      });

      newSocket.on('stream-chunk', (data) => {
        if (data.chunk) {
          dispatch(updateStreamingMessage(data.chunk));
        }
        
        if (data.isComplete) {
          const finalMessage = data.fullMessage || data.chunk || '';
          const messageId = data.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          if (processedMessageIds.current.has(messageId)) {
            return;
          }
          
          processedMessageIds.current.add(messageId);
          
          dispatch(completeStreamingMessage({
            id: messageId,
            userId: currentUser?.id || '',
            message: finalMessage,
            sender: 'bot',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
      });

      newSocket.on('error', (data) => {
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(data.message || 'Connection error');
      });

      newSocket.on('connect_error', (error) => {
        setIsConnected(false);
        setIsConnecting(false);
        
        if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
          setConnectionError('Session expired. Please log in again.');
          dispatch(clearAuth());
        } else {
          setConnectionError(`Connection failed: ${error.message}`);
        }
      });


      globalSocket = newSocket;
      globalSocketPromise = null;
      setSocket(newSocket);

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError('Failed to establish connection');
    }
     }, [currentUser?.id, dispatch]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(null);
      connectionAttempts.current = 0;
      
      processedMessageIds.current.clear();
    }
    
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
      globalSocketPromise = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (periodicCheckRef.current) {
      clearInterval(periodicCheckRef.current);
      periodicCheckRef.current = null;
    }
  }, [socket]);

  const reconnect = useCallback(() => {
    connectionAttempts.current = 0;
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [disconnect, connect]);

  const sendMessage = useCallback((message: string) => {
    if (socket?.connected) {
      if (currentUser?.id) {
        socket.emit('join', currentUser.id);
      }
      
      socket.emit('message', { message });
      return true;
    } else {
      return false;
    }
  }, [socket, currentUser?.id]);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    if (currentUser?.id) {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (token) {
        connect();
      } else {
        setConnectionError('Session expired. Please log in again.');
        dispatch(clearAuth());
      }
    } else {
      disconnect();
    }

    return () => {
      clearTimeout(initTimer);
      disconnect();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || isConnected) return;

    const checkConnection = () => {
      if (!isConnected && !isConnecting && !isReconnecting && currentUser?.id) {
        connect();
      }
    };

    periodicCheckRef.current = setInterval(checkConnection, 3000);

    return () => {
      if (periodicCheckRef.current) {
        clearInterval(periodicCheckRef.current);
        periodicCheckRef.current = null;
      }
    };
  }, [currentUser?.id, isConnected, isConnecting, isReconnecting, connect]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser?.id && !isConnected && !isConnecting && !isReconnecting) {
        setTimeout(() => {
          connect();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser?.id, isConnected, isConnecting, isReconnecting, connect]);

  useEffect(() => {
    if (!isConnected || !currentUser?.id || !socket) return;

    const rejoinInterval = setInterval(() => {
      if (socket.connected && currentUser?.id) {
        console.log('🔄 Periodic room rejoin for user:', currentUser.id);
        socket.emit('join', currentUser.id);
      }
    }, 30000);

    return () => {
      clearInterval(rejoinInterval);
    };
  }, [isConnected, currentUser?.id, socket]);

  return {
    socket,
    isConnected,
    isConnecting,
    isReconnecting,
    isInitializing,
    connectionError,
    connect,
    disconnect,
    reconnect,
    sendMessage,
  };
} 
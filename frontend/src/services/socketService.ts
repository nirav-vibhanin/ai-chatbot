import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export interface StreamChunk {
  chunk: string;
  isComplete: boolean;
  messageId: string;
  timestamp?: string;
}

export interface SocketEvents {
  'stream-chunk': (data: StreamChunk) => void;
  'connected': (data: { message: string; timestamp: string; clientId: string }) => void;
  'joined': (data: { success: boolean; userId: string; timestamp: string }) => void;
  'error': (data: { message: string; timestamp?: string }) => void;
  'system-message': (data: { message: string; timestamp: string; type: string }) => void;
  'typing': (data: { isTyping: boolean; timestamp: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(`${SOCKET_URL}/chat`, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          auth: {
            token: Cookies.get('token'),
          },
        });

        this.socket.on('connect', () => {
          console.log('🔌 WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          this.socket?.emit('join', userId);
        });

        this.socket.on('disconnect', () => {
          console.log('🔌 WebSocket disconnected');
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.handleReconnect();
          reject(error);
        });

        this.socket.on('joined', (data) => {
          console.log(' Joined chat room:', data);
          resolve();
        });

        this.socket.on('error', (data) => {
          console.error('WebSocket error:', data);
          reject(new Error(data.message));
        });

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.socket?.connect();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('WebSocket disconnected');
    }
  }

  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]) {
    this.socket?.on(event, callback as any);
  }

  off<T extends keyof SocketEvents>(event: T, callback?: SocketEvents[T]) {
    if (callback) {
      this.socket?.off(event, callback as any);
    } else {
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService(); 
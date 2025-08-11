import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { AiService } from './services/ai.service';
import { MessageStorageService } from './services/message-storage.service';
import { IStreamChunk } from './interfaces/chat.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly userSockets = new Map<string, Socket>();

  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
    private readonly messageStorageService: MessageStorageService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
  }

  handleConnection(client: Socket) {
    const auth = client.handshake.auth;
    const token = auth?.token;
    
    if (!token || token === 'no-token') {
      this.logger.warn(`Client ${client.id} connected without valid token`);
      
      client.emit('connected', {
        message: 'Connected to chat server (debug mode)',
        timestamp: new Date().toISOString(),
        clientId: client.id,
      });
      return;
    }
    
    try {
      if (token && token !== 'no-token') {
        client.emit('connected', {
          message: 'Connected to chat server',
          timestamp: new Date().toISOString(),
          clientId: client.id,
        });
      } else {
        this.logger.warn(`Client ${client.id} has invalid token`);
        client.emit('error', { message: 'Invalid authentication token' });
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`Authentication error for client ${client.id}:`, error);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket.id === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    this.logger.log(`User ${userId} joining room`);
    this.logger.log(`Client ID: ${client.id}`);
    this.logger.log(`Current rooms before join:`, Array.from(client.rooms));
    this.logger.log(`User sockets map size before join:`, this.userSockets.size);
    
    try {
      if (!userId || userId.trim() === '') {
        this.logger.error('Invalid user ID provided');
        client.emit('error', { message: 'Invalid user ID' });
        return;
      }

      const rooms = Array.from(client.rooms);
      rooms.forEach(room => {
        if (room !== client.id) {
          client.leave(room);
        }
      });
      
      client.join(userId);
      
      this.userSockets.set(userId, client);
      
      client.emit('joined', { 
        success: true, 
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error joining room for user ${userId}`, error.stack);
      client.emit('error', { 
        message: 'Failed to join room',
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, data: { message: string }) {
    try {
      const userRooms = Array.from(client.rooms);
      const userRoom = userRooms.find(room => room !== client.id);
      
      let userId: string;
      
      if (!userRoom) {
        this.logger.error('User not in any room, attempting to auto-join...');
        
        let foundUserId: string | null = null;
        for (const [uid, socket] of this.userSockets.entries()) {
          if (socket.id === client.id) {
            foundUserId = uid;
            break;
          }
        }
        
        if (!foundUserId) {
          this.logger.error('User not found in socket mapping');
          client.emit('error', { message: 'User not in any room. Please reconnect.' });
          return;
        }
        
        userId = foundUserId;
        
        client.join(userId);
      } else {
        userId = userRoom;
      }

      const mockUser = {
        id: userId,
        username: `user_${userId}`,
        email: `user_${userId}@example.com`,
      };
        
      await this.messageStorageService.saveUserMessage(mockUser, data.message);

      const aiResponse = await this.aiService.generateResponse(data.message, { userId });
      
      if (!aiResponse || aiResponse.trim() === '') {
        this.logger.error('Failed to generate AI response');
        client.emit('error', { message: 'Failed to generate AI response' });
        return;
      }

      await this.messageStorageService.saveBotMessage(mockUser, aiResponse);

      await this.streamResponse(userId, {
        chunk: aiResponse,
        isComplete: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fullMessage: aiResponse,
      });
    } catch (error) {
      this.logger.error(`Error processing message`, error.stack);
      client.emit('error', { 
        message: 'Failed to process message',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async streamResponse(userId: string, streamData: IStreamChunk): Promise<void> {
    try {
      if (!userId || userId.trim() === '') {
        this.logger.error('Invalid user ID for streaming');
        return;
      }

      this.server.to(userId).emit('stream-chunk', {
        ...streamData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error streaming response to user: ${userId}`, error.stack);
    }
  }

  sendSystemMessage(userId: string, message: string): void {
    try {
      this.server.to(userId).emit('system-message', {
        message,
        timestamp: new Date().toISOString(),
        type: 'system',
      });
    } catch (error) {
      this.logger.error(`Error sending system message to user: ${userId}`, error.stack);
    }
  }

  broadcastMessage(event: string, data: any): void {
    try {
      this.server.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error broadcasting message: ${event}`, error.stack);
    }
  }

  sendTypingIndicator(userId: string, isTyping: boolean): void {
    try {
      this.server.to(userId).emit('typing', {
        isTyping,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error sending typing indicator to user: ${userId}`, error.stack);
    }
  }

  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  getUserSocket(userId: string): Socket | undefined {
    return this.userSockets.get(userId);
  }

  getConnectedUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
} 
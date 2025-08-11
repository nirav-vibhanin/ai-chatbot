import { Injectable, Logger } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AiService } from './services/ai.service';
import { MessageStorageService } from './services/message-storage.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { IChatMessage, IChatHistory } from './interfaces/chat.interface';
import { ChatMessageException } from '../common/exceptions/custom.exceptions';
import { IUser } from '../common/interfaces/user.interface';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly messageStorageService: MessageStorageService,
    private readonly chatGateway: ChatGateway,
    private readonly aiService: AiService,
  ) {}

  async createChat(user: IUser, createChatDto: CreateChatDto): Promise<IChatMessage> {
    this.logger.log(`Creating chat message for user: ${user.username}`);

    try {
      if (!createChatDto.message || createChatDto.message.trim() === '') {
        throw new ChatMessageException('Message cannot be empty');
      }

      await this.messageStorageService.saveUserMessage(user, createChatDto.message);

      this.logger.log(`🤖 Generating AI response for user: ${user.username}`);
      const aiResponse = await this.aiService.generateResponse(createChatDto.message, { userId: user.id });

      if (!aiResponse || aiResponse.trim() === '') {
        throw new ChatMessageException('Failed to generate AI response');
      }

      const savedBotMessage = await this.messageStorageService.saveBotMessage(user, aiResponse);

      await this.streamResponse(user.id, aiResponse, savedBotMessage.id);

      return savedBotMessage;
    } catch (error) {
      this.logger.error(`Error creating chat for user: ${user.username}`, error.stack);
      
      if (error instanceof ChatMessageException) {
        throw error;
      }
      
      throw new ChatMessageException('Failed to create chat message');
    }
  }

  async getChatHistory(user: IUser): Promise<IChatHistory> {
    this.logger.log(`Fetching chat history for user: ${user.username}`);

    try {
      const messages = await this.messageStorageService.getChatHistory(user);

      this.logger.log(`Retrieved ${messages.length} messages for user: ${user.username}`);

      return {
        messages,
        total: messages.length,
      };
    } catch (error) {
      this.logger.error(`Error fetching chat history for user: ${user.username}`, error.stack);
      throw new ChatMessageException('Failed to fetch chat history');
    }
  }

  private async streamResponse(userId: string, response: string, messageId: string): Promise<void> {
    this.logger.log(`Streaming response for user: ${userId}`);

    try {
      const chunks = this.chunkResponse(response);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const isComplete = i === chunks.length - 1;
        
        await this.chatGateway.streamResponse(userId, {
          chunk,
          isComplete,
          messageId,
          fullMessage: isComplete ? response : undefined,
        });

        if (!isComplete) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      this.logger.log(`Response streaming completed for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error streaming response for user: ${userId}`, error.stack);
    }
  }

  private chunkResponse(response: string): string[] {
    if (!response || response.trim() === '') {
      return ['No response available'];
    }

    const words = response.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
      if (currentChunk.length + word.length > 20) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = word + ' ';
        } else {
          chunks.push(word);
        }
      } else {
        currentChunk += word + ' ';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [response];
  }

  async getChatStats(userId: string): Promise<{ totalMessages: number; userMessages: number; botMessages: number }> {
    try {
      return {
        totalMessages: 0,
        userMessages: 0,
        botMessages: 0,
      };
    } catch (error) {
      this.logger.error(`Error getting chat stats for user: ${userId}`, error.stack);
      return { totalMessages: 0, userMessages: 0, botMessages: 0 };
    }
  }
} 
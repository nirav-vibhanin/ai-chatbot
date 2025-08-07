import { Controller, Post, Get, Body, UseGuards, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { IUser } from '../common/interfaces/user.interface';
import { IChatMessage, IChatHistory } from './interfaces/chat.interface';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(
    @CurrentUser() user: IUser,
    @Body() createChatDto: CreateChatDto,
  ): Promise<IChatMessage> {
    this.logger.log(`Chat message request from user: ${user.username}`);
    
    try {
      const result = await this.chatService.createChat(user, createChatDto);
      this.logger.log(`Chat message created successfully for user: ${user.username}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating chat for user: ${user.username}`, error.stack);
      throw error;
    }
  }

  @Get()
  async getChatHistory(@CurrentUser() user: IUser): Promise<IChatHistory> {
    this.logger.log(`Chat history request from user: ${user.username}`);
    
    try {
      const result = await this.chatService.getChatHistory(user);
      this.logger.log(`Chat history retrieved successfully for user: ${user.username}`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching chat history for user: ${user.username}`, error.stack);
      throw error;
    }
  }
} 
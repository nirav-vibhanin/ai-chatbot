import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument, MessageSender } from '../schemas/chat.schema';
import { IUser } from '../../common/interfaces/user.interface';
import { IChatMessage } from '../interfaces/chat.interface';

@Injectable()
export class MessageStorageService {
  private readonly logger = new Logger(MessageStorageService.name);

  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
  ) {}

  async saveUserMessage(user: IUser, message: string): Promise<IChatMessage> {
    this.logger.log(`Saving user message for user: ${user.username}`);
    
    const userMessage = new this.chatModel({
      userId: user.id,
      message: message.trim(),
      sender: MessageSender.USER,
    });
    await userMessage.save();
    
    this.logger.log(`User message saved for user: ${user.username}`);
    return this.mapToChatMessage(userMessage);
  }

  async saveBotMessage(user: IUser, message: string): Promise<IChatMessage> {
    this.logger.log(`Saving bot message for user: ${user.username}`);
    
    const botMessage = new this.chatModel({
      userId: user.id,
      message: message.trim(),
      sender: MessageSender.BOT,
      response: message.trim(),
    });
    const savedBotMessage = await botMessage.save();
    
    this.logger.log(`Bot message saved for user: ${user.username}`);
    return this.mapToChatMessage(savedBotMessage);
  }

  async getChatHistory(user: IUser): Promise<IChatMessage[]> {
    this.logger.log(`Fetching chat history for user: ${user.username}`);

    try {
      const messages = await this.chatModel
        .find({ userId: user.id })
        .sort({ createdAt: 1 })
        .exec();

      const chatMessages = messages.map(msg => this.mapToChatMessage(msg));

      this.logger.log(`Retrieved ${chatMessages.length} messages for user: ${user.username}`);

      return chatMessages;
    } catch (error) {
      this.logger.error(`Error fetching chat history for user: ${user.username}`, error.stack);
      throw error;
    }
  }

  async getRecentMessages(user: IUser, limit: number = 20): Promise<IChatMessage[]> {
    this.logger.log(`Fetching recent ${limit} messages for user: ${user.username}`);
    try {
      const messages = await this.chatModel
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
      const chatMessages = messages.reverse().map(msg => this.mapToChatMessage(msg));
      return chatMessages;
    } catch (error) {
      this.logger.error(`Error fetching recent messages for user: ${user.username}`, error.stack);
      throw error;
    }
  }

  async getRecentMessagesByUserId(userId: string, limit: number = 20): Promise<IChatMessage[]> {
    this.logger.log(`Fetching recent ${limit} messages for userId: ${userId}`);
    try {
      const messages = await this.chatModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
      const chatMessages = messages.reverse().map(msg => this.mapToChatMessage(msg));
      return chatMessages;
    } catch (error) {
      this.logger.error(`Error fetching recent messages for userId: ${userId}`, error.stack);
      throw error;
    }
  }

  private mapToChatMessage(chatDocument: ChatDocument): IChatMessage {
    return {
      id: chatDocument._id.toString(),
      userId: chatDocument.userId,
      message: chatDocument.message,
      sender: chatDocument.sender,
      response: chatDocument.response,
      createdAt: chatDocument.createdAt,
      updatedAt: chatDocument.updatedAt,
    };
  }
} 
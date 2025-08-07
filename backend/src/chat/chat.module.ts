import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AiService } from './services/ai.service';
import { MessageStorageService } from './services/message-storage.service';
import { Chat, ChatSchema } from './schemas/chat.schema';

@Module({   
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, AiService, MessageStorageService],
  exports: [ChatService, ChatGateway, AiService, MessageStorageService],
})
export class ChatModule {} 
import { MessageSender } from '../schemas/chat.schema';

export interface IChatMessage {
  id: string;
  userId: string;
  message: string;
  sender: MessageSender;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateChatRequest {
  message: string;
}

export interface IStreamChunk {
  chunk: string;
  isComplete: boolean;
  messageId: string;
  fullMessage?: string;
}

export interface IChatHistory {
  messages: IChatMessage[];
  total: number;
} 
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, type: String })
  message: string;

  @Prop({ required: true, enum: MessageSender })
  sender: MessageSender;

  @Prop({ type: String, required: false })
  response?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ userId: 1, createdAt: -1 });
ChatSchema.index({ createdAt: -1 }); 
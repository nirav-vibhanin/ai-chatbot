import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { MessageStorageService } from './message-storage.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private isGeminiAvailable = false;
  private processingRequests = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly messageStorageService: MessageStorageService,
  ) {
    this.initializeGemini();
  }

  private initializeGemini(): void {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey && apiKey.trim() !== '') {
      this.isGeminiAvailable = true;
      this.logger.log('Gemini AI service initialized successfully');
    } else {
      this.logger.warn('No Gemini API key provided, using mock responses');
      this.isGeminiAvailable = false;
    }
  }

  async generateResponse(userMessage: string, options?: { userId?: string }): Promise<string> {
    if (this.processingRequests.has(userMessage)) {
      return this.generateMockResponse(userMessage);
    }

    this.processingRequests.add(userMessage);

    try {
      if (this.isGeminiAvailable) {
        const response = await this.generateGeminiResponse(userMessage, options);
        if (response) return response;
      }
      return this.generateMockResponse(userMessage);
    } catch (error) {
      this.logger.error(`Error generating AI response`, (error as any)?.stack || String(error));
      return this.generateMockResponse(userMessage);
    } finally {
      this.processingRequests.delete(userMessage);
    }
  }

  private async generateGeminiResponse(userMessage: string, options?: { userId?: string }): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('gemini.apiKey');
      const modelName = this.configService.get<string>('gemini.model') || 'gemini-2.0-flash';
      const model = new ChatGoogleGenerativeAI({ apiKey, model: modelName, streaming: false });

      const messages: BaseMessage[] = await this.buildLangChainMessages(options?.userId, userMessage);
      const result = await model.invoke(messages);
      const text = this.extractMessageText(result);
      if (!text || text.trim() === '') {
        throw new Error('Empty response from Gemini API');
      }
      return text.trim();
    } catch (error) {
      this.logger.error('Gemini API error:', (error as any)?.message || String(error));
      throw error;
    }
  }

  async generateResponseStream(
    userId: string,
    userMessage: string,
    onToken: (token: string) => Promise<void> | void,
  ): Promise<string> {
    if (!this.isGeminiAvailable) {
      const fallback = this.generateMockResponse(userMessage);
      await onToken(fallback);
      return fallback;
    }

    const apiKey = this.configService.get<string>('gemini.apiKey');
    const modelName = this.configService.get<string>('gemini.model') || 'gemini-2.0-flash';
    const model = new ChatGoogleGenerativeAI({ apiKey, model: modelName, streaming: true });

    const messages: BaseMessage[] = await this.buildLangChainMessages(userId, userMessage);
    let full = '';
    const stream = await model.stream(messages);
    for await (const chunk of stream) {
      const piece = this.extractMessageText(chunk);
      if (piece) {
        full += piece;
        await onToken(piece);
      }
    }
    return full.trim();
  }

  private async buildLangChainMessages(userId: string | undefined, userMessage: string): Promise<BaseMessage[]> {
    const systemPrompt = 'You are a helpful AI assistant. Keep responses concise, accurate, and friendly.';
    const messages: BaseMessage[] = [new SystemMessage(systemPrompt)];
    try {
      if (userId) {
        const recent = await this.messageStorageService.getRecentMessagesByUserId(userId, 20);
        for (const m of recent) {
          if (m.sender === 'user') messages.push(new HumanMessage(m.message));
          else messages.push(new AIMessage(m.message));
        }
      }
    } catch (err) {
      this.logger.warn('Failed to load history for context; proceeding without it');
    }
    messages.push(new HumanMessage(userMessage));
    return messages;
  }

  private extractMessageText(message: any): string {
    try {
      const content = message?.content;
      if (!content) return '';
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content.map((c: any) => (typeof c === 'string' ? c : c?.text || '')).join('');
      }
      if (typeof content === 'object' && content.text) return content.text;
      return '';
    } catch {
      return '';
    }
  }

  private generateMockResponse(userMessage: string): string {
    const mockResponses = [
      `I understand you're asking about "${userMessage}". Let me help you with some information about that topic.`,
      `That's an interesting question about "${userMessage}"! Here's what I can tell you about that.`,
      `I'd be happy to help you with "${userMessage}". Let me provide some useful information.`,
      `Thanks for your question about "${userMessage}". Here's what I know about that subject.`,
      `I can help you with "${userMessage}"! Let me share some relevant information with you.`,
      `Great question about "${userMessage}"! Here's some helpful information for you.`,
      `I understand your interest in "${userMessage}". Let me provide some insights.`,
      `That's a good question about "${userMessage}". Here's what I can share with you.`,
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    return `${randomResponse} (This is a mock response since no AI API key is configured. To use real AI responses, please add your Gemini API key to the environment variables.)`;
  }

  isGeminiServiceAvailable(): boolean {
    return this.isGeminiAvailable;
  }

  getServiceStatus(): { gemini: boolean; fallback: boolean } {
    return {
      gemini: this.isGeminiAvailable,
      fallback: true,
    };
  }
}
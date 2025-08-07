import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private isGeminiAvailable = false;
  private processingRequests = new Set<string>();

  constructor(private readonly configService: ConfigService) {
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

  async generateResponse(userMessage: string): Promise<string> {
    if (this.processingRequests.has(userMessage)) {
      return this.generateMockResponse(userMessage);
    }
    
    this.processingRequests.add(userMessage);
    
    try {
      if (this.isGeminiAvailable) {
        const response = await this.generateGeminiResponse(userMessage);
        if (response) {
          return response;
        }
      }
      
      return this.generateMockResponse(userMessage);
      
    } catch (error) {
      this.logger.error(`Error generating AI response`, error.stack);
      return this.generateMockResponse(userMessage);
    } finally {
      this.processingRequests.delete(userMessage);
    }
  }

  private async generateGeminiResponse(userMessage: string): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('gemini.apiKey');
      const model = this.configService.get<string>('gemini.model') || 'gemini-2.0-flash';
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful AI assistant. Respond to the user's message in a conversational and helpful manner. Keep responses concise but informative and engaging.

User: ${userMessage}

Assistant:`
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          }
        }
      );

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const text = response.data.candidates[0].content.parts[0].text;
        if (!text || text.trim() === '') {
          throw new Error('Empty response from Gemini API');
        }
        return text.trim();
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      this.logger.error('Gemini API error:', error.message);
      if (error.response) {
        this.logger.error('API Response error:', error.response.data);
      }
      throw error;
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
      `That's a good question about "${userMessage}". Here's what I can share with you.`
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
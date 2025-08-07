import { Controller, Get, Logger } from '@nestjs/common';
import { AiService } from '../chat/services/ai.service';

export interface IHealthResponse {
  status: string;
  time: string;
  uptime: number;
  environment: string;
  services: {
    database: boolean;
    ai: {
      gemini: boolean;
      fallback: boolean;
    };
  };
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly aiService: AiService) {}

  @Get()
  getHealth(): IHealthResponse {
    this.logger.log('Health check requested');
    
    return {
      status: 'ok',
      time: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: true,
        ai: this.aiService.getServiceStatus(),
      },
    };
  }
} 
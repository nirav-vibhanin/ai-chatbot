import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AiService } from '../chat/services/ai.service';

@Module({
  controllers: [HealthController],
  providers: [AiService],
})
export class HealthModule {} 
import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ILoginResponse } from '../common/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ILoginResponse> {
    this.logger.log(`Login request received for user: ${loginDto.username}`);
    
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`Login successful for user: ${loginDto.username}`);
      return result;
    } catch (error) {
      this.logger.error(`Login failed for user: ${loginDto.username}`, error.stack);
      throw error;
    }
  }
} 
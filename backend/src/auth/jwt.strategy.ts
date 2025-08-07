import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { IJwtPayload } from '../common/interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: IJwtPayload) {
    this.logger.debug(`Validating JWT payload for user: ${payload.username}`);
    
    try {
      const user = await this.authService.validateUser(payload);
      this.logger.debug(`JWT validation successful for user: ${user.username}`);
      return user;
    } catch (error) {
      this.logger.error(`JWT validation failed for user: ${payload.username}`, error.stack);
      throw error;
    }
  }
} 
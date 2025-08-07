import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InvalidCredentialsException } from '../common/exceptions/custom.exceptions';
import { LoginDto } from './dto/login.dto';
import { IUser, ILoginResponse, IJwtPayload } from '../common/interfaces/user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly staticCredentials = {
    username: 'admin',
    password: 'password',
    id: '1',
  };

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<ILoginResponse> {
    this.logger.log(`Login attempt for user: ${loginDto.username}`);

    if (
      loginDto.username === this.staticCredentials.username &&
      loginDto.password === this.staticCredentials.password
    ) {
      const user: IUser = {
        id: this.staticCredentials.id,
        username: this.staticCredentials.username,
      };

      const payload: IJwtPayload = {
        sub: user.id,
        username: user.username,
      };

      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`Successful login for user: ${user.username}`);

      return {
        access_token: accessToken,
        user,
      };
    }

    this.logger.warn(`Failed login attempt for user: ${loginDto.username}`);
    throw new InvalidCredentialsException();
  }

  async validateUser(payload: IJwtPayload): Promise<IUser> {
    const user: IUser = {
      id: payload.sub,
      username: payload.username,
    };

    if (user.id === this.staticCredentials.id) {
      return user;
    }

    throw new InvalidCredentialsException();
  }
} 
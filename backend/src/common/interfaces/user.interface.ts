export interface IUser {
  id: string;
  username: string;
  email?: string;
}

export interface IJwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface ILoginResponse {
  access_token: string;
  user: IUser;
}

export interface IAuthenticatedRequest {
  user: IUser;
} 
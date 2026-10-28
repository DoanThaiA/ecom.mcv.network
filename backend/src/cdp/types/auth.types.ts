// Generated types from auth.proto

export interface User {
  userId: string;
  username: string;
}

export interface AccessToken {
  token: string;
  expireTime: number;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  user?: User;
  accessToken?: AccessToken;
}

export interface AuthRoutes {
  login(request: LoginRequest): Promise<LoginResponse>;
}

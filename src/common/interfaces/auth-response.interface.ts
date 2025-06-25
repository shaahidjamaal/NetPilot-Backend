export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    profile: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
}

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

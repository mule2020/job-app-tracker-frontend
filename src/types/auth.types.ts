export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  message: string;
  email: string | null;
  isVerified: boolean | null;
}

export interface AuthUser {
  email: string;
  isVerified: boolean;
}
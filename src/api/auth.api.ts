import axiosClient from './axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const login = async (data: LoginRequest): Promise<AuthResponse> =>
  (await axiosClient.post<AuthResponse>('/auth/login', data)).data;

export const register = async (data: RegisterRequest): Promise<AuthResponse> =>
  (await axiosClient.post<AuthResponse>('/auth/register', data)).data;

export const verifyEmail = async (token: string): Promise<AuthResponse> =>
  (await axiosClient.get<AuthResponse>(`/auth/verify?token=${token}`)).data;

export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> =>
  (await axiosClient.post<AuthResponse>('/auth/refresh', { refreshToken })).data;

export const logoutApi = async (refreshToken: string): Promise<AuthResponse> =>
  (await axiosClient.post<AuthResponse>('/auth/logout', { refreshToken })).data;

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthResponse> =>
  (await axiosClient.put<AuthResponse>('/auth/change-password', data)).data;

export const forgotPassword = async (email: string): Promise<AuthResponse> =>
  (await axiosClient.post<AuthResponse>('/auth/forgot-password', { email })).data;

export const resetPassword = async (data: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthResponse> =>
  (await axiosClient.post<AuthResponse>('/auth/reset-password', data)).data;
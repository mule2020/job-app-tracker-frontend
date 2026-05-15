import type { ProfileRequest, ProfileResponse } from '../types/profile.types';
import axiosClient from './axiosClient';
export const getProfile = async (): Promise<ProfileResponse> =>
  (await axiosClient.get<ProfileResponse>('/profile')).data;

export const updateProfile = async (data: ProfileRequest): Promise<ProfileResponse> =>
  (await axiosClient.put<ProfileResponse>('/profile', data)).data;
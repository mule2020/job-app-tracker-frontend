import axiosClient from './axiosClient';
import type {
  Resume,
  GenerateResumeRequest,
  GenerateResumeResponse,
  SaveResumeRequest,
  UpdateResumeRequest,
} from '../types/resume.types';

export const generateResume = async (data: GenerateResumeRequest): Promise<GenerateResumeResponse> =>
  (await axiosClient.post<GenerateResumeResponse>('/resumes/generate', data)).data;

export const saveResume = async (data: SaveResumeRequest): Promise<Resume> =>
  (await axiosClient.post<Resume>('/resumes', data)).data;

export const getAllResumes = async (): Promise<Resume[]> =>
  (await axiosClient.get<Resume[]>('/resumes')).data;

export const getOneResume = async (id: string): Promise<Resume> =>
  (await axiosClient.get<Resume>(`/resumes/${id}`)).data;

export const getResumeByApplicationId = async (applicationId: string): Promise<Resume> =>
  (await axiosClient.get<Resume>(`/resumes/by-application/${applicationId}`)).data;

export const updateResume = async (id: string, data: UpdateResumeRequest): Promise<Resume> =>
  (await axiosClient.put<Resume>(`/resumes/${id}`, data)).data;

export const deleteResume = async (id: string): Promise<void> =>
  void (await axiosClient.delete(`/resumes/${id}`));
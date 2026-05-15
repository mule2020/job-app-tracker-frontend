export interface ProfileResponse {
  fullName: string | null;
  title: string | null;
  summary: string | null;
  skills: string[] | null;
  baseResumeText: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
}

export interface ProfileRequest {
  fullName?: string;
  title?: string;
  summary?: string;
  skills?: string[];
  baseResumeText?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}
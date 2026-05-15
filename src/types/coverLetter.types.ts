export interface CoverLetter {
  id: string;
  applicationId: string;
  company: string;
  jobTitle: string;
  content: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCoverLetterRequest {
  applicationId: string;
}

export interface GeneratedCoverLetterResponse {
  content: string;
}

export interface SaveCoverLetterRequest {
  applicationId: string;
  content: string;
}

export interface UpdateCoverLetterRequest {
  content: string;
}
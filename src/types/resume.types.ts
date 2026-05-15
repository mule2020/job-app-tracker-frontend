export interface Resume {
  id: string;
  applicationId: string;
  company: string;
  jobTitle: string;
  generatedContent: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateResumeRequest {
  applicationId: string;
}

export interface GenerateResumeResponse {
  generatedContent: string;
}

export interface SaveResumeRequest {
  applicationId: string;
  generatedContent: string;
}

export interface UpdateResumeRequest {
  generatedContent: string;
}
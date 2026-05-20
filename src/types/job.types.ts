export interface JobSearchResponse {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  redirectUrl: string;
  salary: string | null;
  postedDate: string;
}

export interface JobSearchParams {
  keyword: string;
  location: string;
  page: number;
}
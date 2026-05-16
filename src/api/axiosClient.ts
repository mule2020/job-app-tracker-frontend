import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token!));
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    const status   = error.response?.status;

    if (status === 401 && !original._retry) {
      const storedRefresh = localStorage.getItem('refreshToken');

      if (!storedRefresh) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return axiosClient(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken: storedRefresh },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const newAccess = res.data.accessToken;
        localStorage.setItem('accessToken', newAccess);
        processQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;


export const getErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    'Something went wrong. Please try again.'
  );
};
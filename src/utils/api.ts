import axios, { AxiosError } from 'axios';

// In production, point to the Render backend URL. In dev, Vite proxies /api to localhost:8000.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if stored (for cross-origin production)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401, clear the stored token so the auth store
// sees no user and React Router redirects to /login — no hard reload needed.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session_token');
    }
    return Promise.reject(error);
  }
);

export default api;

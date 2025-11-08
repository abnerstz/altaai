import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isPublicRoute = currentPath === '/login' || 
                           currentPath === '/signup' || 
                           currentPath.startsWith('/accept-invite');
      const isAuthMe = error.config?.url?.includes('/auth/me');
      
      if (!isPublicRoute && !isAuthMe) {
        window.location.href = '/login';
      }
      
      if (isAuthMe) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);


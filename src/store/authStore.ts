import { create } from 'zustand';
import api from '@/utils/api';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isSubmitting: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isSubmitting: false,

  login: async (email: string, password: string) => {
    try {
      set({ isSubmitting: true });
      const response = await api.post('/auth/login', { email, password });
      // Store token for cross-origin auth (production Netlify -> Render)
      if (response.data.token) {
        localStorage.setItem('session_token', response.data.token);
      }
      set({ user: response.data.user || response.data, isSubmitting: false });
      toast.success('Logged in successfully!');
    } catch (error: any) {
      set({ isSubmitting: false });
      const message = error.response?.data?.detail || 'Failed to login';
      toast.error(message);
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    try {
      set({ isSubmitting: true });
      const response = await api.post('/auth/signup', { name, email, password });
      if (response.data.token) {
        localStorage.setItem('session_token', response.data.token);
      }
      set({ user: response.data.user || response.data, isSubmitting: false });
      toast.success('Account created successfully!');
    } catch (error: any) {
      set({ isSubmitting: false });
      const message = error.response?.data?.detail || 'Failed to create account';
      toast.error(message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('session_token');
    set({ user: null });
    toast.success('Logged out successfully!');
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isLoading: false });
    } catch {
      localStorage.removeItem('session_token');
      set({ user: null, isLoading: false });
    }
  },
}));

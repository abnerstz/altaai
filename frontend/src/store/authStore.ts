import { create } from 'zustand';
import { User } from '../services/auth.service';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  login: async (email, password) => {
    try {
      const { user } = await authService.login({ email, password });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email, name, password) => {
    try {
      const { user } = await authService.signup({ email, name, password });
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));


import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import { authService } from '../../services/auth.service';

// Mock do authService
vi.mock('../../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reseta o store antes de cada teste
    useAuthStore.setState({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });
    vi.clearAllMocks();
  });

  describe('setUser', () => {
    it('deve definir usuário e atualizar estado de autenticação', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      useAuthStore.getState().setUser(user);

      expect(useAuthStore.getState().user).toEqual(user);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('deve limpar usuário quando null', () => {
      useAuthStore.getState().setUser(null);

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(authService.login).mockResolvedValueOnce({ user: mockUser });

      await useAuthStore.getState().login('test@example.com', 'password123');

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('deve lidar com erro no login', async () => {
      const error = new Error('Login failed');
      vi.mocked(authService.login).mockRejectedValueOnce(error);

      await expect(
        useAuthStore.getState().login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Login failed');

      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('signup', () => {
    it('deve fazer signup com sucesso', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(authService.signup).mockResolvedValueOnce({ user: mockUser });

      await useAuthStore.getState().signup(
        'test@example.com',
        'Test User',
        'password123'
      );

      expect(authService.signup).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('deve fazer logout com sucesso', async () => {
      // Primeiro faz login
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      useAuthStore.getState().setUser(mockUser);

      vi.mocked(authService.logout).mockResolvedValueOnce(undefined);

      await useAuthStore.getState().logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('deve limpar estado mesmo se logout falhar', async () => {
      useAuthStore.getState().setUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });

      vi.mocked(authService.logout).mockRejectedValueOnce(new Error('Logout failed'));

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('fetchUser', () => {
    it('deve buscar usuário com sucesso', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(authService.getMe).mockResolvedValueOnce(mockUser);

      await useAuthStore.getState().fetchUser();

      expect(authService.getMe).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('deve lidar com erro ao buscar usuário', async () => {
      vi.mocked(authService.getMe).mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().fetchUser();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});


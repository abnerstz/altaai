import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../auth.service';
import { api } from '../api';

// Mock do axios
vi.mock('../api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('deve fazer signup com sucesso', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      const result = await authService.signup({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/signup', {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('deve fazer logout com sucesso', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('getMe', () => {
    it('deve buscar dados do usuário autenticado', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(api.get).mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await authService.getMe();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('acceptInvite', () => {
    it('deve aceitar convite com sucesso', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      const result = await authService.acceptInvite({
        token: 'invite-token',
        name: 'Test User',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/accept-invite', {
        token: 'invite-token',
        name: 'Test User',
        password: 'password123',
      });
      expect(result.user).toEqual(mockUser);
    });

    it('deve aceitar convite apenas com token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      const result = await authService.acceptInvite({
        token: 'invite-token',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/accept-invite', {
        token: 'invite-token',
      });
      expect(result.user).toEqual(mockUser);
    });
  });
});


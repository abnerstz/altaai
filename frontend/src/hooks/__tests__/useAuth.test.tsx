import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { authService } from '../../services/auth.service';
import * as authStoreModule from '../../store/authStore';

// Mock dos serviços
vi.mock('../../services/auth.service');
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  const mockSetUser = vi.fn();
  const mockUseAuthStore = vi.mocked(authStoreModule.useAuthStore);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue(mockSetUser as any);
  });

  it('deve retornar estrutura correta do hook', () => {
    mockUseAuthStore.mockReturnValue({
      setUser: mockSetUser,
    } as any);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Verifica que o hook retorna todas as propriedades esperadas
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('signup');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('acceptInvite');
  });

  it('deve fornecer funções de mutação', () => {
    mockUseAuthStore.mockReturnValue({
      setUser: mockSetUser,
    } as any);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.login).toBeDefined();
    expect(result.current.signup).toBeDefined();
    expect(result.current.logout).toBeDefined();
    expect(result.current.acceptInvite).toBeDefined();
  });
});


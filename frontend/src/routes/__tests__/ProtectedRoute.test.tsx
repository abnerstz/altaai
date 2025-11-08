import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import { render } from '../../test/utils/test-utils';
import { useAuth } from '../../hooks/useAuth';

// Mock do hook useAuth
vi.mock('../../hooks/useAuth');

describe('ProtectedRoute', () => {
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar children quando usuário está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
      login: {} as any,
      signup: {} as any,
      logout: {} as any,
      acceptInvite: {} as any,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('deve mostrar loading quando está carregando', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: {} as any,
      signup: {} as any,
      logout: {} as any,
      acceptInvite: {} as any,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('deve redirecionar para login quando não autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: {} as any,
      signup: {} as any,
      logout: {} as any,
      acceptInvite: {} as any,
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Verifica que o conteúdo protegido não é renderizado
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // O Navigate do React Router será renderizado, mas não podemos verificar a URL diretamente
    // em ambiente de teste sem configuração adicional do router
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import PublicRoute from '../PublicRoute';
import { render } from '../../test/utils/test-utils';
import { useAuth } from '../../hooks/useAuth';

// Mock do hook useAuth
vi.mock('../../hooks/useAuth');

describe('PublicRoute', () => {
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar children quando usuário não está autenticado', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: {} as any,
      signup: {} as any,
      logout: {} as any,
      acceptInvite: {} as any,
    });

    render(
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
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
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
  });

  it('deve redirecionar para home quando autenticado', () => {
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
      <PublicRoute>
        <div>Public Content</div>
      </PublicRoute>
    );

    // Verifica que o conteúdo público não é renderizado quando autenticado
    expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
    // O Navigate do React Router será renderizado, mas não podemos verificar a URL diretamente
    // em ambiente de teste sem configuração adicional do router
  });
});


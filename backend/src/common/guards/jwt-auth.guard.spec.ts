import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: mockReflector.getAllAndOverride,
    } as unknown as Reflector;

    guard = new JwtAuthGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('deve permitir acesso se rota é pública', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('deve chamar super.canActivate se rota não é pública', () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      const superCanActivate = jest.spyOn(
        Object.getPrototypeOf(JwtAuthGuard.prototype),
        'canActivate'
      );
      superCanActivate.mockReturnValue(true);

      guard.canActivate(mockContext);

      expect(superCanActivate).toHaveBeenCalledWith(mockContext);
    });
  });

  describe('handleRequest', () => {
    it('deve retornar usuário se válido', () => {
      const user = { id: 'user-1', email: 'test@example.com' };

      const result = guard.handleRequest(null, user, null);

      expect(result).toEqual(user);
    });

    it('deve lançar erro se fornecido', () => {
      const error = new Error('Test error');

      expect(() => guard.handleRequest(error, null, null)).toThrow(error);
    });

    it('deve lançar UnauthorizedException se usuário não existe', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(null, null, null)).toThrow('Token inválido ou expirado');
    });
  });
});

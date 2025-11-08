import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../modules/membership/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (membership: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          membership,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: mockReflector.getAllAndOverride,
    } as unknown as Reflector;

    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('deve permitir acesso se nenhum role é requerido', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockContext({ role: Role.MEMBER });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve lançar ForbiddenException se membership não existe', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const context = createMockContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Você não é membro desta empresa');
    });

    it('deve permitir acesso se OWNER tenta acessar rota que requer ADMIN', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const context = createMockContext({ role: Role.OWNER });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve permitir acesso se ADMIN tenta acessar rota que requer ADMIN', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const context = createMockContext({ role: Role.ADMIN });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve negar acesso se MEMBER tenta acessar rota que requer ADMIN', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const context = createMockContext({ role: Role.MEMBER });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('deve negar acesso se MEMBER tenta acessar rota que requer OWNER', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.OWNER]);
      const context = createMockContext({ role: Role.MEMBER });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('deve permitir acesso se role requerido é MEMBER e usuário é OWNER', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.MEMBER]);
      const context = createMockContext({ role: Role.OWNER });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('deve lançar ForbiddenException se role é inválido', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const context = createMockContext({ role: 'INVALID_ROLE' });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Role inválido');
    });
  });
});


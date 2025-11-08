import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CompanyMemberGuard } from './company-member.guard';
import { PrismaService } from '../../database/prisma/prisma.service';

describe('CompanyMemberGuard', () => {
  let guard: CompanyMemberGuard;
  let prisma: PrismaService;

  const mockPrismaService = {
    membership: {
      findUnique: jest.fn(),
    },
  };

  const createMockContext = (user: any, companyId: string): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
          params: { id: companyId },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    prisma = mockPrismaService as unknown as PrismaService;
    guard = new CompanyMemberGuard(prisma);
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
    };
    const companyId = 'company-1';
    const mockMembership = {
      id: 'membership-1',
      userId: mockUser.id,
      companyId,
      role: 'MEMBER',
    };

    it('deve permitir acesso se usuário é membro da empresa', async () => {
      const context = createMockContext(mockUser, companyId);
      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      const result = await guard.canActivate(context);

      expect(mockPrismaService.membership.findUnique).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: mockUser.id,
            companyId,
          },
        },
      });
      expect(result).toBe(true);
    });

    it('deve lançar ForbiddenException se companyId não fornecido', async () => {
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: mockUser,
            params: {},
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('Company ID não fornecido');
    });

    it('deve lançar ForbiddenException se usuário não é membro', async () => {
      const context = createMockContext(mockUser, companyId);
      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('Você não é membro desta empresa');
    });

    it('deve injetar membership e companyId no request', async () => {
      const context = createMockContext(mockUser, companyId);
      const request = context.switchToHttp().getRequest();
      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      await guard.canActivate(context);

      expect(request.membership).toEqual(mockMembership);
      expect(request.companyId).toBe(companyId);
    });
  });
});

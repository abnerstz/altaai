import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Role } from './enums/role.enum';

describe('MembershipService', () => {
  let service: MembershipService;
  let prisma: PrismaService;

  const mockPrismaService = {
    membership: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('updateRole', () => {
    const companyId = 'company-1';
    const requesterId = 'user-1';
    const targetUserId = 'user-2';

    it('deve atualizar role se requester é OWNER', async () => {
      const requesterMembership = {
        id: 'membership-1',
        userId: requesterId,
        companyId,
        role: Role.OWNER,
      };
      const targetMembership = {
        id: 'membership-2',
        userId: targetUserId,
        companyId,
        role: Role.MEMBER,
      };
      const updatedMembership = {
        ...targetMembership,
        role: Role.ADMIN,
        user: { id: targetUserId, email: 'target@example.com', name: 'Target User', avatar: null },
      };

      mockPrismaService.membership.findUnique
        .mockResolvedValueOnce(requesterMembership)
        .mockResolvedValueOnce(targetMembership);
      mockPrismaService.membership.update.mockResolvedValue(updatedMembership);

      const result = await service.updateRole(companyId, targetUserId, Role.ADMIN, requesterId);

      expect(mockPrismaService.membership.update).toHaveBeenCalledWith({
        where: {
          userId_companyId: {
            userId: targetUserId,
            companyId,
          },
        },
        data: { role: Role.ADMIN },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedMembership);
    });

    it('deve lançar ForbiddenException se requester é MEMBER', async () => {
      const requesterMembership = {
        id: 'membership-1',
        userId: requesterId,
        companyId,
        role: Role.MEMBER,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(requesterMembership);

      await expect(service.updateRole(companyId, targetUserId, Role.ADMIN, requesterId)).rejects.toThrow(ForbiddenException);
      await expect(service.updateRole(companyId, targetUserId, Role.ADMIN, requesterId)).rejects.toThrow('Apenas OWNER e ADMIN podem alterar papéis');
    });

    it('deve lançar ForbiddenException se ADMIN tenta alterar OWNER', async () => {
      const requesterMembership = {
        id: 'membership-1',
        userId: requesterId,
        companyId,
        role: Role.ADMIN,
      };
      const targetMembership = {
        id: 'membership-2',
        userId: targetUserId,
        companyId,
        role: Role.OWNER,
      };

      mockPrismaService.membership.findUnique
        .mockResolvedValueOnce(requesterMembership)
        .mockResolvedValueOnce(targetMembership);

      const result = service.updateRole(companyId, targetUserId, Role.ADMIN, requesterId);
      
      await expect(result).rejects.toThrow(ForbiddenException);
      await expect(result).rejects.toThrow('ADMIN não pode alterar papel de OWNER');
    });

    it('deve lançar BadRequestException se tentar remover último OWNER', async () => {
      const requesterMembership = {
        id: 'membership-1',
        userId: requesterId,
        companyId,
        role: Role.OWNER,
      };
      const targetMembership = {
        id: 'membership-2',
        userId: targetUserId,
        companyId,
        role: Role.OWNER,
      };

      mockPrismaService.membership.findUnique
        .mockResolvedValueOnce(requesterMembership)
        .mockResolvedValueOnce(targetMembership);
      mockPrismaService.membership.count.mockResolvedValue(1);

      const result = service.updateRole(companyId, targetUserId, Role.ADMIN, requesterId);
      
      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Empresa deve ter pelo menos um OWNER');
    });
  });

  describe('remove', () => {
    const companyId = 'company-1';
    const requesterId = 'user-1';
    const targetUserId = 'user-2';

    it('deve remover membro se requester é OWNER', async () => {
      const requesterMembership = {
        id: 'membership-1',
        userId: requesterId,
        companyId,
        role: Role.OWNER,
      };
      const targetMembership = {
        id: 'membership-2',
        userId: targetUserId,
        companyId,
        role: Role.MEMBER,
      };
      const targetUser = {
        id: targetUserId,
        activeCompanyId: 'other-company',
      };

      mockPrismaService.membership.findUnique
        .mockResolvedValueOnce(requesterMembership)
        .mockResolvedValueOnce(targetMembership);
      mockPrismaService.membership.delete.mockResolvedValue({});
      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);

      const result = await service.remove(companyId, targetUserId, requesterId);

      expect(mockPrismaService.membership.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Membro removido com sucesso' });
    });

    it('deve limpar activeCompanyId se era a empresa ativa', async () => {
      const requesterMembership = {
        id: 'membership-1',
        userId: requesterId,
        companyId,
        role: Role.OWNER,
      };
      const targetMembership = {
        id: 'membership-2',
        userId: targetUserId,
        companyId,
        role: Role.MEMBER,
      };
      const targetUser = {
        id: targetUserId,
        activeCompanyId: companyId,
      };

      mockPrismaService.membership.findUnique
        .mockResolvedValueOnce(requesterMembership)
        .mockResolvedValueOnce(targetMembership);
      mockPrismaService.membership.delete.mockResolvedValue({});
      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);
      mockPrismaService.user.update.mockResolvedValue({});

      await service.remove(companyId, targetUserId, requesterId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: targetUserId },
        data: { activeCompanyId: null },
      });
    });

    it('deve lançar ForbiddenException se ADMIN tenta remover OWNER', async () => {
      const requesterMembership = {
        id: 'membership-1',
        userId: requesterId,
        companyId,
        role: Role.ADMIN,
      };
      const targetMembership = {
        id: 'membership-2',
        userId: targetUserId,
        companyId,
        role: Role.OWNER,
      };

      mockPrismaService.membership.findUnique
        .mockResolvedValueOnce(requesterMembership)
        .mockResolvedValueOnce(targetMembership);

      const result = service.remove(companyId, targetUserId, requesterId);
      
      await expect(result).rejects.toThrow(ForbiddenException);
      await expect(result).rejects.toThrow('ADMIN não pode remover OWNER');
    });

    it('deve lançar BadRequestException se tentar remover último OWNER', async () => {
      const requesterMembership = {
        id: 'membership-1',
        userId: requesterId,
        companyId,
        role: Role.OWNER,
      };
      const targetMembership = {
        id: 'membership-2',
        userId: targetUserId,
        companyId,
        role: Role.OWNER,
      };

      mockPrismaService.membership.findUnique
        .mockResolvedValueOnce(requesterMembership)
        .mockResolvedValueOnce(targetMembership);
      mockPrismaService.membership.count.mockResolvedValue(1);

      const result = service.remove(companyId, targetUserId, requesterId);
      
      await expect(result).rejects.toThrow(BadRequestException);
      await expect(result).rejects.toThrow('Empresa deve ter pelo menos um OWNER');
    });
  });
});


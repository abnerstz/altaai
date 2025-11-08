import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Role } from '../membership/enums/role.enum';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: PrismaService;

  const mockPrismaService = {
    company: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-1';
    const createCompanyDto: CreateCompanyDto = {
      name: 'Test Company',
      logo: 'https://example.com/logo.png',
    };

    it('deve criar empresa e definir usuário como OWNER', async () => {
      const mockCompany = {
        id: 'company-1',
        name: createCompanyDto.name,
        logo: createCompanyDto.logo,
        slug: 'test-company',
      };

      mockPrismaService.company.findUnique.mockResolvedValue(null);
      mockPrismaService.company.create.mockResolvedValue(mockCompany);
      mockPrismaService.membership.create.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.create(userId, createCompanyDto);

      expect(mockPrismaService.company.create).toHaveBeenCalled();
      expect(mockPrismaService.membership.create).toHaveBeenCalledWith({
        data: {
          userId,
          companyId: mockCompany.id,
          role: Role.OWNER,
        },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { activeCompanyId: mockCompany.id },
      });
      expect(result).toEqual(mockCompany);
    });

    it('deve gerar slug único se slug já existe', async () => {
      const mockCompany = {
        id: 'company-1',
        name: createCompanyDto.name,
        slug: 'test-company-1',
      };

      mockPrismaService.company.findUnique
        .mockResolvedValueOnce({ slug: 'test-company' })
        .mockResolvedValueOnce(null);
      mockPrismaService.company.create.mockResolvedValue(mockCompany);
      mockPrismaService.membership.create.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});

      await service.create(userId, createCompanyDto);

      expect(mockPrismaService.company.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.company.create).toHaveBeenCalledWith({
        data: {
          name: createCompanyDto.name,
          logo: createCompanyDto.logo,
          slug: 'test-company-1',
        },
      });
    });
  });

  describe('findOne', () => {
    const companyId = 'company-1';
    const userId = 'user-1';

    it('deve retornar empresa se usuário é membro', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId,
        companyId,
        role: Role.MEMBER,
      };
      const mockCompany = {
        id: companyId,
        name: 'Test Company',
        _count: { memberships: 5, invites: 2 },
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.company.findUnique.mockResolvedValue(mockCompany);

      const result = await service.findOne(companyId, userId);

      expect(result).toEqual(mockCompany);
    });

    it('deve lançar ForbiddenException se usuário não é membro', async () => {
      mockPrismaService.membership.findUnique.mockResolvedValue(null);

      await expect(service.findOne(companyId, userId)).rejects.toThrow(ForbiddenException);
      await expect(service.findOne(companyId, userId)).rejects.toThrow('Você não é membro desta empresa');
    });

    it('deve lançar NotFoundException se empresa não existe', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId,
        companyId,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.company.findUnique.mockResolvedValue(null);

      await expect(service.findOne(companyId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(companyId, userId)).rejects.toThrow('Empresa não encontrada');
    });
  });

  describe('update', () => {
    const companyId = 'company-1';
    const userId = 'user-1';
    const updateCompanyDto: UpdateCompanyDto = {
      name: 'Updated Company',
    };

    it('deve atualizar empresa se usuário é OWNER', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId,
        companyId,
        role: Role.OWNER,
      };
      const mockCompany = {
        id: companyId,
        ...updateCompanyDto,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.company.update.mockResolvedValue(mockCompany);

      const result = await service.update(companyId, userId, updateCompanyDto);

      expect(mockPrismaService.company.update).toHaveBeenCalledWith({
        where: { id: companyId },
        data: updateCompanyDto,
      });
      expect(result).toEqual(mockCompany);
    });

    it('deve atualizar empresa se usuário é ADMIN', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId,
        companyId,
        role: Role.ADMIN,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.company.update.mockResolvedValue({});

      await service.update(companyId, userId, updateCompanyDto);

      expect(mockPrismaService.company.update).toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException se usuário é MEMBER', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId,
        companyId,
        role: Role.MEMBER,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      await expect(service.update(companyId, userId, updateCompanyDto)).rejects.toThrow(ForbiddenException);
      await expect(service.update(companyId, userId, updateCompanyDto)).rejects.toThrow('Apenas OWNER e ADMIN podem editar a empresa');
    });
  });

  describe('remove', () => {
    const companyId = 'company-1';
    const userId = 'user-1';

    it('deve deletar empresa se é único OWNER', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId,
        companyId,
        role: Role.OWNER,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.membership.count.mockResolvedValue(1);
      mockPrismaService.company.delete.mockResolvedValue({});

      const result = await service.remove(companyId, userId);

      expect(mockPrismaService.company.delete).toHaveBeenCalledWith({
        where: { id: companyId },
      });
      expect(result).toEqual({ message: 'Empresa deletada com sucesso' });
    });

    it('deve lançar BadRequestException se existem outros OWNERs', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId,
        companyId,
        role: Role.OWNER,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.membership.count.mockResolvedValue(2);

      await expect(service.remove(companyId, userId)).rejects.toThrow(BadRequestException);
      await expect(service.remove(companyId, userId)).rejects.toThrow('Não é possível deletar a empresa. Existem outros OWNERs.');
    });

    it('deve lançar ForbiddenException se usuário não é OWNER', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId,
        companyId,
        role: Role.ADMIN,
      };

      mockPrismaService.membership.findUnique.mockResolvedValue(mockMembership);

      await expect(service.remove(companyId, userId)).rejects.toThrow(ForbiddenException);
      await expect(service.remove(companyId, userId)).rejects.toThrow('Apenas OWNER pode deletar a empresa');
    });
  });
});


import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Role } from '../membership/enums/role.enum';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    invite: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    membership: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    it('deve criar usuário e retornar token', async () => {
      const hashedPassword = 'hashedPassword123';
      const mockUser = {
        id: 'user-1',
        email: signupDto.email,
        name: signupDto.name,
        avatar: null,
        activeCompanyId: null,
      };
      const mockToken = 'jwt-token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.signup(signupDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signupDto.email,
          name: signupDto.name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          activeCompanyId: true,
        },
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe(mockToken);
    });

    it('deve lançar BadRequestException se email já existe', async () => {
      const existingUser = {
        id: 'user-1',
        email: signupDto.email,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.signup(signupDto)).rejects.toThrow(BadRequestException);
      await expect(service.signup(signupDto)).rejects.toThrow('Email já cadastrado');
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-1',
      email: loginDto.email,
      name: 'Test User',
      password: 'hashedPassword123',
      avatar: null,
      activeCompanyId: null,
    };

    it('deve fazer login e retornar token', async () => {
      const mockToken = 'jwt-token';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.token).toBe(mockToken);
    });

    it('deve lançar UnauthorizedException se usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException se senha está incorreta', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('acceptInvite', () => {
    const acceptInviteDto: AcceptInviteDto = {
      token: 'invite-token-123',
      name: 'New User',
      password: 'password123',
    };

    const mockInvite = {
      id: 'invite-1',
      email: 'newuser@example.com',
      token: acceptInviteDto.token,
      role: Role.MEMBER,
      companyId: 'company-1',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      acceptedAt: null,
      company: {
        id: 'company-1',
        name: 'Test Company',
      },
    };

    it('deve aceitar convite e criar novo usuário', async () => {
      const hashedPassword = 'hashedPassword123';
      const mockNewUser = {
        id: 'user-2',
        email: mockInvite.email,
        name: acceptInviteDto.name,
        avatar: null,
      };
      const mockToken = 'jwt-token';

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          invite: {
            findUnique: jest.fn().mockResolvedValue(mockInvite),
            update: jest.fn().mockResolvedValue({ ...mockInvite, acceptedAt: new Date() }),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockNewUser),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockNewUser, activeCompanyId: mockInvite.companyId }),
          },
          membership: {
            findUnique: jest.fn(),
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockPrisma);
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.acceptInvite(acceptInviteDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(mockInvite.email);
    });

    it('deve aceitar convite para usuário existente', async () => {
      const mockExistingUser = {
        id: 'user-1',
        email: mockInvite.email,
        name: 'Existing User',
        avatar: null,
      };
      const mockToken = 'jwt-token';

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          invite: {
            findUnique: jest.fn().mockResolvedValue(mockInvite),
            update: jest.fn().mockResolvedValue({ ...mockInvite, acceptedAt: new Date() }),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue(mockExistingUser),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockExistingUser, activeCompanyId: mockInvite.companyId }),
          },
          membership: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockPrisma);
      });

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.acceptInvite({ ...acceptInviteDto, password: undefined });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });

    it('deve lançar NotFoundException se convite não existe', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          invite: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockPrisma);
      });

      await expect(service.acceptInvite(acceptInviteDto)).rejects.toThrow(NotFoundException);
      await expect(service.acceptInvite(acceptInviteDto)).rejects.toThrow('Convite não encontrado');
    });

    it('deve lançar BadRequestException se convite já foi aceito', async () => {
      const acceptedInvite = { ...mockInvite, acceptedAt: new Date() };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          invite: {
            findUnique: jest.fn().mockResolvedValue(acceptedInvite),
          },
        };
        return callback(mockPrisma);
      });

      await expect(service.acceptInvite(acceptInviteDto)).rejects.toThrow(BadRequestException);
      await expect(service.acceptInvite(acceptInviteDto)).rejects.toThrow('Convite já foi aceito');
    });

    it('deve lançar BadRequestException se convite expirou', async () => {
      const expiredInvite = {
        ...mockInvite,
        expiresAt: new Date(Date.now() - 1000),
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          invite: {
            findUnique: jest.fn().mockResolvedValue(expiredInvite),
          },
        };
        return callback(mockPrisma);
      });

      await expect(service.acceptInvite(acceptInviteDto)).rejects.toThrow(BadRequestException);
      await expect(service.acceptInvite(acceptInviteDto)).rejects.toThrow('Convite expirado');
    });

    it('deve lançar BadRequestException se usuário já é membro', async () => {
      const mockExistingUser = {
        id: 'user-1',
        email: mockInvite.email,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          invite: {
            findUnique: jest.fn().mockResolvedValue(mockInvite),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue(mockExistingUser),
          },
          membership: {
            findUnique: jest.fn().mockResolvedValue({ id: 'membership-1' }),
          },
        };
        return callback(mockPrisma);
      });

      await expect(service.acceptInvite(acceptInviteDto)).rejects.toThrow(BadRequestException);
      await expect(service.acceptInvite(acceptInviteDto)).rejects.toThrow(
        'Você já é membro desta empresa'
      );
    });

    it('deve lançar BadRequestException se senha não fornecida para novo usuário', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          invite: {
            findUnique: jest.fn().mockResolvedValue(mockInvite),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockPrisma);
      });

      await expect(
        service.acceptInvite({ ...acceptInviteDto, password: undefined })
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.acceptInvite({ ...acceptInviteDto, password: undefined })
      ).rejects.toThrow('Senha é obrigatória para novos usuários');
    });
  });

  describe('getMe', () => {
    const userId = 'user-1';
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
      activeCompanyId: 'company-1',
      memberships: [],
      activeCompany: {
        id: 'company-1',
        name: 'Test Company',
        logo: null,
        slug: 'test-company',
      },
    };

    it('deve retornar dados do usuário', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          memberships: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                  slug: true,
                },
              },
            },
          },
          activeCompany: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve lançar NotFoundException se usuário não existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe(userId)).rejects.toThrow(NotFoundException);
      await expect(service.getMe(userId)).rejects.toThrow('Usuário não encontrado');
    });
  });
});

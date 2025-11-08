import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { Role } from '../membership/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, name, password } = signupDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
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

    return this.generateTokenResponse(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateTokenResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      activeCompanyId: user.activeCompanyId,
    });
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto) {
    const { token, name, password } = acceptInviteDto;

    return this.prisma.$transaction(async (prisma) => {
      const invite = await prisma.invite.findUnique({
        where: { token },
        include: { company: true },
      });

      if (!invite) {
        throw new NotFoundException('Convite não encontrado');
      }

      if (invite.acceptedAt) {
        throw new BadRequestException('Convite já foi aceito');
      }

      if (new Date() > invite.expiresAt) {
        throw new BadRequestException('Convite expirado');
      }

      let user = await prisma.user.findUnique({
        where: { email: invite.email },
      });

      if (user) {
        const existingMembership = await prisma.membership.findUnique({
          where: {
            userId_companyId: {
              userId: user.id,
              companyId: invite.companyId,
            },
          },
        });

        if (existingMembership) {
          throw new BadRequestException('Você já é membro desta empresa');
        }

        await prisma.membership.create({
          data: {
            userId: user.id,
            companyId: invite.companyId,
            role: invite.role,
          },
        });
      } else {
        if (!password) {
          throw new BadRequestException('Senha é obrigatória para novos usuários');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
          data: {
            email: invite.email,
            name: name || invite.email.split('@')[0],
            password: hashedPassword,
          },
        });

        await prisma.membership.create({
          data: {
            userId: user.id,
            companyId: invite.companyId,
            role: invite.role,
          },
        });
      }

      await prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { activeCompanyId: invite.companyId },
      });

      return this.generateTokenResponse({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        activeCompanyId: invite.companyId,
      });
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
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

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  private generateTokenResponse(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      activeCompanyId: user.activeCompanyId,
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        activeCompanyId: user.activeCompanyId,
      },
      token,
    };
  }
}


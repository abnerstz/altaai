import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Role } from '../membership/enums/role.enum';
import { EmailService } from '../email/email.service';

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(companyId: string, userId: string, createInviteDto: CreateInviteDto) {
    const { email, role } = createInviteDto;

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    if (membership.role === Role.MEMBER) {
      throw new ForbiddenException('Apenas OWNER e ADMIN podem convidar');
    }

    if (membership.role === Role.ADMIN && role === Role.OWNER) {
      throw new ForbiddenException('ADMIN não pode convidar como OWNER');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMembership = await this.prisma.membership.findUnique({
        where: {
          userId_companyId: {
            userId: existingUser.id,
            companyId,
          },
        },
      });

      if (existingMembership) {
        throw new BadRequestException('Usuário já é membro desta empresa');
      }
    }

    await this.prisma.invite.updateMany({
      where: {
        email,
        companyId,
        acceptedAt: null,
      },
      data: {
        expiresAt: new Date(0),
      },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await this.prisma.invite.create({
      data: {
        email,
        token: uuidv4(),
        role,
        companyId,
        senderId: userId,
        expiresAt,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.sendInviteEmailAsync(invite).catch((error) => {
      this.logger.error(`Erro ao enviar email de convite: ${error.message}`, error.stack);
    });

    return invite;
  }

  private async sendInviteEmailAsync(invite: {
    email: string;
    company: { name: string };
    sender: { name: string };
    role: string;
    token: string;
    expiresAt: Date;
  }) {
    await this.emailService.sendInviteEmail({
      to: invite.email,
      companyName: invite.company.name,
      senderName: invite.sender.name,
      role: invite.role,
      token: invite.token,
      expiresAt: invite.expiresAt,
    });
  }

  async findAll(companyId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    const invites = await this.prisma.invite.findMany({
      where: {
        companyId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invites;
  }

  async findMyPendingInvites(userEmail: string) {
    const invites = await this.prisma.invite.findMany({
      where: {
        email: userEmail,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invites;
  }

  async remove(inviteId: string, userId: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        company: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: invite.companyId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    if (membership.role === Role.MEMBER) {
      throw new ForbiddenException('Apenas OWNER e ADMIN podem cancelar convites');
    }

    if (invite.senderId !== userId && membership.role !== Role.OWNER) {
      throw new ForbiddenException('Você não pode cancelar este convite');
    }

    await this.prisma.invite.delete({
      where: { id: inviteId },
    });

    return { message: 'Convite cancelado com sucesso' };
  }

  async findByToken(token: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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

    return invite;
  }

  async rejectByToken(token: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
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

    await this.prisma.invite.delete({
      where: { id: invite.id },
    });

    return { message: 'Convite recusado com sucesso' };
  }
}

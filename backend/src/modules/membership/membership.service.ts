import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Role } from './enums/role.enum';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

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

    const members = await this.prisma.membership.findMany({
      where: { companyId },
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
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });

    return members;
  }

  async updateRole(companyId: string, targetUserId: string, newRole: Role, userId: string) {
    const requesterMembership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    if (requesterMembership.role === Role.MEMBER) {
      throw new ForbiddenException('Apenas OWNER e ADMIN podem alterar papéis');
    }

    const targetMembership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId,
        },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (targetMembership.role === Role.OWNER && requesterMembership.role === Role.ADMIN) {
      throw new ForbiddenException('ADMIN não pode alterar papel de OWNER');
    }

    if (targetMembership.role === Role.OWNER && newRole !== Role.OWNER) {
      const ownerCount = await this.prisma.membership.count({
        where: {
          companyId,
          role: Role.OWNER,
        },
      });

      if (ownerCount === 1) {
        throw new BadRequestException('Empresa deve ter pelo menos um OWNER');
      }
    }

    const updated = await this.prisma.membership.update({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId,
        },
      },
      data: { role: newRole },
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

    return updated;
  }

  async remove(companyId: string, targetUserId: string, userId: string) {
    const requesterMembership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (!requesterMembership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    if (requesterMembership.role === Role.MEMBER) {
      throw new ForbiddenException('Apenas OWNER e ADMIN podem remover membros');
    }

    const targetMembership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId,
        },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (targetMembership.role === Role.OWNER && requesterMembership.role === Role.ADMIN) {
      throw new ForbiddenException('ADMIN não pode remover OWNER');
    }

    if (targetMembership.role === Role.OWNER) {
      const ownerCount = await this.prisma.membership.count({
        where: {
          companyId,
          role: Role.OWNER,
        },
      });

      if (ownerCount === 1) {
        throw new BadRequestException('Empresa deve ter pelo menos um OWNER');
      }
    }

    await this.prisma.membership.delete({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId,
        },
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (user?.activeCompanyId === companyId) {
      await this.prisma.user.update({
        where: { id: targetUserId },
        data: { activeCompanyId: null },
      });
    }

    return { message: 'Membro removido com sucesso' };
  }
}

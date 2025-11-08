import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Role } from '../membership/enums/role.enum';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCompanyDto: CreateCompanyDto) {
    const { name, logo } = createCompanyDto;

    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.company.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const company = await this.prisma.company.create({
      data: {
        name,
        logo,
        slug,
      },
    });

    await this.prisma.membership.create({
      data: {
        userId,
        companyId: company.id,
        role: Role.OWNER,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeCompanyId: company.id },
    });

    return company;
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where: {
          memberships: {
            some: {
              userId,
            },
          },
        },
        include: {
          _count: {
            select: {
              memberships: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.company.count({
        where: {
          memberships: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: true,
            invites: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company;
  }

  async update(id: string, userId: string, updateCompanyDto: UpdateCompanyDto) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    if (membership.role === Role.MEMBER) {
      throw new ForbiddenException('Apenas OWNER e ADMIN podem editar a empresa');
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    return company;
  }

  async remove(id: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    if (membership.role !== Role.OWNER) {
      throw new ForbiddenException('Apenas OWNER pode deletar a empresa');
    }

    const ownerCount = await this.prisma.membership.count({
      where: {
        companyId: id,
        role: Role.OWNER,
      },
    });

    if (ownerCount === 1) {
      await this.prisma.company.delete({
        where: { id },
      });

      return { message: 'Empresa deletada com sucesso' };
    }

    throw new BadRequestException('Não é possível deletar a empresa. Existem outros OWNERs.');
  }

  async selectCompany(id: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeCompanyId: id },
    });

    return { message: 'Empresa selecionada com sucesso' };
  }
}

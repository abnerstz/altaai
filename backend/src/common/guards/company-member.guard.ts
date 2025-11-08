import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class CompanyMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const companyId = request.params.id || request.params.companyId;

    if (!companyId) {
      throw new ForbiddenException('Company ID não fornecido');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    request.membership = membership;
    request.companyId = companyId;

    return true;
  }
}

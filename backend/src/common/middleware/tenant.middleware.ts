import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;

    if (!user) {
      return next();
    }

    if (user.activeCompanyId) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId: user.activeCompanyId,
          },
        },
      });

      if (membership) {
        (req as any).companyId = user.activeCompanyId;
        (req as any).membership = membership;
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { activeCompanyId: null },
        });
      }
    }

    next();
  }
}

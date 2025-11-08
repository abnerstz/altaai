import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../modules/membership/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const membership = request.membership;

    if (!membership) {
      throw new ForbiddenException('Você não é membro desta empresa');
    }

    const userRole = String(membership.role).toUpperCase() as Role;
    const userLevel = ROLE_HIERARCHY[userRole];

    if (!userLevel) {
      throw new ForbiddenException(`Role inválido: ${membership.role}`);
    }

    const requiredLevels = requiredRoles.map((role) => {
      const roleStr = String(role).toUpperCase() as Role;
      const level = ROLE_HIERARCHY[roleStr];
      if (!level) {
        throw new ForbiddenException(`Role requerido inválido: ${role}`);
      }
      return level;
    });

    const hasPermission = requiredLevels.some((level) => userLevel >= level);

    if (!hasPermission) {
      const roleNames = requiredRoles.join(' ou ');
      throw new ForbiddenException(
        `Acesso negado. Esta ação requer permissão de ${roleNames}. Seu role atual: ${userRole}`
      );
    }

    return true;
  }
}

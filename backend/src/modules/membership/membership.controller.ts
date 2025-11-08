import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MembershipService } from './membership.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyMemberGuard } from '../../common/guards/company-member.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from './enums/role.enum';

@ApiTags('memberships')
@ApiBearerAuth()
@Controller('companies/:id/members')
@UseGuards(JwtAuthGuard, CompanyMemberGuard)
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get()
  @ApiOperation({ summary: 'Listar membros da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de membros' })
  async findAll(@Param('id') companyId: string, @CurrentUser() user: any) {
    return this.membershipService.findAll(companyId, user.id);
  }

  @Patch(':userId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Alterar papel do membro' })
  @ApiResponse({ status: 200, description: 'Papel alterado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async updateRole(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @Body('role') role: Role,
    @CurrentUser() user: any
  ) {
    return this.membershipService.updateRole(companyId, userId, role, user.id);
  }

  @Delete(':userId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover membro da empresa' })
  @ApiResponse({ status: 200, description: 'Membro removido' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async remove(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any
  ) {
    return this.membershipService.remove(companyId, userId, user.id);
  }
}


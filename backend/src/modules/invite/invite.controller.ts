import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyMemberGuard } from '../../common/guards/company-member.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../membership/enums/role.enum';

@ApiTags('invites')
@ApiBearerAuth()
@Controller('companies/:id/invites')
@UseGuards(JwtAuthGuard, CompanyMemberGuard, RolesGuard)
@Roles(Role.OWNER, Role.ADMIN)
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post()
  @ApiOperation({ summary: 'Criar convite (OWNER/ADMIN)' })
  @ApiResponse({ status: 201, description: 'Convite criado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(
    @Param('id') companyId: string,
    @CurrentUser() user: any,
    @Body() createInviteDto: CreateInviteDto
  ) {
    return this.inviteService.create(companyId, user.id, createInviteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar convites pendentes' })
  @ApiResponse({ status: 200, description: 'Lista de convites' })
  async findAll(@Param('id') companyId: string, @CurrentUser() user: any) {
    return this.inviteService.findAll(companyId, user.id);
  }
}

@ApiTags('invites')
@Controller('invites')
export class PublicInviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Get('token/:token')
  @Public()
  @ApiOperation({ summary: 'Buscar informações do convite por token (público)' })
  @ApiResponse({ status: 200, description: 'Informações do convite' })
  @ApiResponse({ status: 404, description: 'Convite não encontrado' })
  @ApiResponse({ status: 400, description: 'Convite inválido ou expirado' })
  async findByToken(@Param('token') token: string) {
    return this.inviteService.findByToken(token);
  }

  @Post('token/:token/reject')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recusar convite por token (público)' })
  @ApiResponse({ status: 200, description: 'Convite recusado' })
  @ApiResponse({ status: 404, description: 'Convite não encontrado' })
  @ApiResponse({ status: 400, description: 'Convite inválido ou expirado' })
  async rejectByToken(@Param('token') token: string) {
    return this.inviteService.rejectByToken(token);
  }
}

@ApiTags('invites')
@ApiBearerAuth()
@Controller('invites')
@UseGuards(JwtAuthGuard)
export class InviteDeleteController {
  constructor(private readonly inviteService: InviteService) {}

  @Get('my-pending')
  @ApiOperation({ summary: 'Listar meus convites pendentes' })
  @ApiResponse({ status: 200, description: 'Lista de convites pendentes' })
  async findMyPendingInvites(@CurrentUser() user: any) {
    return this.inviteService.findMyPendingInvites(user.email);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar convite' })
  @ApiResponse({ status: 200, description: 'Convite cancelado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inviteService.remove(id, user.id);
  }
}


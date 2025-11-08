import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyMemberGuard } from '../../common/guards/company-member.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../membership/enums/role.enum';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova empresa' })
  @ApiResponse({ status: 201, description: 'Empresa criada com sucesso' })
  async create(@CurrentUser() user: any, @Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(user.id, createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas do usuário (paginado)' })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.companyService.findAll(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10
    );
  }

  @Get(':id')
  @UseGuards(CompanyMemberGuard)
  @ApiOperation({ summary: 'Obter detalhes da empresa' })
  @ApiResponse({ status: 200, description: 'Detalhes da empresa' })
  @ApiResponse({ status: 403, description: 'Não é membro da empresa' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companyService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(CompanyMemberGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Editar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa atualizada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCompanyDto: UpdateCompanyDto
  ) {
    return this.companyService.update(id, user.id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(CompanyMemberGuard, RolesGuard)
  @Roles(Role.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar empresa (apenas OWNER)' })
  @ApiResponse({ status: 200, description: 'Empresa deletada' })
  @ApiResponse({ status: 403, description: 'Apenas OWNER pode deletar' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companyService.remove(id, user.id);
  }

  @Post(':id/select')
  @UseGuards(CompanyMemberGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Definir empresa como ativa' })
  @ApiResponse({ status: 200, description: 'Empresa selecionada' })
  async selectCompany(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companyService.selectCompany(id, user.id);
  }
}

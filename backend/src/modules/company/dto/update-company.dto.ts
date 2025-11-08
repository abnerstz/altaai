import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({ example: 'Empresa Exemplo Atualizada', required: false })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsString({ message: 'Logo deve ser uma string' })
  @IsOptional()
  logo?: string;
}


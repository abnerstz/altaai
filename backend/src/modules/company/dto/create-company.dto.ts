import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Empresa Exemplo' })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  name: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsString({ message: 'Logo deve ser uma string' })
  @IsOptional()
  logo?: string;
}


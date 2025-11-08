import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectCompanyDto {
  @ApiProperty({ example: 'company-id-uuid' })
  @IsString({ message: 'Company ID deve ser uma string' })
  @IsNotEmpty({ message: 'Company ID é obrigatório' })
  companyId: string;
}

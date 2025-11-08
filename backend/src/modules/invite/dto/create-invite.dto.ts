import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../membership/enums/role.enum';

export class CreateInviteDto {
  @ApiProperty({ example: 'novo@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'MEMBER', enum: Role, default: Role.MEMBER })
  @IsEnum(Role, { message: 'Papel inválido' })
  @IsNotEmpty({ message: 'Papel é obrigatório' })
  role: Role;
}


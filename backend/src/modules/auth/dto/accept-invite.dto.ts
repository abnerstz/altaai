import { IsString, IsNotEmpty, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty({ example: 'token-uuid-aqui' })
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;

  @ApiProperty({ example: 'João Silva', required: false })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'SenhaSegura123!', minLength: 8, required: false })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Senha deve conter pelo menos: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial',
  })
  @IsOptional()
  password?: string;
}

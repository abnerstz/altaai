import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Post('signup')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Criar nova conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já cadastrado' })
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    const result = await this.authService.signup(signupDto);

    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.CREATED).json({ user: result.user });
  }

  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);

    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: result.user });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fazer logout' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Logout realizado com sucesso' });
  }

  @Post('accept-invite')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aceitar convite' })
  @ApiResponse({ status: 200, description: 'Convite aceito com sucesso' })
  @ApiResponse({ status: 400, description: 'Convite inválido ou expirado' })
  async acceptInvite(@Body() acceptInviteDto: AcceptInviteDto, @Res() res: Response) {
    const result = await this.authService.acceptInvite(acceptInviteDto);

    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: result.user });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter dados do usuário logado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }
}


import { Controller, Post, Body, UseFilters, Version } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/dtos/register-users';
import { UserDto } from 'src/dtos/login-users';
import { UserValidatorFilter } from 'src/filters/UserValidator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Version('1') // Esto es para que en el endpoint se vea la version, ej api/v2/auth/register
  @UseFilters(UserValidatorFilter)
  @Post('register')
  async register(
    @Body()
    dto: CreateUserDto,
  ) {
    return this.authService.register(dto);
  }
  @Version('1')
  @UseFilters(UserValidatorFilter)
  @Post('login')
  async login(@Body() dto: UserDto) {
    // const user = await this.authService.validateUser(dto.email, dto.password);
    // if (!user) throw new UnauthorizedException('Credenciales inválidas');
    return this.authService.login({ password: dto.password, email: dto.email });
  }
}

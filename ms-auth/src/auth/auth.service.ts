import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user';
import { CreateUserDto } from 'src/dtos/register-users';
import { JwtPayload } from './JwtPayload.interface';
import { USER_ROLE } from 'src/users/user-role.enum';
import { ResponseFactory } from './../responses/ResponseFactory.class';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  private async generateJwt(
    user: User | { id: string; role: USER_ROLE }, // Esto para que sea mas flexible
  ): Promise<{ access_token: string }> {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    // TODO: agregar log aqui
    return { access_token: await this.jwtService.signAsync(payload) };
  }
  async login(attempt: { password: string; email: string }) {
    const user = this.userService.validateUser(attempt.email, attempt.password);

    const result = await user;

    return result
      ? ResponseFactory.ok(await this.generateJwt(result))
      : ResponseFactory.unauthorized(null, 'Invalid login credentials');
  }
  async register(dto: CreateUserDto) {
    let register: User | undefined;
    try {
      register = await this.userService.addUser(
        dto.email,
        dto.password,
        dto.role,
        dto.fullName,
      );
    } catch (err) {
      return ResponseFactory.conflict(
        [],
        'Ya existe un usuario registrado con estas credenciales',
      );
    }

    return register
      ? ResponseFactory.created(await this.generateJwt(register))
      : ResponseFactory.serverError();
  }
  async validate(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return ResponseFactory.ok(payload, 'Token válido');
    } catch {
      return ResponseFactory.unauthorized(null, 'Token inválido o expirado');
    }
  }
}

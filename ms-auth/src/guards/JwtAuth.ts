import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseFactory } from '../responses/ResponseFactory.class';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw ResponseFactory.unauthorized(
        null,
        'Falta el header de autorizacion',
      );
    }

    const [, token] = authHeader.split(' ');
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload; // lo inyectas en la request
      return true;
    } catch (err) {
      throw ResponseFactory.unauthorized(null, 'Token invalido o expirado');
    }
  }
}

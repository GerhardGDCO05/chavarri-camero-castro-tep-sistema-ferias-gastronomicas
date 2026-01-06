import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ResponseFactory } from '../responses/ResponseFactory.class'; // ajusta la ruta según tu proyecto

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      request.res = ResponseFactory.unauthorized([], 'Token no proporcionado');
      return false;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      request.res = ResponseFactory.unauthorized([], 'Token inválido');
      return false;
    }

    try {
      // llamada al microservicio de auth
      const response = await firstValueFrom(
        this.httpService.post('http://ms-auth:3001/api/v1/auth/validate', {
          token,
        }),
      );

      if (!('status' in response.data) || response.data.status !== 200) {
        request.res = ResponseFactory.unauthorized(
          [],
          'Token inválido o expirado',
        );
        return false;
      }

      //inyecta el payload en request.user para usarlo en los controladores
      request.user = response.data.data;
      return true;
    } catch (err) {
      request.res = ResponseFactory.unauthorized(
        [],
        'Token inválido o expirado',
      );
      return false;
    }
  }
}

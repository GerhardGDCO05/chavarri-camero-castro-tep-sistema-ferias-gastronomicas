import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';
import { ResponseFactory } from '../responses/ResponseFactory.class'; // ajusta la ruta según tu proyecto

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      request.res = ResponseFactory.unauthorized([], 'Usuario no autenticado');
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      request.res = ResponseFactory.forbidden(
        [],
        'No tienes permisos para acceder a este recurso',
      );
      return false;
    }

    return true;
  }
}


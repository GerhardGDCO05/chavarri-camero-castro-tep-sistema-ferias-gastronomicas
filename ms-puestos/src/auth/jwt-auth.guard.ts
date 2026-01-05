import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    // Simulación simple para desarrollo
    // En producción, validarías el JWT real
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    // Para desarrollo, asumimos que el token es válido
    // y extraemos datos simulados del usuario
    request.user = {
      id: 'user-id-simulado',
      role: 'emprendedor' // Cambiar según necesidad
    };

    return true;
  }
}
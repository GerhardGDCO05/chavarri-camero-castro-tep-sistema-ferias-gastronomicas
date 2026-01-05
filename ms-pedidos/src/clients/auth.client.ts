import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { ValidateTokenResponse, User } from '../interfaces/auth-service.interface';

interface AuthGrpcService {
  validateToken(data: { token: string }): Observable<ValidateTokenResponse>;
  getUserById(data: { id: string }): Observable<User>;
}

@Injectable()
export class AuthClient implements OnModuleInit {
  private authService: AuthGrpcService;

  constructor(@Inject('AUTH_PACKAGE') private client: microservices.ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthGrpcService>('AuthService');
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    try {
      // El método ahora devuelve un Observable, así que usamos firstValueFrom
      return await firstValueFrom(this.authService.validateToken({ token }));
    } catch (error) {
      console.error('Error validating token:', error);
      return {
        valid: false,
        message: `Error validating token: ${error.message}`,
      };
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await firstValueFrom(this.authService.getUserById({ id: userId }));
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async validateUserRole(userId: string, requiredRole: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user?.role === requiredRole;
    } catch (error) {
      console.error('Error validating user role:', error);
      return false;
    }
  }

  async getCurrentUserFromToken(token: string): Promise<User | null> {
    try {
      const validation = await this.validateToken(token);
      if (validation.valid && validation.user) {
        return validation.user;
      }
      return null;
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }
}
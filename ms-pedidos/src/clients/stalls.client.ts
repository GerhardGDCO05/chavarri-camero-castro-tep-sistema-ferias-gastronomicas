import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { Stall } from '../interfaces/stall-service.interface';

interface StallsGrpcService {
  getStallById(data: { id: string }): Observable<Stall>;
  isStallActive(data: { id: string }): Observable<{ active: boolean; message?: string }>;
  validateStallOwnership(data: { stallId: string; entrepreneurId: string }): Observable<{ valid: boolean; message?: string }>;
  getActiveStalls(): Observable<{ stalls: Stall[] }>;
}

@Injectable()
export class StallsClient implements OnModuleInit {
  private stallsService: StallsGrpcService;

  constructor(@Inject('STALLS_PACKAGE') private client: microservices.ClientGrpc) {}

  onModuleInit() {
    this.stallsService = this.client.getService<StallsGrpcService>('StallsService');
  }

  async getStall(stallId: string): Promise<Stall> {
    try {
      return await firstValueFrom(this.stallsService.getStallById({ id: stallId }));
    } catch (error) {
      console.error('Error fetching stall:', error);
      throw new Error(`Error fetching stall ${stallId}: ${error.message}`);
    }
  }

  async isStallActive(stallId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.stallsService.isStallActive({ id: stallId }),
      );
      return response.active;
    } catch (error) {
      console.error('Error checking stall status:', error);
      return false;
    }
  }

  async validateStallOwnership(stallId: string, entrepreneurId: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.stallsService.validateStallOwnership({ stallId, entrepreneurId }),
      );
      return response.valid;
    } catch (error) {
      console.error('Error validating stall ownership:', error);
      return false;
    }
  }

  async getActiveStalls(): Promise<Stall[]> {
    try {
      const response = await firstValueFrom(this.stallsService.getActiveStalls());
      return response.stalls;
    } catch (error) {
      console.error('Error fetching active stalls:', error);
      return [];
    }
  }

  async getStallByEntrepreneur(entrepreneurId: string): Promise<Stall | null> {
    try {
      // Nota: Necesitarías implementar este método en el servicio de puestos
      // Por ahora, obtenemos todos los puestos activos y filtramos
      const activeStalls = await this.getActiveStalls();
      return activeStalls.find(stall => stall.entrepreneurId === entrepreneurId) || null;
    } catch (error) {
      console.error('Error fetching stall by entrepreneur:', error);
      return null;
    }
  }
}
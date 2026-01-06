import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stall } from '../entities/stalls.entity';
import { CreateStallDto } from '../dto/create-stall.dto';
import { UpdateStallDto } from '../dto/update-stalls.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';

@Injectable()
export class StallsService {
  constructor(
    @InjectRepository(Stall)
    private stallsRepository: Repository<Stall>,
  ) {}

  async create(
    createStallDto: CreateStallDto,
    ownerId: string,
  ): Promise<Stall> {
    // Verificar si el usuario ya tiene un puesto activo
    const existingStall = await this.stallsRepository.findOne({
      where: { ownerId, status: 'activo' },
    });

    if (existingStall) {
      throw new BadRequestException('Ya tienes un puesto activo');
    }

    const stall = this.stallsRepository.create({
      ...createStallDto,
      ownerId,
      status: 'pendiente', // Estado inicial
    });

    return await this.stallsRepository.save(stall);
  }

  async findAllByOwner(ownerId: string): Promise<Stall[]> {
    return await this.stallsRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  // WARN: trhows
  async findOne(id: string, ownerId?: string): Promise<Stall> {
    const stall = await this.stallsRepository.findOne({ where: { id } });

    if (!stall) {
      throw new NotFoundException('Puesto no encontrado');
    }

    // Si se proporciona ownerId, validar propiedad
    if (ownerId && stall.ownerId !== ownerId) {
      throw new ForbiddenException('No eres el propietario de este puesto');
    }

    return stall;
  }

  async findOneActive(id: string): Promise<Stall> {
    const stall = await this.stallsRepository.findOne({
      where: { id, status: 'activo' },
    });

    if (!stall) {
      throw new NotFoundException('Puesto activo no encontrado');
    }

    return stall;
  }

  async update(
    id: string,
    updateStallDto: UpdateStallDto,
    ownerId: string,
  ): Promise<Stall> {
    const stall = await this.findOne(id, ownerId);

    // Solo permitir actualización si el puesto está pendiente
    if (stall.status !== 'pendiente') {
      throw new BadRequestException(
        'Solo se pueden modificar puestos en estado pendiente',
      );
    }

    Object.assign(stall, updateStallDto);
    return await this.stallsRepository.save(stall);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const stall = await this.findOne(id, ownerId);

    // Solo permitir eliminación si el puesto está pendiente
    if (stall.status !== 'pendiente') {
      throw new BadRequestException(
        'Solo se pueden eliminar puestos en estado pendiente',
      );
    }

    await this.stallsRepository.remove(stall);
  }

  async changeStatus(
    id: string,
    changeStatusDto: ChangeStatusDto,
  ): Promise<Stall> {
    const stall = await this.findOne(id);

    // Validaciones de transición de estado
    if (stall.status === 'activo' && changeStatusDto.status !== 'activo') {
      throw new BadRequestException(
        'No se puede cambiar el estado de un puesto activo',
      );
    }

    stall.status = changeStatusDto.status;
    return await this.stallsRepository.save(stall);
  }

  async findAllActive(): Promise<Stall[]> {
    return await this.stallsRepository.find({
      where: { status: 'activo' },
      order: { name: 'ASC' },
    });
  }

  async findByStatus(
    status: 'pendiente' | 'aprobado' | 'activo',
  ): Promise<Stall[]> {
    return await this.stallsRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }
}


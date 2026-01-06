import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { StallsService } from '../stalls/stalls.service';
import { CreateStallDto } from '../dto/create-stall.dto';
import { UpdateStallDto } from '../dto/update-stalls.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { ResponseFactory } from '@/responses/ResponseFactory.class';
import { Stall } from '@/entities/stalls.entity';

@Controller('stalls')
export class StallsController {
  constructor(private readonly stallsService: StallsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRENEUR)
  async create(@Body() createStallDto: CreateStallDto, @Request() req) {
    let res: Stall | undefined;
    try {
      res = await this.stallsService.create(createStallDto, req.user.sub);
    } catch (err) {
      return ResponseFactory.badRequest([], 'Ya tienes un puesto activo');
    }
    return res
      ? ResponseFactory.created(res, 'Puesto creado satisfactoriamente')
      : ResponseFactory.serverError(res, 'Intente de nuevo');
  }

  @Get('my-stalls')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRENEUR)
  async findMyStalls(@Request() req) {
    const res = await this.stallsService.findAllByOwner(req.user.sub);
    return ResponseFactory.ok(res, 'Listado de tus puestos');
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      const ownerId =
        req.user.role === Role.ENTREPRENEUR ? req.user.sub : undefined;
      const res = await this.stallsService.findOne(id, ownerId);
      return ResponseFactory.ok(res, 'Puesto encontrado');
    } catch (err) {
      if (err instanceof NotFoundException) {
        return ResponseFactory.notFound([], 'Puesto no existe');
      }
      if (err instanceof ForbiddenException) {
        return ResponseFactory.forbidden(
          [],
          'No eres el propietario de este puesto',
        );
      }
      return ResponseFactory.serverError([], 'Error al buscar el puesto');
    }
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRENEUR)
  async update(
    @Param('id') id: string,
    @Body() updateStallDto: UpdateStallDto,
    @Request() req,
  ) {
    try {
      const res = await this.stallsService.update(
        id,
        updateStallDto,
        req.user.sub,
      );
      return ResponseFactory.ok(res, 'Puesto actualizado');
    } catch (err) {
      if (err instanceof BadRequestException)
        return ResponseFactory.badRequest([], err.message);
      if (err instanceof NotFoundException) {
        return ResponseFactory.notFound([], 'Puesto no existe');
      }
      if (err instanceof ForbiddenException) {
        return ResponseFactory.forbidden(
          [],
          'No eres el propietario de este puesto',
        );
      }
      return ResponseFactory.serverError([], 'Error al eliminar el puesto');
    }
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRENEUR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    try {
      await this.stallsService.remove(id, req.user.sub);
      return ResponseFactory.noContent('Puesto eliminado');
    } catch (err) {
      if (err instanceof BadRequestException)
        return ResponseFactory.badRequest([], err.message);
      if (err instanceof NotFoundException) {
        return ResponseFactory.notFound([], 'Puesto no existe');
      }
      if (err instanceof ForbiddenException) {
        return ResponseFactory.forbidden(
          [],
          'No eres el propietario de este puesto',
        );
      }
      return ResponseFactory.serverError([], 'Error al eliminar el puesto');
    }
  }
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    try {
      const res = await this.stallsService.changeStatus(id, changeStatusDto);
      return ResponseFactory.ok(res, 'Estado del puesto actualizado');
    } catch (err) {
      if (err instanceof BadRequestException)
        return ResponseFactory.badRequest([], err.message);
      if (err instanceof NotFoundException) {
        return ResponseFactory.notFound([], 'Puesto no existe');
      }
      if (err instanceof ForbiddenException) {
        return ResponseFactory.forbidden(
          [],
          'No eres el propietario de este puesto',
        );
      }
      return ResponseFactory.serverError([], 'Error al eliminar el puesto');
    }
  }
  @Get('public/active') async findActiveStalls() {
    try {
      const res = await this.stallsService.findAllActive();
      return ResponseFactory.ok(res, 'Listado de puestos activos');
    } catch (err) {
      return ResponseFactory.serverError(
        [],
        'Error al obtener puestos activos',
      );
    }
  }
  @Get('public/:id') async findPublicOne(@Param('id') id: string) {
    try {
      const res = await this.stallsService.findOneActive(id);
      return ResponseFactory.ok(res, 'Puesto activo encontrado');
    } catch (err) {
      if (err instanceof NotFoundException)
        return ResponseFactory.notFound([], 'Puesto activo no existe');

      return ResponseFactory.serverError(
        [],
        'Error al buscar el puesto activo',
      );
    }
  }
  @Get('admin/by-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  async findByStatus(
    @Query('status') status: 'pendiente' | 'aprobado' | 'activo',
  ) {
    try {
      const res = await this.stallsService.findByStatus(status);
      return ResponseFactory.ok(res, `Listado de puestos con estado ${status}`);
    } catch (err) {
      return ResponseFactory.serverError(
        [],
        'Error al filtrar puestos por estado',
      );
    }
  }
}

import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
  Request, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { StallsService } from '../stalls/stalls.service';
import { CreateStallDto } from '../dto/create-stall.dto';
import { UpdateStallDto } from '../dto/update-stalls.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('stalls')
export class StallsController {
  constructor(private readonly stallsService: StallsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRENEUR)
  async create(@Body() createStallDto: CreateStallDto, @Request() req) {
    return await this.stallsService.create(createStallDto, req.user.id);
  }

  @Get('my-stalls')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRENEUR)
  async findMyStalls(@Request() req) {
    return await this.stallsService.findAllByOwner(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    // Si es emprendedor, validar que sea dueño
    const ownerId = req.user.role === Role.ENTREPRENEUR ? req.user.id : undefined;
    return await this.stallsService.findOne(id, ownerId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRENEUR)
  async update(
    @Param('id') id: string,
    @Body() updateStallDto: UpdateStallDto,
    @Request() req,
  ) {
    return await this.stallsService.update(id, updateStallDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENTREPRENEUR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.stallsService.remove(id, req.user.id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return await this.stallsService.changeStatus(id, changeStatusDto);
  }

  @Get('public/active')
  async findActiveStalls() {
    return await this.stallsService.findAllActive();
  }

  @Get('public/:id')
  async findPublicOne(@Param('id') id: string) {
    return await this.stallsService.findOneActive(id);
  }

  @Get('admin/by-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  async findByStatus(@Query('status') status: 'pendiente' | 'aprobado' | 'activo') {
    return await this.stallsService.findByStatus(status);
  }
}
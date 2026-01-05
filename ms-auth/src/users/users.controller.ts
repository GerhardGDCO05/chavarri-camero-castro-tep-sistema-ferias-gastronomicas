import {
  Controller,
  Req,
  Get,
  Patch,
  Delete,
  Body,
  UseFilters,
  Version,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/guards/JwtAuth';
import { ResponseFactory } from 'src/responses/ResponseFactory.class';
import { EditUserDto } from 'src/dtos/edit-users';
import { UserValidatorFilter } from 'src/filters/UserValidator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Version('1') // Esto es para que en el endpoint se vea la version, ej api/v2/auth/register
  @Get()
  async getUser(@Req() req) {
    const userId = req.user.sub; // id viene del JWT const user = await this.userService.findUser(userId);
    console.log(userId);
    const user = await this.userService.getUser(userId);

    if (user === null) return ResponseFactory.notFound();
    return ResponseFactory.ok(user);
  }
  @Version('1')
  @UseFilters(UserValidatorFilter)
  @Patch()
  async editUser(@Req() req, @Body() dto: EditUserDto) {
    if (!(dto.email || dto.password || dto.role || dto.fullName))
      return ResponseFactory.badRequest(dto, 'body cant be empty');
    const userId = req.user.sub; // id viene del JWT const user = await this.userService.findUser(userId);
    const u = await this.userService.editUser(userId);
    return u
      ? ResponseFactory.ok(u, 'Datos actualizados')
      : ResponseFactory.notFound(u);
  }
  @Version('1') // Esto es para que en el endpoint se vea la version, ej api/v2/auth/register
  @Delete()
  async deleteUser(@Req() req) {
    const userId = req.user.sub; // id viene del JWT const user = await this.userService.findUser(userId);
    const user = await this.userService.deleteUser(userId);
    if (!user) return ResponseFactory.notFound();
    return ResponseFactory.ok(user);
  }
}

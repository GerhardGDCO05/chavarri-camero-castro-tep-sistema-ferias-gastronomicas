import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeStatusDto {
  @IsEnum(['pendiente', 'aprobado', 'activo'])
  @IsNotEmpty()
  status: 'pendiente' | 'aprobado' | 'activo';
}
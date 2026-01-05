import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['pendiente', 'preparando', 'listo', 'entregado'])
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado';
}
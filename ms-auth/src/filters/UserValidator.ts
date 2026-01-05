import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseFactory } from '../responses/ResponseFactory.class';

@Catch(BadRequestException)
export class UserValidatorFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;
    const messages: string[] = exceptionResponse.message || [];

    // Mensajes especificos segun el DTO
    const customMessages = messages.map((msg) => {
      if (msg.includes('email must be an email')) {
        return 'El email no tiene un formato válido';
      }
      if (msg.includes('password must be a string')) {
        return 'La contraseña debe ser un texto';
      }
      if (
        msg.includes('password must be longer than or equal to 6 characters')
      ) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
      if (msg.includes('role must be one of the following values')) {
        return 'El rol debe ser uno de: cliente, emprendedor, organizador';
      }
      if (msg.includes('fullName must be a string')) {
        return 'El nombre completo debe ser un texto';
      }
      return msg; // fallback si no coincide
    });

    const res = ResponseFactory.badRequest(null, customMessages.join(', '));
    return response.status(status).json(res);
  }
}

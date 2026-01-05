import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Activa validacion automatica en todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan propiedades extra
      transform: true, // convierte tipos automáticamente
    }),
  );
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' }); // Importante para poder habilitar el versionamiento y que no de 404 ;-;
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

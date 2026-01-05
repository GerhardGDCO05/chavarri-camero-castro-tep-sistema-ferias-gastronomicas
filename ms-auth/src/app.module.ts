import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // Para bd
import { User } from './users/entities/user';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10), // ! para que el compilador no de error
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User], // aquí agregas todas tus entidades
      synchronize: true, // solo en desarrollo, en producción usa migraciones
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

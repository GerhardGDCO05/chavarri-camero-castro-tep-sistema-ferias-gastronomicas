import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/db/db.module';
import { AuthModule } from 'src/auth/auth.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

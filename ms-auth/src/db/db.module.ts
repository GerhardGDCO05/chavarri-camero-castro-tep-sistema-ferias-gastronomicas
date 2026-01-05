import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user';
import { UserDatabase } from './db.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserDatabase],
  exports: [UserDatabase, TypeOrmModule],
})
export class DatabaseModule {}

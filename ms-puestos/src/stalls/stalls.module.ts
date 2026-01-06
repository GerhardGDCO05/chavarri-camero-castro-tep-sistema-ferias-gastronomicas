import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallsService } from './stalls.service';
import { StallsController } from './stalls.controller';
import { Stall } from '../entities/stalls.entity';
import { ApiLog } from '../entities/api-log.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Stall, ApiLog]), HttpModule],
  controllers: [StallsController],
  providers: [StallsService],
  exports: [StallsService],
})
export class StallsModule {}


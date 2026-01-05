import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallsService } from './stalls.service';
import { StallsController } from './stalls.controller';
import { Stall } from '../entities/stalls.entity';
import { ApiLog } from '../entities/api-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stall, ApiLog])],
  controllers: [StallsController],
  providers: [StallsService],
  exports: [StallsService],
})
export class StallsModule {}
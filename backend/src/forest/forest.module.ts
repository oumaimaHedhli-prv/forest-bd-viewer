import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ForestData } from '../entities/forest-data.entity';
import { ForestResolver } from './forest.resolver';
import { ForestService } from './forest.service';

@Module({
  imports: [TypeOrmModule.forFeature([ForestData])],
  providers: [ForestService, ForestResolver],
  exports: [ForestService],
})
export class ForestModule {}

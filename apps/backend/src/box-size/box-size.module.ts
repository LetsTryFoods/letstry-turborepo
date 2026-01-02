import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BoxSize, BoxSizeSchema } from './entities/box-size.entity';

import { BoxSizeCrudService } from './services/core/box-size-crud.service';
import { BoxRecommendationService } from './services/domain/box-recommendation.service';
import { VolumeCalculatorService } from './services/domain/volume-calculator.service';

import { BoxSizeService } from './services/box-size.service';

import { BoxSizeResolver } from './box-size.resolver';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BoxSize.name, schema: BoxSizeSchema }]),
    CommonModule,
  ],
  providers: [
    BoxSizeCrudService,
    BoxRecommendationService,
    VolumeCalculatorService,
    BoxSizeService,
    BoxSizeResolver,
  ],
  exports: [BoxSizeService, BoxRecommendationService],
})
export class BoxSizeModule {}

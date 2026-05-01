import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PillarService } from './pillar.service';
import { PillarResolver } from './pillar.resolver';
import { PillarSchema, PILLAR_MODEL } from './pillar.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PILLAR_MODEL, schema: PillarSchema }]),
  ],
  providers: [PillarService, PillarResolver],
  exports: [PillarService],
})
export class PillarModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkuMaster, SkuMasterSchema } from './sku-master.schema';
import { SkuMasterService } from './sku-master.service';
import { SkuMasterResolver } from './sku-master.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SkuMaster.name, schema: SkuMasterSchema },
    ]),
  ],
  providers: [SkuMasterService, SkuMasterResolver],
  exports: [SkuMasterService],
})
export class SkuMasterModule {}

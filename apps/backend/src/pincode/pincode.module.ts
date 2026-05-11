import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pincode, PincodeSchema } from './pincode.schema';
import { PincodeService } from './pincode.service';
import { PincodeResolver } from './pincode.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pincode.name, schema: PincodeSchema }]),
  ],
  providers: [PincodeService, PincodeResolver],
  exports: [PincodeService],
})
export class PincodeModule {}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pincode, PincodeDocument } from './pincode.schema';
import { PincodeInput, PincodeServiceabilityResult } from './dto/pincode.input';

@Injectable()
export class PincodeService {
  constructor(
    @InjectModel(Pincode.name) private pincodeModel: Model<PincodeDocument>,
  ) {}

  async checkServiceability(pincode: string): Promise<PincodeServiceabilityResult> {
    const records = await this.pincodeModel.find({ pincode }).exec();
    if (records.length === 0) {
      return {
        isDeliverable: false,
      };
    }

    // Return the one with the best (lowest) TAT
    const bestRecord = records.reduce((prev, curr) => (prev.tat < curr.tat ? prev : curr));

    return {
      isDeliverable: true,
      estimatedDays: bestRecord.tat,
      city: bestRecord.city,
      state: bestRecord.state,
    };
  }

  async bulkUpsertPincodes(pincodes: PincodeInput[]): Promise<number> {
    const operations = pincodes.map((pin) => ({
      updateOne: {
        filter: { pincode: pin.pincode, product: pin.product },
        update: { $set: pin },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      const result = await this.pincodeModel.bulkWrite(operations);
      return result.upsertedCount + result.modifiedCount;
    }
    return 0;
  }
}

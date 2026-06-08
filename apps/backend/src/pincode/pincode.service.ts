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

  async checkServiceability(
    pincode: string,
  ): Promise<PincodeServiceabilityResult> {
    const normalizedPincode = pincode.trim();
    const records = await this.pincodeModel
      .find({ pincode: normalizedPincode })
      .exec();
    if (records.length === 0) {
      return {
        isDeliverable: false,
      };
    }

    const getNormalizedProduct = (
      productStr: string,
    ): 'SMART_EXPRESS' | 'PRIORITY' | null => {
      if (!productStr) return null;
      const upper = productStr.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      if (
        upper.includes('SMART_EXPRESS') ||
        upper.includes('SMARTEXPRESS') ||
        (upper.includes('SMART') && upper.includes('EXPRESS'))
      ) {
        return 'SMART_EXPRESS';
      }
      if (upper.includes('PRIORITY')) {
        return 'PRIORITY';
      }
      return null;
    };

    const smartExpressRecord = records.find(
      (r) => getNormalizedProduct(r.product) === 'SMART_EXPRESS',
    );
    const priorityRecord = records.find(
      (r) => getNormalizedProduct(r.product) === 'PRIORITY',
    );

    const smartExpress = smartExpressRecord
      ? {
          isDeliverable: true,
          estimatedDays: smartExpressRecord.tat,
          city: smartExpressRecord.city,
          state: smartExpressRecord.state,
          zone: smartExpressRecord.zone,
        }
      : {
          isDeliverable: false,
        };

    const priority = priorityRecord
      ? {
          isDeliverable: true,
          estimatedDays: priorityRecord.tat,
          city: priorityRecord.city,
          state: priorityRecord.state,
          zone: priorityRecord.zone,
        }
      : {
          isDeliverable: false,
        };

    const fallbackRecord = smartExpressRecord || priorityRecord || records[0];

    return {
      isDeliverable: smartExpress.isDeliverable,
      estimatedDays: smartExpress.estimatedDays,
      city: smartExpress.city || fallbackRecord.city,
      state: smartExpress.state || fallbackRecord.state,
      smartExpress,
      priority,
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

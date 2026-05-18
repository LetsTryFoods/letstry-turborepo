import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SkuMaster, SkuMasterDocument } from './sku-master.schema';

@Injectable()
export class SkuMasterService {
  constructor(
    @InjectModel(SkuMaster.name)
    private readonly skuMasterModel: Model<SkuMasterDocument>,
  ) {}

  /** Return all SKU master records, sorted by masterSku ascending. */
  async findAll(): Promise<SkuMaster[]> {
    return this.skuMasterModel.find().sort({ masterSku: 1 }).lean();
  }

  /** Return a single SKU master record by its MongoDB _id. */
  async findById(id: string): Promise<SkuMaster | null> {
    return this.skuMasterModel.findById(id).lean();
  }

  /** Return a single record by its numeric masterSku value. */
  async findByMasterSku(masterSku: number): Promise<SkuMaster | null> {
    return this.skuMasterModel.findOne({ masterSku }).lean();
  }

  /**
   * Bulk-upsert rows coming from an Excel import.
   * Each row is identified by `masterSku` — if it already exists the
   * document is updated, otherwise a new one is inserted.
   *
   * Returns the number of records processed.
   */
  async bulkUpsert(rows: Partial<SkuMaster>[]): Promise<number> {
    if (!rows.length) return 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: any[] = rows.map((row) => ({
      updateOne: {
        filter: { masterSku: row.masterSku },
        update: { $set: row },
        upsert: true,
      },
    }));

    const result = await this.skuMasterModel.bulkWrite(ops);
    return result.upsertedCount + result.modifiedCount;
  }
}

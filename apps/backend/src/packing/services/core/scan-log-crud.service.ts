import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScanLog } from '../../entities/scan-log.entity';

@Injectable()
export class ScanLogCrudService {
  constructor(
    @InjectModel(ScanLog.name) private scanLogModel: Model<ScanLog>,
  ) { }

  async create(data: Partial<ScanLog>): Promise<ScanLog> {
    const log = new this.scanLogModel(data);
    return log.save();
  }

  async findById(id: string): Promise<ScanLog | null> {
    return this.scanLogModel.findById(id).exec();
  }

  async findAll(filter: any = {}): Promise<ScanLog[]> {
    return this.scanLogModel.find(filter).exec();
  }

  async findByOrder(orderId: string): Promise<ScanLog[]> {
    return this.scanLogModel.find({ packingOrderId: orderId }).exec();
  }

  async findByPacker(packerId: string): Promise<ScanLog[]> {
    return this.scanLogModel.find({ packerId }).exec();
  }

  async countByOrderAndValid(
    orderId: string,
    isValid: boolean,
  ): Promise<number> {
    return this.scanLogModel
      .countDocuments({ packingOrderId: orderId, isValid })
      .exec();
  }

  async countByOrderEanAndValid(
    orderId: string,
    ean: string,
    isValid: boolean,
  ): Promise<number> {
    return this.scanLogModel
      .countDocuments({ packingOrderId: orderId, ean, isValid })
      .exec();
  }

  async hasSuccessfulBatchScan(packingOrderId: string): Promise<boolean> {
    const count = await this.scanLogModel
      .countDocuments({ packingOrderId, isBatchSuccess: true })
      .exec();
    return count > 0;
  }
}

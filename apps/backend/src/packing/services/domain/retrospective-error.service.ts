import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { ScanLogCrudService } from '../core/scan-log-crud.service';
import { PackingOrder } from '../../entities/packing-order.entity';

@Injectable()
export class RetrospectiveErrorService {
  constructor(
    @InjectModel(PackingOrder.name)
    private packingOrderModel: Model<PackingOrder>,
    private readonly packingOrderCrud: PackingOrderCrudService,
    private readonly scanLogCrud: ScanLogCrudService,
  ) {}

  async addRetrospectiveError(orderId: string, errorData: any): Promise<void> {
    await this.packingOrderModel.updateOne(
      { _id: orderId },
      {
        hasErrors: true,
        $push: {
          retrospectiveErrors: {
            errorType: errorData.errorType,
            flaggedAt: new Date(),
            flaggedBy: errorData.flaggedBy,
            notes: errorData.notes,
            severity: errorData.severity,
            source: errorData.source,
          },
        },
      },
    );
  }

  async createRetrospectiveScanLog(
    orderId: string,
    packerId: string,
    errorData: any,
  ): Promise<void> {
    await this.scanLogCrud.create({
      packingOrderId: orderId,
      packerId,
      ean: errorData.ean || 'N/A',
      isValid: false,
      errorType: errorData.errorType,
      scannedAt: new Date(),
      isRetrospective: true,
      retrospectiveNotes: errorData.notes,
      flaggedBy: errorData.flaggedBy,
      flaggedAt: new Date(),
    });
  }
}

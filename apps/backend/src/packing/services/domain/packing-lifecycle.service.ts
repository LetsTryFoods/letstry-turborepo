import { Injectable } from '@nestjs/common';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { PackingStatus } from '../../../common/enums/packing-status.enum';

@Injectable()
export class PackingLifecycleService {
  constructor(private readonly packingOrderCrud: PackingOrderCrudService) {}

  async startPacking(orderId: string): Promise<void> {
    await this.packingOrderCrud.update(orderId, {
      status: PackingStatus.PACKING,
      packingStartedAt: new Date(),
    });
  }

  async completePacking(orderId: string): Promise<void> {
    await this.packingOrderCrud.update(orderId, {
      status: PackingStatus.COMPLETED,
      packingCompletedAt: new Date(),
    });
  }

  async cancelPacking(orderId: string): Promise<void> {
    await this.packingOrderCrud.update(orderId, {
      status: PackingStatus.FAILED,
    });
  }
}

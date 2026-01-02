import { Injectable } from '@nestjs/common';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { PackingStatus } from '../../../common/enums/packing-status.enum';

@Injectable()
export class OrderAssignmentService {
  constructor(private readonly packingOrderCrud: PackingOrderCrudService) {}

  async assignOrder(orderId: string, packerId: string): Promise<void> {
    await this.packingOrderCrud.update(orderId, {
      assignedTo: packerId,
      assignedAt: new Date(),
      status: PackingStatus.ASSIGNED,
    });
  }

  async validateAssignment(
    orderId: string,
    packerId: string,
  ): Promise<boolean> {
    const order = await this.packingOrderCrud.findById(orderId);
    return !order?.assignedTo || order.assignedTo === packerId;
  }

  async updateAssignmentStatus(orderId: string, status: string): Promise<void> {
    await this.packingOrderCrud.update(orderId, { status: status as PackingStatus });
  }
}

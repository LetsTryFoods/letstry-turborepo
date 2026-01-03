import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { PackingStatus } from '../../entities/packing-order.entity';
import { PackingLoggerService } from './packing-logger.service';

@Injectable()
export class ReassignmentService {
  constructor(
    private packingOrderCrud: PackingOrderCrudService,
    private configService: ConfigService,
    private packingLogger: PackingLoggerService,
  ) {}

  async findStaleOrders(): Promise<any[]> {
    const packingConfig = this.configService.get('packing');
    const now = Date.now();

    const acceptTimeout = new Date(
      now - packingConfig.acceptTimeoutHours * 3600000,
    );
    const completeTimeout = new Date(
      now - packingConfig.completeTimeoutMinutes * 60000,
    );

    const staleAssigned = await this.packingOrderCrud.findAll({
      status: PackingStatus.ASSIGNED,
      assignedAt: { $lt: acceptTimeout },
    });

    const stalePacking = await this.packingOrderCrud.findAll({
      status: PackingStatus.PACKING,
      packingStartedAt: { $lt: completeTimeout },
    });

    const allStale = [...staleAssigned, ...stalePacking];

    this.packingLogger.logReassignmentCheck(allStale.length);

    return allStale;
  }

  async resetPackingOrder(packingOrderId: string): Promise<void> {
    await this.packingOrderCrud.update(packingOrderId, {
      status: PackingStatus.ASSIGNED,
      packingStartedAt: undefined,
    });
  }

  getReassignmentReason(order: any): string {
    if (order.status === PackingStatus.ASSIGNED) {
      return 'ACCEPT_TIMEOUT';
    }
    if (order.status === PackingStatus.PACKING) {
      return 'COMPLETE_TIMEOUT';
    }
    return 'MANUAL';
  }
}

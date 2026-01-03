import { Injectable } from '@nestjs/common';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { ScanLogCrudService } from '../core/scan-log-crud.service';

@Injectable()
export class PackerStatsService {
  constructor(
    private readonly packingOrderCrud: PackingOrderCrudService,
    private readonly scanLogCrud: ScanLogCrudService,
  ) {}

  async calculateAccuracyRate(
    packerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const orders = await this.packingOrderCrud.findByPacker(packerId);
    const filteredOrders = this.filterByDate(orders, startDate, endDate);

    const totalOrders = filteredOrders.length;
    const errorOrders = filteredOrders.filter(
      (order) => order.hasErrors || order.retrospectiveErrors?.length,
    ).length;

    return totalOrders > 0
      ? ((totalOrders - errorOrders) / totalOrders) * 100
      : 0;
  }

  async calculateAveragePackTime(
    packerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const orders = await this.packingOrderCrud.findByPacker(packerId);
    const completedOrders = this.filterByDate(
      orders,
      startDate,
      endDate,
    ).filter((order) => order.packingStartedAt && order.packingCompletedAt);

    if (completedOrders.length === 0) return 0;

    const totalMinutes = completedOrders.reduce((sum, order) => {
      const duration =
        order.packingCompletedAt!.getTime() - order.packingStartedAt!.getTime();
      return sum + duration / (1000 * 60);
    }, 0);

    return totalMinutes / completedOrders.length;
  }

  async calculateErrorsByType(
    packerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const logs = await this.scanLogCrud.findByPacker(packerId);
    const filteredLogs = this.filterLogsByDate(logs, startDate, endDate);

    const errorLogs = filteredLogs.filter((log) => !log.isValid);

    const errorMap = new Map<string, number>();
    errorLogs.forEach((log) => {
      const count = errorMap.get(log.errorType) || 0;
      errorMap.set(log.errorType, count + 1);
    });

    return Array.from(errorMap.entries()).map(([errorType, count]) => ({
      errorType,
      count,
    }));
  }

  private filterByDate(orders: any[], startDate?: Date, endDate?: Date): any[] {
    if (!startDate && !endDate) return orders;
    return orders.filter((order) => {
      const completedAt = order.packingCompletedAt;
      if (!completedAt) return false;
      if (startDate && completedAt < startDate) return false;
      if (endDate && completedAt > endDate) return false;
      return true;
    });
  }

  private filterLogsByDate(
    logs: any[],
    startDate?: Date,
    endDate?: Date,
  ): any[] {
    if (!startDate && !endDate) return logs;
    return logs.filter((log) => {
      const scannedAt = log.scannedAt;
      if (startDate && scannedAt < startDate) return false;
      if (endDate && scannedAt > endDate) return false;
      return true;
    });
  }
}

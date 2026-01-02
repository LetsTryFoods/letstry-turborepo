import { Injectable } from '@nestjs/common';
import { PackerCrudService } from './core/packer-crud.service';
import { PackerAuthService } from './domain/packer-auth.service';
import { PackerStatsService } from './domain/packer-stats.service';
import { RetrospectiveErrorService } from './domain/retrospective-error.service';
import { PackingOrderCrudService } from './core/packing-order-crud.service';

@Injectable()
export class PackerService {
  constructor(
    private readonly packerCrud: PackerCrudService,
    private readonly packerAuth: PackerAuthService,
    private readonly packerStats: PackerStatsService,
    private readonly retrospectiveError: RetrospectiveErrorService,
    private readonly packingOrderCrud: PackingOrderCrudService,
  ) {}

  async createPacker(input: any): Promise<any> {
    const passwordHash = await this.packerAuth.hashPassword(input.password);
    return this.packerCrud.create({
      ...input,
      passwordHash,
      status: 'offline',
    });
  }

  async updatePacker(packerId: string, input: any): Promise<any> {
    return this.packerCrud.update(packerId, input);
  }

  async deletePacker(packerId: string): Promise<any> {
    return this.packerCrud.delete(packerId);
  }

  async getAllPackers(filters: any): Promise<any[]> {
    return this.packerCrud.findAll(filters);
  }

  async getPackerById(packerId: string): Promise<any> {
    return this.packerCrud.findById(packerId);
  }

  async login(employeeId: string, password: string): Promise<any> {
    const packer = await this.packerAuth.validateCredentials(
      employeeId,
      password,
    );
    if (!packer) throw new Error('Invalid credentials');

    const token = await this.packerAuth.generateToken(packer);
    return { token, packer };
  }

  async getPackerStats(packerId: string, dateRange?: any): Promise<any> {
    const packer = await this.packerCrud.findById(packerId);
    if (!packer) {
      throw new Error('Packer not found');
    }
    const accuracyRate = await this.packerStats.calculateAccuracyRate(
      packerId,
      dateRange?.startDate,
      dateRange?.endDate,
    );
    const averagePackTime = await this.packerStats.calculateAveragePackTime(
      packerId,
      dateRange?.startDate,
      dateRange?.endDate,
    );
    const errorsByType = await this.packerStats.calculateErrorsByType(
      packerId,
      dateRange?.startDate,
      dateRange?.endDate,
    );
    const ordersPackedToday = await this.getOrdersPackedToday(packerId);

    return {
      packerId,
      totalOrders: packer.totalOrdersPacked,
      accuracyRate,
      averagePackTime,
      errorsByType,
      ordersPackedToday,
    };
  }

  async flagRetrospectiveError(input: any): Promise<any> {
    const order = await this.packingOrderCrud.findById(input.packingOrderId);
    if (!order) {
      throw new Error('Order not found');
    }
    await this.retrospectiveError.addRetrospectiveError(
      input.packingOrderId,
      input,
    );
    await this.retrospectiveError.createRetrospectiveScanLog(
      input.packingOrderId,
      order.assignedTo,
      input,
    );
    return this.packingOrderCrud.findById(input.packingOrderId);
  }

  private async getOrdersPackedToday(packerId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await this.packingOrderCrud.findByPacker(packerId);
    return orders.filter(
      (order) =>
        order.packingCompletedAt &&
        order.packingCompletedAt >= today &&
        order.packingCompletedAt < tomorrow,
    ).length;
  }
}

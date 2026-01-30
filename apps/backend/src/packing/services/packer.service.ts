import { Injectable } from '@nestjs/common';
import { PackerCrudService } from './core/packer-crud.service';
import { PackerAuthService } from './domain/packer-auth.service';
import { PackerStatsService } from './domain/packer-stats.service';
import { RetrospectiveErrorService } from './domain/retrospective-error.service';
import { PackingOrderCrudService } from './core/packing-order-crud.service';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';
import { PackingQueueService } from './domain/packing-queue.service';

@Injectable()
export class PackerService {
  constructor(
    private readonly packerCrud: PackerCrudService,
    private readonly packerAuth: PackerAuthService,
    private readonly packerStats: PackerStatsService,
    private readonly retrospectiveError: RetrospectiveErrorService,
    private readonly packingOrderCrud: PackingOrderCrudService,
    private readonly whatsAppService: WhatsAppService,
    private readonly packingQueueService: PackingQueueService,
  ) { }

  async createPacker(input: any): Promise<any> {
    const password = this.generateRandomPassword();
    const passwordHash = await this.packerAuth.hashPassword(password);
    const packer = await this.packerCrud.create({
      ...input,
      passwordHash,
      status: 'offline',
      accuracyRate: 0,
      averagePackTime: 0,
      totalOrdersPacked: 0,
    });

    await this.whatsAppService.sendPackerCredentials(
      input.phone,
      input.employeeId,
      password,
    );

    await this.packingQueueService.processReassignment();

    return {
      packer,
      generatedPassword: password,
    };
  }

  async updatePacker(packerId: string, input: any): Promise<any> {
    const updatedPacker = await this.packerCrud.update(packerId, input);

    if (input.isActive === true || input.status === 'online' || input.status === 'idle') {
      await this.packingQueueService.processReassignment();
    }

    return updatedPacker;
  }

  async deletePacker(packerId: string): Promise<boolean> {
    await this.packerCrud.delete(packerId);
    return true;
  }

  async getAllPackers(filters: any): Promise<any[]> {
    const packers = await this.packerCrud.findAll(filters);

    const packersWithStats = await Promise.all(
      packers.map(async (packer: any) => {
        const accuracyRate = await this.packerStats.calculateAccuracyRate(packer._id.toString());
        const averagePackTime = await this.packerStats.calculateAveragePackTime(packer._id.toString());

        const orders = await this.packingOrderCrud.findByPacker(packer._id.toString());
        const assignedOrders = orders.filter((o: any) => o.status === 'assigned').length;
        const inProgressOrders = orders.filter((o: any) => o.status === 'packing').length;
        const completedOrders = orders.filter((o: any) => o.status === 'completed').length;

        return {
          ...packer.toObject(),
          accuracyRate,
          averagePackTime,
          assignedOrders,
          inProgressOrders,
          completedOrders,
        };
      })
    );

    return packersWithStats;
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

    const accessToken = await this.packerAuth.generateToken(packer);
    return { accessToken, packer };
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

  private generateRandomPassword(): string {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
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

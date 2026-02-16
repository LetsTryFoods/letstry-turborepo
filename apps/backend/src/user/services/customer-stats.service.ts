import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Identity,
  IdentityDocument,
  IdentityStatus,
} from '../../common/schemas/identity.schema';
import { Role } from '../../common/enums/role.enum';
import { Order } from '../../order/order.schema';
import { CustomerPlatform } from '../user.input';
import { CustomerSummary, PlatformStats, StatusStats } from '../user.graphql';

@Injectable()
export class CustomerStatsService {
  constructor(
    @InjectModel(Identity.name) private identityModel: Model<IdentityDocument>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) { }

  async getCustomerSummary(): Promise<CustomerSummary> {
    const [platformStats, statusStats, totalCounts, revenue, newUsers] =
      await Promise.all([
        this.getPlatformStats(),
        this.getStatusStats(),
        this.getTotalCounts(),
        this.getTotalRevenue(),
        this.getNewUsersThisMonth(),
      ]);

    return {
      totalCustomers: totalCounts.total,
      totalGuests: totalCounts.guests,
      totalRegistered: totalCounts.registered,
      totalRevenue: revenue,
      newThisMonth: newUsers,
      platformStats,
      statusStats,
    };
  }

  async getPlatformStats(): Promise<PlatformStats> {
    const baseFilter = { role: { $in: [Role.USER, Role.GUEST] } };

    const [android, ios, web, macos, desktop, linux, windows] = await Promise.all([
      this.countByPlatform(baseFilter, CustomerPlatform.ANDROID),
      this.countByPlatform(baseFilter, CustomerPlatform.IOS),
      this.countByPlatform(baseFilter, CustomerPlatform.WEB),
      this.countByPlatform(baseFilter, CustomerPlatform.MACOS),
      this.countByPlatform(baseFilter, CustomerPlatform.DESKTOP),
      this.countByPlatform(baseFilter, CustomerPlatform.LINUX),
      this.countByPlatform(baseFilter, CustomerPlatform.WINDOWS),
    ]);

    return { android, ios, web, macos, desktop, linux, windows };
  }

  async countByPlatform(
    baseFilter: any,
    platform: CustomerPlatform,
  ): Promise<number> {
    return this.identityModel
      .countDocuments({
        ...baseFilter,
        'signupSource.platform': platform,
      })
      .exec();
  }

  async getStatusStats(): Promise<StatusStats> {
    const baseFilter = { role: { $in: [Role.USER, Role.GUEST] } };

    const [guest, registered, verified, active, suspended] = await Promise.all([
      this.countByStatus(baseFilter, IdentityStatus.GUEST),
      this.countByStatus(baseFilter, IdentityStatus.REGISTERED),
      this.countByStatus(baseFilter, IdentityStatus.VERIFIED),
      this.countByStatus(baseFilter, IdentityStatus.ACTIVE),
      this.countByStatus(baseFilter, IdentityStatus.SUSPENDED),
    ]);

    return { guest, registered, verified, active, suspended };
  }

  async countByStatus(
    baseFilter: any,
    status: IdentityStatus,
  ): Promise<number> {
    return this.identityModel
      .countDocuments({
        ...baseFilter,
        status,
      })
      .exec();
  }

  async getTotalCounts(): Promise<{
    total: number;
    guests: number;
    registered: number;
  }> {
    const baseFilter = { role: { $in: [Role.USER, Role.GUEST] } };

    const [total, guests, registered] = await Promise.all([
      this.identityModel.countDocuments(baseFilter).exec(),
      this.identityModel
        .countDocuments({ ...baseFilter, status: IdentityStatus.GUEST })
        .exec(),
      this.identityModel
        .countDocuments({
          ...baseFilter,
          status: {
            $in: [
              IdentityStatus.REGISTERED,
              IdentityStatus.VERIFIED,
              IdentityStatus.ACTIVE,
            ],
          },
        })
        .exec(),
    ]);

    return { total, guests, registered };
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$totalAmount' } },
        },
      },
    ]);

    return result.length > 0 ? Math.round(result[0].total) : 0;
  }

  async getNewUsersThisMonth(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.identityModel
      .countDocuments({
        role: { $in: [Role.USER, Role.GUEST] },
        createdAt: { $gte: startOfMonth },
      })
      .exec();
  }
}

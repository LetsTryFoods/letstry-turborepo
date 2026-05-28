import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '../order.schema';
import { OrderRepository } from './order.repository';
import { GetAllOrdersInput } from '../order.input';
import {
  AdminOrdersResponse,
  OrderWithUserInfo,
  OrdersSummary,
  OrderStatusCount,
} from '../order.graphql';
import {
  OrderReportResponse,
  ReportSummaryType,
} from '../order-report.graphql';
import { PaginationMeta } from '../../common/pagination';
import {
  Identity,
  IdentityDocument,
} from '../../common/schemas/identity.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OrderQueryService {
  constructor(
    private orderRepository: OrderRepository,
    @InjectModel(Identity.name) private identityModel: Model<IdentityDocument>,
  ) { }

  async getOrderReports(period: string): Promise<OrderReportResponse> {
    const { startDate, endDate, prevStartDate, prevEndDate } = this.getDateRange(period);

    const [
      summary,
      prevSummary,
      dailySales,
      topProducts,
      topCustomers,
      categorySales,
      platformStats
    ] = await Promise.all([
      this.orderRepository.getSummaryStats(startDate, endDate),
      this.orderRepository.getSummaryStats(prevStartDate, prevEndDate),
      this.orderRepository.getDailySales(startDate, endDate),
      this.orderRepository.getTopProducts(startDate, endDate, period === 'all' ? 0 : 50),
      this.orderRepository.getTopCustomers(startDate, endDate),
      this.orderRepository.getCategorySales(startDate, endDate),
      this.orderRepository.getPlatformOrderStats(startDate, endDate),
    ]);

    const totalRevenue = summary.totalRevenue || 0;
    const totalOrders = summary.totalOrders || 0;
    const totalCustomers = summary.totalCustomers || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const prevRevenue = prevSummary.totalRevenue || 0;
    const prevOrders = prevSummary.totalOrders || 0;
    const prevCustomers = prevSummary.totalCustomers || 0;

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;
    const customersGrowth = prevCustomers > 0 ? ((totalCustomers - prevCustomers) / prevCustomers) * 100 : 0;

    const totalCategoryRevenue = categorySales.reduce((sum, c) => sum + c.revenue, 0);
    const categorySalesWithPercentage = categorySales.map(c => ({
      ...c,
      percentage: totalCategoryRevenue > 0 ? (c.revenue / totalCategoryRevenue) * 100 : 0
    }));

    return {
      summary: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        avgOrderValue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
        customersGrowth: Math.round(customersGrowth * 10) / 10,
      },
      dailySales,
      topProducts,
      topCustomers,
      categorySales: categorySalesWithPercentage,
      platformStats,
    };
  }

  private getDateRange(period: string) {
    const endDate = new Date();
    const startDate = new Date();
    const prevEndDate = new Date();
    const prevStartDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        prevEndDate.setDate(startDate.getDate() - 1);
        prevStartDate.setDate(prevEndDate.getDate() - 7);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        prevEndDate.setDate(startDate.getDate() - 1);
        prevStartDate.setMonth(prevEndDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        prevEndDate.setDate(startDate.getDate() - 1);
        prevStartDate.setFullYear(prevEndDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2000, 0, 1);
        prevEndDate.setFullYear(1999, 11, 31);
        prevStartDate.setFullYear(1900, 0, 1);
        break;
      case 'month':
      default:
        startDate.setMonth(endDate.getMonth() - 1);
        prevEndDate.setDate(startDate.getDate() - 1);
        prevStartDate.setMonth(prevEndDate.getMonth() - 1);
        break;
    }

    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.orderRepository.findById(orderId);
  }

  async getOrderByInternalId(id: string): Promise<Order | null> {
    return this.orderRepository.findByInternalId(id);
  }

  async getOrderByPaymentOrderId(
    paymentOrderId: string,
  ): Promise<Order | null> {
    return this.orderRepository.findByPaymentOrderId(paymentOrderId);
  }

  async getOrdersByIdentity(params: {
    identityId: string;
    mergedGuestIds?: string[];
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }): Promise<{ orders: Order[]; meta: PaginationMeta }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const allIdentityIds = [
      params.identityId,
      ...(params.mergedGuestIds || []),
    ].filter(id => id && id.trim() !== '');

    const [orders, total] = await Promise.all([
      this.orderRepository.findByIdentityIds(
        allIdentityIds,
        params.status,
        skip,
        limit,
      ),
      this.orderRepository.countByIdentityIds(allIdentityIds, params.status),
    ]);

    return {
      orders,
      meta: this.buildPaginationMeta(total, page, limit),
    };
  }

  async getAllOrdersForAdmin(
    input: GetAllOrdersInput,
  ): Promise<AdminOrdersResponse> {
    const filter = this.buildAdminOrderFilter(input);
    const page = input.page || 1;
    const limit = input.limit || 10;
    const skip = (page - 1) * limit;

    const [orders, totalCount, summary] = await Promise.all([
      this.orderRepository.findAll(filter, skip, limit, input.userSearch),
      this.orderRepository.countAll(filter, input.userSearch),
      this.getOrdersSummary(filter),
    ]);

    const ordersWithUserInfo = await this.enrichOrdersWithUserInfo(orders);
    const meta = this.buildPaginationMeta(totalCount, page, limit);

    return { orders: ordersWithUserInfo, meta, summary };
  }

  private buildAdminOrderFilter(input: GetAllOrdersInput): any {
    const filter: any = {};

    if (input.startDate || input.endDate) {
      filter.createdAt = {};
      if (input.startDate) {
        filter.createdAt.$gte = input.startDate;
      }
      if (input.endDate) {
        filter.createdAt.$lte = input.endDate;
      }
    }

    if (input.status) {
      filter.orderStatus = input.status;
    }

    return filter;
  }

  private async enrichOrdersWithUserInfo(
    orders: Order[],
  ): Promise<OrderWithUserInfo[]> {
    const identityIds = [
      ...new Set(
        orders
          .filter((order) => order.identityId)
          .map((order) => order.identityId.toString())
      ),
    ];
    const identities = await this.fetchIdentitiesByIds(identityIds);
    const identityMap = this.createIdentityMap(identities);

    return orders.map((order) => this.mapOrderWithUserInfo(order, identityMap));
  }

  private async fetchIdentitiesByIds(
    identityIds: string[],
  ): Promise<IdentityDocument[]> {
    return this.identityModel.find({ _id: { $in: identityIds } }).exec();
  }

  private createIdentityMap(
    identities: IdentityDocument[],
  ): Map<string, IdentityDocument> {
    return new Map(
      identities.map((identity) => [identity._id.toString(), identity]),
    );
  }

  private mapOrderWithUserInfo(
    order: Order,
    identityMap: Map<string, IdentityDocument>,
  ): OrderWithUserInfo {
    const identity = order.identityId
      ? identityMap.get(order.identityId.toString())
      : undefined;
    const orderObj = order.toObject ? order.toObject() : order;

    return {
      ...orderObj,
      userInfo: identity ? this.mapToOrderUserInfo(identity) : undefined,
    };
  }

  private mapToOrderUserInfo(identity: IdentityDocument) {
    return {
      identityId: identity._id.toString(),
      phoneNumber: identity.phoneNumber,
      email: identity.email,
      firstName: identity.firstName,
      lastName: identity.lastName,
      status: identity.status,
      deviceInfo: identity.deviceInfo,
    };
  }

  private async getOrdersSummary(filter: any = {}): Promise<OrdersSummary> {
    const [totalOrders, statusCounts, totalRevenue, platformStats] = await Promise.all([
      this.orderRepository.countTotal(filter),
      this.getStatusCounts(filter),
      this.calculateTotalRevenue(filter),
      this.orderRepository.getPlatformStatsForFilter(filter),
    ]);

    return { 
      totalOrders, 
      statusCounts, 
      totalRevenue,
      ...platformStats
    };
  }

  private async calculateTotalRevenue(filter: any = {}): Promise<string> {
    return this.orderRepository.sumTotalRevenue(filter);
  }

  private async getStatusCounts(filter: any = {}): Promise<OrderStatusCount> {
    const [confirmed, packed, shipped, inTransit, delivered, shipmentFailed] = await Promise.all([
      this.orderRepository.countByStatus(OrderStatus.CONFIRMED, filter),
      this.orderRepository.countByStatus(OrderStatus.PACKED, filter),
      this.orderRepository.countByStatus(OrderStatus.SHIPPED, filter),
      this.orderRepository.countByStatus(OrderStatus.IN_TRANSIT, filter),
      this.orderRepository.countByStatus(OrderStatus.DELIVERED, filter),
      this.orderRepository.countByStatus(OrderStatus.SHIPMENT_FAILED, filter),
    ]);

    return {
      confirmed,
      packed,
      shipped,
      inTransit,
      delivered,
      shipmentFailed,
    };
  }

  private buildPaginationMeta(
    total: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      totalCount: total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getShippingInsights(): Promise<{
    avgWeight: number;
    mostUsedBox?: string;
    maxDeliveryDays: number;
    avgDeliveryDays: number;
  }> {
    return this.orderRepository.getShippingInsights();
  }
}

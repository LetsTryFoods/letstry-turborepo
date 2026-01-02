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
  ) {}

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.orderRepository.findById(orderId);
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
    ];

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
      this.orderRepository.findAll(filter, skip, limit),
      this.orderRepository.countAll(filter),
      this.getOrdersSummary(),
    ]);

    const ordersWithUserInfo = await this.enrichOrdersWithUserInfo(orders);
    const meta = this.buildPaginationMeta(totalCount, page, limit);

    return { orders: ordersWithUserInfo, meta, summary };
  }

  private buildAdminOrderFilter(input: GetAllOrdersInput): any {
    const filter: any = {};

    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 2);
    defaultStartDate.setHours(0, 0, 0, 0);

    const startDate = input.startDate || defaultStartDate;
    const endDate = input.endDate || new Date();

    filter.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };

    if (input.status) {
      filter.orderStatus = input.status;
    }

    return filter;
  }

  private async enrichOrdersWithUserInfo(
    orders: Order[],
  ): Promise<OrderWithUserInfo[]> {
    const identityIds = [
      ...new Set(orders.map((order) => order.identityId.toString())),
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
    const identity = identityMap.get(order.identityId.toString());
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
    };
  }

  private async getOrdersSummary(): Promise<OrdersSummary> {
    const [totalOrders, statusCounts] = await Promise.all([
      this.orderRepository.countTotal(),
      this.getStatusCounts(),
    ]);

    return { totalOrders, statusCounts };
  }

  private async getStatusCounts(): Promise<OrderStatusCount> {
    const [
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      refunded,
    ] = await Promise.all([
      this.orderRepository.countByStatus(OrderStatus.PENDING),
      this.orderRepository.countByStatus(OrderStatus.CONFIRMED),
      this.orderRepository.countByStatus(OrderStatus.PROCESSING),
      this.orderRepository.countByStatus(OrderStatus.SHIPPED),
      this.orderRepository.countByStatus(OrderStatus.DELIVERED),
      this.orderRepository.countByStatus(OrderStatus.CANCELLED),
      this.orderRepository.countByStatus(OrderStatus.REFUNDED),
    ]);

    return {
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      refunded,
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
}

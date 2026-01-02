import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from './order.schema';
import { GetAllOrdersInput } from './order.input';
import {
  AdminOrdersResponse,
  OrderWithUserInfo,
  OrdersSummary,
  OrderStatusCount,
  OrderUserInfo,
} from './order.graphql';
import { PaginationMeta } from '../common/pagination';
import { OrderRepository } from './services/order.repository';
import { OrderQueryService } from './services/order.query-service';
import { OrderCommandService } from './services/order.command-service';
import { OrderItemService } from './services/order.item-service';

@Injectable()
export class OrderService {
  private readonly queryService: OrderQueryService;
  private readonly commandService: OrderCommandService;
  private readonly itemService: OrderItemService;

  constructor(
    orderRepository: OrderRepository,
    orderQueryService: OrderQueryService,
    orderCommandService: OrderCommandService,
    orderItemService: OrderItemService,
  ) {
    this.queryService = orderQueryService;
    this.commandService = orderCommandService;
    this.itemService = orderItemService;
  }

  async createOrder(params: {
    identityId: string;
    paymentOrderId: string;
    cartId: string;
    totalAmount: string;
    currency: string;
    shippingAddressId?: string;
    placerContact?: {
      phone?: string;
      email?: string;
    };
    recipientContact: {
      phone: string;
      email?: string;
    };
    items: Array<{
      itemId: string;
      quantity: number;
    }>;
  }): Promise<Order> {
    return this.commandService.createOrder(params);
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.queryService.getOrderById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    return this.itemService.populateOrderItems(order);
  }

  async getOrdersByIdentity(params: {
    identityId: string;
    mergedGuestIds?: string[];
    userPhone?: string;
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }): Promise<{ orders: Order[]; meta: PaginationMeta }> {
    const result = await this.queryService.getOrdersByIdentity(params);

    const populatedOrders = await Promise.all(
      result.orders.map((order) => this.itemService.populateOrderItems(order)),
    );

    return {
      orders: populatedOrders,
      meta: result.meta,
    };
  }

  async getAllOrdersForAdmin(
    input: GetAllOrdersInput,
  ): Promise<AdminOrdersResponse> {
    return this.queryService.getAllOrdersForAdmin(input);
  }

  async cancelOrder(params: {
    orderId: string;
    reason: string;
  }): Promise<Order> {
    return this.commandService.cancelOrder(params);
  }

  async updateOrderStatus(params: {
    orderId: string;
    status: OrderStatus;
    trackingNumber?: string;
  }): Promise<Order> {
    return this.commandService.updateOrderStatus(params);
  }

  async getOrderByPaymentOrderId(
    paymentOrderId: string,
  ): Promise<Order | null> {
    return this.queryService.getOrderByPaymentOrderId(paymentOrderId);
  }
}

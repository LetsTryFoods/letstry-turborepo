import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './order.schema';
import { GetAllOrdersInput } from './order.input';
import {
  AdminOrdersResponse,
  OrderWithUserInfo,
  OrdersSummary,
  OrderStatusCount,
  OrderUserInfo,
  OrderPaymentType,
  OrderShippingAddressType,
  OrderCustomerType,
} from './order.graphql';
import { PaginationMeta } from '../common/pagination';
import { OrderRepository } from './services/order.repository';
import { OrderQueryService } from './services/order.query-service';
import { OrderCommandService } from './services/order.command-service';
import { OrderItemService } from './services/order.item-service';
import { PaymentOrder } from '../payment/entities/payment.schema';
import { Address, AddressDocument } from '../address/address.schema';
import {
  Identity,
  IdentityDocument,
} from '../common/schemas/identity.schema';

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
    @InjectModel(PaymentOrder.name)
    private paymentOrderModel: Model<PaymentOrder>,
    @InjectModel(Address.name)
    private addressModel: Model<AddressDocument>,
    @InjectModel(Identity.name)
    private identityModel: Model<IdentityDocument>,
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
      variantId: string;
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

  async resolvePayment(order: any): Promise<OrderPaymentType | null> {
    if (!order.paymentOrderId) {
      return null;
    }
    const payment = await this.paymentOrderModel
      .findById(order.paymentOrderId)
      .exec();
    if (!payment) {
      return null;
    }
    return {
      _id: payment._id.toString(),
      status: payment.paymentOrderStatus,
      method: payment.paymentMethod?.toString(),
      transactionId: payment.pspTxnId || payment.bankTxnId,
      amount: payment.amount,
      paidAt: payment.completedAt,
    };
  }

  async resolveShippingAddress(
    order: any,
  ): Promise<OrderShippingAddressType | null> {
    if (!order.shippingAddressId) {
      return null;
    }
    const address = await this.addressModel
      .findById(order.shippingAddressId)
      .exec();
    if (!address) {
      return null;
    }
    return {
      fullName: address.recipientName,
      phone: address.recipientPhone,
      addressLine1: address.buildingName,
      addressLine2: address.streetArea || address.floor,
      city: address.addressLocality,
      state: address.addressRegion,
      pincode: address.postalCode,
      landmark: address.landmark,
    };
  }

  async resolveCustomer(order: any): Promise<OrderCustomerType | null> {
    if (!order.identityId) {
      return null;
    }
    const identity = await this.identityModel
      .findById(order.identityId)
      .exec();
    if (!identity) {
      return null;
    }
    const name =
      identity.firstName && identity.lastName
        ? `${identity.firstName} ${identity.lastName}`
        : identity.firstName || identity.lastName || 'Customer';
    return {
      _id: identity._id.toString(),
      name,
      email: identity.email,
      phone: identity.phoneNumber,
    };
  }

  async resolveItems(order: any): Promise<any[]> {
    return this.itemService.populateItemsOnly(order.items);
  }
}

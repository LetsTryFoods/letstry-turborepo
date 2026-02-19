import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
import { PaymentOrder, PaymentEvent } from '../payment/entities/payment.schema';
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
  private readonly logger = new Logger(OrderService.name);

  constructor(
    orderRepository: OrderRepository,
    orderQueryService: OrderQueryService,
    orderCommandService: OrderCommandService,
    orderItemService: OrderItemService,
    @InjectModel(PaymentOrder.name)
    private paymentOrderModel: Model<PaymentOrder>,
    @InjectModel(PaymentEvent.name)
    private paymentEventModel: Model<PaymentEvent>,
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
    identityId: Types.ObjectId;
    paymentOrderId: string;
    paymentOrder?: Types.ObjectId;
    cartId: Types.ObjectId;
    totalAmount: string;
    currency: string;
    shippingAddressId?: Types.ObjectId;
    placerContact?: {
      phone?: string;
      email?: string;
    };
    recipientContact: {
      phone: string;
      email?: string;
    };
    items: Array<{
      productId: Types.ObjectId;
      variantId: Types.ObjectId;
      quantity: number;
      price: string;
      totalPrice: string;
      name: string;
      sku: string;
      variant?: string;
      image?: string;
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

  async getOrderByInternalId(id: string): Promise<Order> {
    const order = await this.queryService.getOrderByInternalId(id);

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
    const paymentOrderId = order.paymentOrder || order.paymentOrderId;
    if (!paymentOrderId) {
      return null;
    }

    // Try finding by internal ID if it looks like one, otherwise fallback to string lookup
    let payment;
    if (Types.ObjectId.isValid(paymentOrderId.toString())) {
      payment = await this.paymentOrderModel.findById(paymentOrderId).exec();
    }

    if (!payment) {
      payment = await this.paymentOrderModel
        .findOne({ paymentOrderId: paymentOrderId.toString() })
        .exec();
    }

    if (!payment) {
      return null;
    }

    let handlingCharge: number | undefined;
    if (payment.paymentEventId) {
      const paymentEvent = await this.paymentEventModel.findById(payment.paymentEventId).exec();
      handlingCharge = paymentEvent?.cartSnapshot?.totals?.handlingCharge;
    }

    return {
      _id: payment._id.toString(),
      status: payment.paymentOrderStatus,
      method: payment.paymentMethod?.toString(),
      transactionId: payment.pspTxnId || payment.bankTxnId,
      amount: payment.amount,
      paidAt: payment.completedAt,
      handlingCharge,
    };
  }

  async resolveShippingAddress(
    order: any,
  ): Promise<OrderShippingAddressType | null> {
    this.logger.log('Resolving Shipping Address', {
      orderId: order.orderId,
      shippingAddressId: order.shippingAddressId,
      hasRecipientContact: !!order.recipientContact,
    });

    let address: any = null;
    if (order.shippingAddressId) {
      address = await this.addressModel
        .findById(order.shippingAddressId)
        .exec();
    }

    if (address) {
      return {
        fullName: address.recipientName,
        phone: address.recipientPhone,
        addressType: address.addressType,
        addressLine1: address.buildingName,
        addressLine2: address.streetArea,
        floor: address.floor,
        city: address.addressLocality,
        state: address.addressRegion,
        pincode: address.postalCode,
        landmark: address.landmark,
        formattedAddress: address.formattedAddress,
        latitude: address.latitude,
        longitude: address.longitude,
      };
    }

    if (order.recipientContact) {
      this.logger.log('Using Fallback Shipping Address', {
        orderId: order.orderId,
        reason: 'No shippingAddressId, using recipientContact fallback',
      });
      return {
        fullName: 'Customer',
        phone: order.recipientContact.phone || 'N/A',
        addressLine1: 'N/A',
        addressLine2: 'N/A',
        city: 'N/A',
        state: 'N/A',
        pincode: 'N/A',
        landmark: 'N/A',
      };
    }

    return null;
  }

  async resolveCustomer(order: any): Promise<OrderCustomerType | null> {
    let identity: any = null;
    if (order.identityId) {
      identity = await this.identityModel.findById(order.identityId).exec();
    }

    const customerName =
      identity?.firstName && identity?.lastName
        ? `${identity.firstName} ${identity.lastName}`
        : identity?.firstName || identity?.lastName || 'Customer';

    return {
      _id: identity?._id?.toString() || order.identityId?.toString() || 'N/A',
      name: customerName,
      email: identity?.email || order.placerContact?.email,
      phone: identity?.phoneNumber || order.placerContact?.phone,
    };
  }

  async resolveItems(order: any): Promise<any[]> {
    this.logger.log('Resolving Order Items', {
      orderId: order.orderId,
      itemCount: order.items?.length || 0,
      hasItemNames: order.items?.[0]?.name ? true : false,
    });

    if (order.items && order.items.length > 0 && order.items[0].name) {
      return order.items;
    }
    return this.itemService.populateItemsOnly(order.items);
  }

}

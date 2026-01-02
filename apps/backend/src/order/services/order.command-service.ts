import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Order, OrderStatus } from '../order.schema';
import { OrderRepository } from './order.repository';
import { PaymentLoggerService } from '../../common/services/payment-logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderCommandService {
  constructor(
    private orderRepository: OrderRepository,
    private paymentLogger: PaymentLoggerService,
  ) {}

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
    const orderId = `ORD_${Date.now()}_${uuidv4().substring(0, 8)}`;

    const order = await this.orderRepository.create({
      orderId,
      identityId: params.identityId
        ? new Types.ObjectId(params.identityId)
        : undefined,
      paymentOrderId: new Types.ObjectId(params.paymentOrderId),
      cartId: new Types.ObjectId(params.cartId),
      totalAmount: params.totalAmount,
      currency: params.currency,
      orderStatus: OrderStatus.PENDING,
      shippingAddressId: params.shippingAddressId
        ? new Types.ObjectId(params.shippingAddressId)
        : undefined,
      placerContact: params.placerContact,
      recipientContact: params.recipientContact,
      items: params.items.map((item) => ({
        itemId: new Types.ObjectId(item.itemId),
        quantity: item.quantity,
      })),
    });

    this.paymentLogger.logOrderCreated({
      orderId,
      paymentOrderId: params.paymentOrderId,
      userId: params.identityId,
      amount: params.totalAmount,
    });

    return order;
  }

  async cancelOrder(params: {
    orderId: string;
    reason: string;
  }): Promise<Order> {
    const updatedOrder = await this.orderRepository.updateOrderStatus(
      params.orderId,
      OrderStatus.CANCELLED,
      {
        cancelledAt: new Date(),
        cancellationReason: params.reason,
      },
    );

    if (!updatedOrder) {
      throw new Error('Failed to cancel order');
    }

    this.paymentLogger.log('Order cancelled', {
      orderId: params.orderId,
      reason: params.reason,
    });

    return updatedOrder;
  }

  async updateOrderStatus(params: {
    orderId: string;
    status: OrderStatus;
    trackingNumber?: string;
  }): Promise<Order> {
    const updateData: any = {};

    if (params.trackingNumber) {
      updateData.trackingNumber = params.trackingNumber;
    }

    if (params.status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    if (params.status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    const order = await this.orderRepository.updateOrderStatus(
      params.orderId,
      params.status,
      updateData,
    );

    if (!order) {
      throw new Error('Order not found');
    }

    this.paymentLogger.log('Order status updated', {
      orderId: params.orderId,
      oldStatus: order.orderStatus,
      newStatus: params.status,
    });

    return order;
  }
}

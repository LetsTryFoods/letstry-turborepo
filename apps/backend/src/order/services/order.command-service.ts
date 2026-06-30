import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Order, OrderStatus } from '../order.schema';
import { OrderRepository } from './order.repository';
import { PaymentLoggerService } from '../../common/services/payment-logger.service';
import { v4 as uuidv4 } from 'uuid';
import { Inject, forwardRef } from '@nestjs/common';
import { PackingService } from '../../packing/services/packing.service';
import { LogisticsService } from './logistics.service';
import { BoxSizeCrudService } from '../../box-size/services/core/box-size-crud.service';
import { OrderQueryService } from './order.query-service';

import { Address, AddressDocument } from '../../address/address.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OrderCommandService {
  constructor(
    private orderRepository: OrderRepository,
    private paymentLogger: PaymentLoggerService,
    @Inject(forwardRef(() => PackingService))
    private packingService: PackingService,
    private logisticsService: LogisticsService,
    private boxSizeCrudService: BoxSizeCrudService,
    @InjectModel(Address.name)
    private addressModel: Model<AddressDocument>,
  ) { }

  async createOrder(params: {
    identityId: Types.ObjectId;
    paymentOrderId: string;
    paymentOrder?: Types.ObjectId;
    cartId: Types.ObjectId;
    totalAmount: string;
    subtotal?: string;
    discount?: string;
    deliveryCharge?: string;
    handlingCharge?: string;
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
    const orderId = `ORD_${Date.now()}_${uuidv4().substring(0, 8)}`;

    this.paymentLogger.log('Starting Order Creation', {
      step: 'START_CREATION',
      orderId,
      identityId: params.identityId,
      cartId: params.cartId,
      itemCount: params.items.length,
      fullPayload: params,
    });

    const itemsMap = params.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
      name: item.name,
      sku: item.sku,
      variant: item.variant,
      image: item.image,
    }));

    this.paymentLogger.log('Items Mapped for Snapshot', {
      step: 'ITEMS_MAPPED',
      orderId,
      count: itemsMap.length,
    });

    const order = await this.orderRepository.create({
      orderId,
      identityId: params.identityId,
      paymentOrderId: params.paymentOrderId,
      paymentOrder: params.paymentOrder,
      cartId: params.cartId,
      totalAmount: params.totalAmount,
      subtotal: params.subtotal || params.totalAmount,
      discount: params.discount || '0',
      deliveryCharge: params.deliveryCharge || '0',
      handlingCharge: params.handlingCharge || '0',
      currency: params.currency,
      orderStatus: OrderStatus.CONFIRMED,
      shippingAddressId: params.shippingAddressId,
      placerContact: params.placerContact,
      recipientContact: params.recipientContact,
      items: itemsMap,
    });

    this.paymentLogger.log('Order Persisted to DB', {
      step: 'DB_INSERT_SUCCESS',
      orderId,
      mongoId: order._id,
    });

    this.paymentLogger.logOrderCreated({
      orderId,
      paymentOrderId: params.paymentOrderId,
      userId: params.identityId,
      amount: params.totalAmount,
    });

    this.paymentLogger.log('Triggering Packing Workflow', {
      step: 'TRIGGER_PACKING',
      orderId,
    });

    await this.createPackingWorkflow(order);

    return order;
  }

  private async createPackingWorkflow(order: Order): Promise<void> {
    try {
      await this.packingService.createPackingOrder(order);
    } catch (error) {
      this.paymentLogger.error('Failed to create packing order', '', {
        orderId: order._id.toString(),
        error: error.message,
      });
    }
  }

  async cancelOrder(params: {
    orderId: string;
    reason: string;
  }): Promise<Order> {
    const updatedOrder = await this.orderRepository.updateOrderStatus(
      params.orderId,
      OrderStatus.CONFIRMED,
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

    try {
      await this.packingService.syncTerminalOrderStatus(
        updatedOrder._id.toString(),
        'CANCELLED' as any,
      );
    } catch (err) {
      this.paymentLogger.error('Failed to sync packing order cancellation', '', {
        orderId: updatedOrder._id.toString(),
        error: err.message,
      });
    }

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

    try {
      await this.packingService.syncTerminalOrderStatus(
        order._id.toString(),
        params.status,
      );
    } catch (err) {
      this.paymentLogger.error('Failed to sync packing order terminal status', '', {
        orderId: order._id.toString(),
        error: err.message,
      });
    }

    return order;
  }

  async assignBoxToOrder(params: {
    orderId: string;
    boxId: string;
  }): Promise<Order> {
    let order = await this.orderRepository.findById(params.orderId);

    // Fallback: If not found by custom orderId, try finding by MongoDB _id
    if (!order && Types.ObjectId.isValid(params.orderId)) {
      order = await this.orderRepository.findByInternalId(params.orderId);
    }

    if (!order) {
      throw new Error('Order not found');
    }

    let box;
    if (Types.ObjectId.isValid(params.boxId)) {
      box = await this.boxSizeCrudService.findById(params.boxId);
    }
    
    // Fallback to code or name if not a valid ObjectId or not found
    if (!box) {
      box = await this.boxSizeCrudService.findByCode(params.boxId);
    }
    if (!box) {
      const BoxModel = (this.boxSizeCrudService as any).boxSizeModel;
      if (BoxModel) {
        box = await BoxModel.findOne({ name: params.boxId }).exec();
      }
    }

    if (!box) {
      throw new Error(`Box not found for identifier: ${params.boxId}`);
    }

    // Resolve shipping address to get state and city
    let state = '';
    let city = '';
    if (order.shippingAddressId) {
      const address = await this.addressModel.findById(order.shippingAddressId).exec();
      if (address) {
        state = address.addressRegion || '';
        city = address.addressLocality || '';
      }
    }

    const { region, rate } = this.logisticsService.getRegionAndRate(state, city);
    let volumetricWeight = 0;
    let logisticsCost = 0;
    
    if (box.type && box.type.toUpperCase() === 'PACKET') {
      volumetricWeight = box.chargeableWeight || 0.5; // default 500g if not specified
      logisticsCost = box.fixedCourierCost 
        ? box.fixedCourierCost * volumetricWeight
        : this.logisticsService.calculateBaseCost(volumetricWeight, rate);
    } else {
      volumetricWeight = this.logisticsService.calculateVolumetricWeight(
        box.lengthCm || 0,
        box.breadthCm || 0,
        box.heightCm || 0
      );
      logisticsCost = this.logisticsService.calculateBaseCost(volumetricWeight, rate);
    }

    const updateData = {
      boxId: box._id,
      volumetricWeight,
      region,
      logisticsCost,
    };

    const updatedOrder = await this.orderRepository.updateStatusByInternalId(
      order._id.toString(),
      order.orderStatus,
      updateData,
    );

    if (!updatedOrder) {
      throw new Error('Failed to update order with box info');
    }

    return updatedOrder;
  }
}


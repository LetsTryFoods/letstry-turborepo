import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus } from '../order.schema';

@Injectable()
export class OrderRepository {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) { }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = new this.orderModel(orderData);
    return order.save();
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.orderModel.findOne({ orderId }).exec();
  }

  async findByInternalId(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async findByPaymentOrderId(paymentOrderId: string): Promise<Order | null> {
    return this.orderModel.findOne({ paymentOrderId }).exec();
  }

  async findByPaymentOrder(paymentOrder: string): Promise<Order | null> {
    return this.orderModel.findOne({ paymentOrder }).exec();
  }

  async findByIdentityIds(
    identityIds: string[],
    status?: OrderStatus,
    skip?: number,
    limit?: number,
  ): Promise<Order[]> {
    const objectIds = identityIds
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));
    const query: any = { identityId: { $in: objectIds } };
    if (status) {
      query.orderStatus = status;
    }
    return this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip || 0)
      .limit(limit || 0)
      .exec();
  }

  async countByIdentityIds(
    identityIds: string[],
    status?: OrderStatus,
  ): Promise<number> {
    const objectIds = identityIds
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));
    const query: any = { identityId: { $in: objectIds } };
    if (status) {
      query.orderStatus = status;
    }
    return this.orderModel.countDocuments(query).exec();
  }

  async findAll(filter: any, skip: number, limit: number): Promise<Order[]> {
    return this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countAll(filter: any): Promise<number> {
    return this.orderModel.countDocuments(filter).exec();
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    additionalFields?: any,
  ): Promise<Order | null> {
    return this.orderModel
      .findOneAndUpdate(
        { orderId },
        { orderStatus: status, ...additionalFields },
        { new: true },
      )
      .exec();
  }

  async updateStatusByInternalId(
    id: string,
    status: OrderStatus,
    additionalFields?: any,
  ): Promise<Order | null> {
    return this.orderModel
      .findByIdAndUpdate(
        id,
        { orderStatus: status, ...additionalFields },
        { new: true },
      )
      .exec();
  }

  async countByStatus(status: OrderStatus): Promise<number> {
    return this.orderModel.countDocuments({ orderStatus: status }).exec();
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderModel.find({ orderStatus: status }).exec();
  }

  async countTotal(): Promise<number> {
    return this.orderModel.countDocuments().exec();
  }

  async sumTotalRevenue(): Promise<string> {
    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$totalAmount' } },
        },
      },
    ]);
    return result.length > 0 ? result[0].total.toString() : '0';
  }
}

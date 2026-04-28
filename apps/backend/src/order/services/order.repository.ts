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

  async findAll(filter: any, skip: number, limit: number, userSearch?: string): Promise<Order[]> {
    if (userSearch) {
      const pipeline = this.buildSearchPipeline(filter, userSearch);
      pipeline.push(
        { $sort: { createdAt: -1 } as any },
        { $skip: skip },
        { $limit: limit }
      );
      const results = await this.orderModel.aggregate(pipeline).exec();
      return results.map(r => this.orderModel.hydrate(r));
    }

    return this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countAll(filter: any, userSearch?: string): Promise<number> {
    if (userSearch) {
      const pipeline = this.buildSearchPipeline(filter, userSearch);
      pipeline.push({ $count: 'total' });
      const result = await this.orderModel.aggregate(pipeline).exec();
      return result.length > 0 ? result[0].total : 0;
    }
    return this.orderModel.countDocuments(filter).exec();
  }

  private buildSearchPipeline(filter: any, userSearch: string): any[] {
    const regex = new RegExp(userSearch, 'i');
    return [
      { $match: filter },
      {
        $lookup: {
          from: 'identities',
          localField: 'identityId',
          foreignField: '_id',
          as: 'identity',
        },
      },
      {
        $match: {
          $or: [
            { orderId: regex },
            { 'placerContact.phone': regex },
            { 'recipientContact.phone': regex },
            { 'identity.phoneNumber': regex },
            { 'identity.firstName': regex },
            { 'identity.lastName': regex },
            { 'items.name': regex },
            { 'items.sku': regex },
          ],
        },
      },
    ];
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

  async countByStatus(status: OrderStatus, filter: any = {}): Promise<number> {
    return this.orderModel.countDocuments({ ...filter, orderStatus: status }).exec();
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderModel.find({ orderStatus: status }).exec();
  }

  async countTotal(filter: any = {}): Promise<number> {
    return this.orderModel.countDocuments(filter).exec();
  }

  async sumTotalRevenue(filter: any = {}): Promise<string> {
    const result = await this.orderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$totalAmount' } },
        },
      },
    ]);
    return result.length > 0 ? result[0].total.toString() : '0';
  }

  async findByPhone(phone: string): Promise<Order | null> {
    const cleanPhone = phone.replace(/\D/g, '');
    const searchPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    const regex = new RegExp(searchPhone, 'i');

    const orders = await this.orderModel
      .aggregate([
        {
          $lookup: {
            from: 'identities',
            localField: 'identityId',
            foreignField: '_id',
            as: 'identity',
          },
        },
        {
          $match: {
            $or: [
              { 'placerContact.phone': regex },
              { 'recipientContact.phone': regex },
              { 'identity.phoneNumber': regex },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1 },
      ])
      .exec();

    if (orders && orders.length > 0) {
      return this.orderModel.hydrate(orders[0]);
    }

    return null;
  }
  async getTopProducts(startDate: Date, endDate: Date, limit = 50): Promise<any[]> {
    const pipeline: any[] = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, orderStatus: { $ne: OrderStatus.SHIPMENT_FAILED } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: { $ifNull: ["$items.name", "Unknown Product"] } },
          image: { $first: "$items.image" },
          soldQuantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $toDouble: "$items.totalPrice" } }
        }
      },
      { $sort: { soldQuantity: -1 } }
    ];

    if (limit > 0) {
      pipeline.push({ $limit: limit });
    }

    return this.orderModel.aggregate(pipeline).exec();
  }

  async getDailySales(startDate: Date, endDate: Date): Promise<any[]> {
    return this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, orderStatus: { $ne: OrderStatus.SHIPMENT_FAILED } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: { $toDouble: "$totalAmount" } }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          orders: 1,
          revenue: 1
        }
      }
    ]).exec();
  }

  async getCategorySales(startDate: Date, endDate: Date): Promise<any[]> {
    // This is tricky because items don't have categoryId directly in the Order schema.
    // We might need to join with products.
    return this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, orderStatus: { $ne: OrderStatus.SHIPMENT_FAILED } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          firstCategoryId: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$product.categoryIds", []] } }, 0] },
              { $arrayElemAt: ["$product.categoryIds", 0] },
              null
            ]
          }
        }
      },
      {
        $lookup: {
          from: "categories",
          let: { catId: "$firstCategoryId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$catId"]
                }
              }
            }
          ],
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$category.name", "Uncategorized"] },
          revenue: { $sum: { $toDouble: "$items.totalPrice" } }
        }
      },
      { $sort: { revenue: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          revenue: 1
        }
      }
    ]).exec();
  }

  async getTopCustomers(startDate: Date, endDate: Date, limit = 5): Promise<any[]> {
    return this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, orderStatus: { $ne: OrderStatus.SHIPMENT_FAILED } } },
      {
        $group: {
          _id: "$identityId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: { $toDouble: "$totalAmount" } }
        }
      },
      { $match: { _id: { $ne: null } } },
      {
        $lookup: {
          from: "identities",
          localField: "_id",
          foreignField: "_id",
          as: "identity"
        }
      },
      { $unwind: "$identity" },
      {
        $project: {
          _id: 1,
          name: {
            $trim: {
              input: {
                $concat: [
                  { $ifNull: ["$identity.firstName", ""] },
                  " ",
                  { $ifNull: ["$identity.lastName", ""] }
                ]
              }
            }
          },
          email: { $ifNull: ["$identity.email", "N/A"] },
          totalOrders: 1,
          totalSpent: 1
        }
      },
      {
        $project: {
          _id: 1,
          name: { $cond: [{ $eq: ["$name", ""] }, "Customer", "$name"] },
          email: 1,
          totalOrders: 1,
          totalSpent: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit }
    ]).exec();
  }

  async getSummaryStats(startDate: Date, endDate: Date): Promise<any> {
    const result = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, orderStatus: { $ne: OrderStatus.SHIPMENT_FAILED } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: "$totalAmount" } },
          totalOrders: { $sum: 1 },
          uniqueCustomers: { $addToSet: "$identityId" }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrders: 1,
          totalCustomers: { $size: "$uniqueCustomers" }
        }
      }
    ]).exec();

    return result[0] || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0 };
  }
}

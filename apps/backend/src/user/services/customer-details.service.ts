import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Identity,
  IdentityDocument,
  IdentityStatus,
} from '../../common/schemas/identity.schema';
import { Order } from '../../order/order.schema';
import { Cart, CartStatus } from '../../cart/cart.schema';
import { Address } from '../../address/address.schema';
import { CustomerDetails } from '../user.graphql';

@Injectable()
export class CustomerDetailsService {
  constructor(
    @InjectModel(Identity.name) private identityModel: Model<IdentityDocument>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Address.name) private addressModel: Model<Address>,
  ) { }

  async getCustomerDetails(id: string): Promise<CustomerDetails> {
    const customer = await this.findCustomerById(id);

    const customerId = customer._id.toString();
    const allIdentityIds = [customerId, ...(customer.mergedGuestIds || [])];

    const [orders, activeCart, addresses, orderStats] = await Promise.all([
      this.fetchCustomerOrders(allIdentityIds),
      this.fetchActiveCart(customerId),
      this.fetchCustomerAddresses(allIdentityIds),
      this.calculateOrderStats(allIdentityIds),
    ]);

    return {
      ...customer.toObject(),
      totalOrders: orderStats.totalOrders,
      totalSpent: orderStats.totalSpent,
      isGuest: customer.status === IdentityStatus.GUEST,
      orders,
      activeCart,
      addresses,
    };
  }

  async findCustomerById(id: string): Promise<IdentityDocument> {
    const customer = await this.identityModel.findById(id).exec();

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async fetchCustomerOrders(identityIds: string[]): Promise<Order[]> {
    return this.orderModel
      .find({ identityId: { $in: identityIds } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async fetchActiveCart(identityId: string): Promise<Cart | undefined> {
    const cart = await this.cartModel
      .findOne({ identityId, status: CartStatus.ACTIVE })
      .exec();

    return cart || undefined;
  }

  async fetchCustomerAddresses(identityIds: string[]): Promise<Address[]> {
    return this.addressModel
      .find({ identityId: { $in: identityIds } })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  async calculateOrderStats(
    identityIds: string[],
  ): Promise<{ totalOrders: number; totalSpent: number }> {
    const objectIds = identityIds.map((id) => new Types.ObjectId(id));
    const stats = await this.orderModel.aggregate([
      { $match: { identityId: { $in: objectIds } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: { $toDouble: '$totalAmount' } },
        },
      },
    ]);

    return stats.length > 0
      ? { totalOrders: stats[0].totalOrders, totalSpent: stats[0].totalSpent }
      : { totalOrders: 0, totalSpent: 0 };
  }
}

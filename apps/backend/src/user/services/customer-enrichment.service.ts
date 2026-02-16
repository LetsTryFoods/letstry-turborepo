import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IdentityDocument,
  IdentityStatus,
} from '../../common/schemas/identity.schema';
import { Order } from '../../order/order.schema';
import { Cart, CartStatus } from '../../cart/cart.schema';
import { EnrichedCustomer } from '../user.graphql';
import { CartStatusFilter } from '../user.input';

@Injectable()
export class CustomerEnrichmentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
  ) { }

  async enrichCustomersWithOrderData(
    customers: IdentityDocument[],
  ): Promise<EnrichedCustomer[]> {
    const identityIds = customers.map((c) => c._id.toString());

    const [orderStats, cartStats] = await Promise.all([
      this.getOrderStatsForCustomers(identityIds),
      this.getCartStatsForCustomers(identityIds),
    ]);

    return customers.map((customer) => {
      const customerId = customer._id.toString();
      const orderStat = orderStats.get(customerId) || {
        totalOrders: 0,
        totalSpent: 0,
      };
      const cartStat = cartStats.get(customerId);

      return {
        ...customer.toObject(),
        totalOrders: orderStat.totalOrders,
        totalSpent: orderStat.totalSpent,
        activeCartItemsCount: cartStat?.itemsCount,
        displayPhone: this.getDisplayPhone(customer),
        isGuest: customer.status === IdentityStatus.GUEST,
      };
    });
  }

  applyCartStatusFilter(
    customers: EnrichedCustomer[],
    cartStatus?: CartStatusFilter,
  ): EnrichedCustomer[] {
    if (!cartStatus) return customers;

    if (cartStatus === CartStatusFilter.HAS_CART) {
      return customers.filter(
        (c) => c.activeCartItemsCount !== undefined && c.activeCartItemsCount > 0,
      );
    }

    return customers.filter(
      (c) => c.activeCartItemsCount === undefined || c.activeCartItemsCount === 0,
    );
  }

  async getOrderStatsForCustomers(
    identityIds: string[],
  ): Promise<Map<string, { totalOrders: number; totalSpent: number }>> {
    const objectIds = identityIds.map((id) => new Types.ObjectId(id));
    const stats = await this.orderModel.aggregate([
      { $match: { identityId: { $in: objectIds } } },
      {
        $group: {
          _id: '$identityId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: { $toDouble: '$totalAmount' } },
        },
      },
    ]);

    return new Map(
      stats.map((stat) => [
        stat._id.toString(),
        { totalOrders: stat.totalOrders, totalSpent: stat.totalSpent },
      ]),
    );
  }

  async getCartStatsForCustomers(
    identityIds: string[],
  ): Promise<Map<string, { itemsCount: number }>> {
    const carts = await this.cartModel
      .find({
        identityId: { $in: identityIds },
        status: CartStatus.ACTIVE,
      })
      .select('identityId items')
      .exec();

    return new Map(
      carts.map((cart) => [
        cart.identityId.toString(),
        { itemsCount: cart.items.length },
      ]),
    );
  }

  getDisplayPhone(customer: IdentityDocument): string | undefined {
    if (customer.phoneNumber) {
      return customer.phoneNumber;
    }
    return undefined;
  }
}

import { Injectable } from '@nestjs/common';
import { Order } from '../order.schema';
import { ProductService } from '../../product/product.service';

@Injectable()
export class OrderItemService {
  constructor(private productService: ProductService) {}

  async populateOrderItems(order: Order): Promise<any> {
    const populatedItems = await Promise.all(
      order.items.map(async (item) => {
        const product = await this.productService.findOne(
          item.itemId.toString(),
        );
        const variant = product.variants[0];
        return {
          itemId: item.itemId,
          quantity: item.quantity,
          price: variant.price.toString(),
          totalPrice: (
            parseFloat(variant.price.toString()) * item.quantity
          ).toString(),
          name: product.name,
          sku: variant.sku,
        };
      }),
    );
    const orderObj = order.toObject ? order.toObject() : order;
    return { ...orderObj, items: populatedItems };
  }
}

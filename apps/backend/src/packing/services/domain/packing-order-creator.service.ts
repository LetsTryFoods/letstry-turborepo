import { Injectable } from '@nestjs/common';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { ProductService } from '../../../product/product.service';
import { PackingStatus } from '../../entities/packing-order.entity';
import { Order } from '../../../order/order.schema';
import { PackingLoggerService } from './packing-logger.service';

@Injectable()
export class PackingOrderCreatorService {
  constructor(
    private packingOrderCrud: PackingOrderCrudService,
    private productService: ProductService,
    private packingLogger: PackingLoggerService,
  ) {}

  async createFromOrder(order: Order): Promise<any> {
    try {
      const items = await this.extractItems(order);

      const packingOrder = await this.packingOrderCrud.create({
        orderId: order._id.toString(),
        orderNumber: order.orderId,
        status: PackingStatus.PENDING,
        priority: 1,
        items,
        hasErrors: false,
        isExpress: false,
      });

      this.packingLogger.logOrderCreated(
        order._id.toString(),
        packingOrder._id.toString(),
      );

      return packingOrder;
    } catch (error) {
      this.packingLogger.logError('Failed to create packing order', error, {
        orderId: order._id.toString(),
      });
      throw error;
    }
  }

  private async extractItems(order: Order): Promise<any[]> {
    const items = await Promise.all(
      order.items.map(async (item) => {
        try {
          const product = await this.productService.findByVariantId(
            item.variantId.toString(),
          );

          if (!product) {
            return this.createUnknownItem(item);
          }

          const variant = product.variants.find(
            (v) => v._id.toString() === item.variantId.toString(),
          );

          if (!variant) {
            return this.createUnknownItem(item);
          }

          return {
            productId: product._id.toString(),
            sku: variant.sku,
            ean: variant.sku,
            name: product.name,
            quantity: item.quantity,
            dimensions: {
              length: variant.length || 0,
              width: variant.breadth || 0,
              height: variant.height || 0,
              weight: variant.weight || 0,
              unit: 'cm',
            },
            isFragile: false,
            imageUrl: variant.thumbnailUrl || variant.images[0]?.url || '',
          };
        } catch (error) {
          return this.createUnknownItem(item);
        }
      }),
    );

    return items;
  }

  private createUnknownItem(item: any) {
    return {
      productId: item.variantId.toString(),
      sku: 'UNKNOWN',
      ean: 'UNKNOWN',
      name: 'Unknown Product',
      quantity: item.quantity,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
        unit: 'cm',
      },
      isFragile: false,
      imageUrl: '',
    };
  }
}

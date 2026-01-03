import { Injectable } from '@nestjs/common';
import { Order } from '../order.schema';
import { ProductService } from '../../product/product.service';

@Injectable()
export class OrderItemService {
  constructor(private productService: ProductService) {}

  async populateOrderItems(order: Order): Promise<any> {
    const populatedItems = await Promise.all(
      order.items.map(async (item) => {
        if (!item.variantId) {
          return {
            variantId: null,
            quantity: item.quantity,
            price: '0',
            totalPrice: '0',
            name: 'Unknown Product',
            sku: 'N/A',
            variant: null,
            image: null,
          };
        }
        
        try {
          const product = await this.productService.findByVariantId(
            item.variantId.toString(),
          );
          
          if (!product) {
            return {
              variantId: item.variantId.toString(),
              quantity: item.quantity,
              price: '0',
              totalPrice: '0',
              name: 'Product Not Found',
              sku: 'N/A',
              variant: null,
              image: null,
            };
          }

          const variant = product.variants.find(
            (v) => v._id.toString() === item.variantId.toString(),
          );
          
          if (!variant) {
            return {
              variantId: item.variantId.toString(),
              quantity: item.quantity,
              price: '0',
              totalPrice: '0',
              name: product.name,
              sku: 'N/A',
              variant: null,
              image: null,
            };
          }

          return {
            variantId: item.variantId.toString(),
            quantity: item.quantity,
            price: variant.price.toString(),
            totalPrice: (
              parseFloat(variant.price.toString()) * item.quantity
            ).toString(),
            name: product.name,
            sku: variant.sku,
            variant: variant.name,
            image: variant.thumbnailUrl || variant.images[0]?.url,
          };
        } catch (error) {
          return {
            variantId: item.variantId.toString(),
            quantity: item.quantity,
            price: '0',
            totalPrice: '0',
            name: 'Product Not Found',
            sku: 'N/A',
            variant: null,
            image: null,
          };
        }
      }),
    );
    const orderObj = order.toObject ? order.toObject() : order;
    return { ...orderObj, items: populatedItems };
  }

  async populateItemsOnly(items: any[]): Promise<any[]> {
    return Promise.all(
      items.map(async (item) => {
        if (!item.variantId) {
          return {
            variantId: null,
            quantity: item.quantity,
            price: '0',
            totalPrice: '0',
            name: 'Unknown Product',
            sku: 'N/A',
            variant: null,
            image: null,
          };
        }
        
        try {
          const product = await this.productService.findByVariantId(
            item.variantId.toString(),
          );
          
          if (!product) {
            return {
              variantId: item.variantId.toString(),
              quantity: item.quantity,
              price: '0',
              totalPrice: '0',
              name: 'Product Not Found',
              sku: 'N/A',
              variant: null,
              image: null,
            };
          }

          const variant = product.variants.find(
            (v) => v._id.toString() === item.variantId.toString(),
          );
          
          if (!variant) {
            return {
              variantId: item.variantId.toString(),
              quantity: item.quantity,
              price: '0',
              totalPrice: '0',
              name: product.name,
              sku: 'N/A',
              variant: null,
              image: null,
            };
          }

          return {
            variantId: item.variantId.toString(),
            quantity: item.quantity,
            price: variant.price.toString(),
            totalPrice: (
              parseFloat(variant.price.toString()) * item.quantity
            ).toString(),
            name: product.name,
            sku: variant.sku,
            variant: variant.name,
            image: variant.thumbnailUrl || variant.images[0]?.url,
          };
        } catch (error) {
          return {
            variantId: item.variantId.toString(),
            quantity: item.quantity,
            price: '0',
            totalPrice: '0',
            name: 'Product Not Found',
            sku: 'N/A',
            variant: null,
            image: null,
          };
        }
      }),
    );
  }
}

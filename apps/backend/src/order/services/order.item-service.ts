import { Injectable } from '@nestjs/common';
import { Order } from '../order.schema';
import { ProductService } from '../../product/product.service';

@Injectable()
export class OrderItemService {
  constructor(private productService: ProductService) {}

  async populateOrderItems(order: Order): Promise<any> {
    const populatedItems = await Promise.all(
      order.items.map(async (item: any) => {
        const vId = item.variantId?.toString();
        const pId = item.productId?.toString();

        let weight = item.weight;
        let weightUnit = item.weightUnit;

        // Fetch weight if missing and we have an ID
        if (weight === undefined && (vId || pId)) {
          try {
            let product = vId
              ? await this.productService.findByVariantId(vId)
              : null;
            if (!product && pId) {
              product = await this.productService.findOne(pId).catch(() => null);
            }
            if (product) {
              const variant = vId
                ? product.variants.find((v) => v._id.toString() === vId)
                : null;
              if (variant) {
                weight = variant.weight;
                weightUnit = variant.weightUnit;
              }
            }
          } catch (error) {
            // ignore
          }
        }

        if (item.name && item.price) {
          return {
            variantId: vId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
            name: item.name,
            sku: item.sku,
            variant: item.variant,
            image: item.image,
            weight: weight || null,
            weightUnit: weightUnit || null,
          };
        }

        if (!vId && !pId) {
          return {
            variantId: null,
            quantity: item.quantity,
            price: '0',
            totalPrice: '0',
            name: 'Unknown Product',
            sku: 'N/A',
            variant: null,
            image: null,
            weight: null,
            weightUnit: null,
          };
        }

        try {
          let product = vId
            ? await this.productService.findByVariantId(vId)
            : null;

          if (!product && pId) {
            product = await this.productService.findOne(pId).catch(() => null);
          }

          if (!product) {
            return {
              variantId: vId || pId,
              quantity: item.quantity,
              price: '0',
              totalPrice: '0',
              name: `Product Not Found (${vId || pId})`,
              sku: 'N/A',
              variant: null,
              image: null,
              weight: null,
              weightUnit: null,
            };
          }

          const variant = vId
            ? product.variants.find((v) => v._id.toString() === vId)
            : null;

          if (!variant) {
            return {
              variantId: vId,
              quantity: item.quantity,
              price: '0',
              totalPrice: '0',
              name: product.name,
              sku: 'N/A',
              variant: null,
              image: null,
              weight: null,
              weightUnit: null,
            };
          }

          return {
            variantId: vId,
            quantity: item.quantity,
            price: variant.price.toString(),
            totalPrice: (
              parseFloat(variant.price.toString()) * item.quantity
            ).toString(),
            name: product.name,
            sku: variant.sku,
            variant: variant.name,
            image: variant.thumbnailUrl || variant.images[0]?.url,
            weight: variant.weight,
            weightUnit: variant.weightUnit,
          };
        } catch (error) {
          return {
            variantId: vId,
            quantity: item.quantity,
            price: '0',
            totalPrice: '0',
            name: 'Product Not Found',
            sku: 'N/A',
            variant: null,
            image: null,
            weight: null,
            weightUnit: null,
          };
        }
      }),
    );
    const orderObj = order.toObject ? order.toObject() : order;
    return { ...orderObj, items: populatedItems };
  }

  async populateItemsOnly(items: any[]): Promise<any[]> {
    return Promise.all(
      items.map(async (item: any) => {
        const vId = item.variantId?.toString();
        const pId = item.productId?.toString();

        if (!vId && !pId) {
          return {
            variantId: null,
            quantity: item.quantity,
            price: '0',
            totalPrice: '0',
            name: 'Unknown Product',
            sku: 'N/A',
            variant: null,
            image: null,
            weight: null,
            weightUnit: null,
          };
        }

        try {
          // Try variant lookup first
          let product = vId
            ? await this.productService.findByVariantId(vId)
            : null;

          // Fallback to product lookup if variant lookup failed but we have a productId
          if (!product && pId) {
            product = await this.productService.findOne(pId).catch(() => null);
          }

          if (!product) {
            return {
              variantId: vId || pId,
              quantity: item.quantity,
              price: '0',
              totalPrice: '0',
              name: `Product Not Found (${vId || pId})`,
              sku: 'N/A',
              variant: null,
              image: null,
              weight: null,
              weightUnit: null,
            };
          }

          const variant = vId
            ? product.variants.find((v) => v._id.toString() === vId)
            : null;

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
              weight: null,
              weightUnit: null,
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
            weight: variant.weight,
            weightUnit: variant.weightUnit,
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
            weight: null,
            weightUnit: null,
          };
        }
      }),
    );
  }
}

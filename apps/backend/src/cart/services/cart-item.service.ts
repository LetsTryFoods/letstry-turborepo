import { Injectable } from '@nestjs/common';
import { CartItem } from '../cart.schema';

@Injectable()
export class CartItemService {
  findCartItemIndex(
    items: CartItem[],
    productId: string,
    attributes: any,
  ): number {
    return items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        JSON.stringify(item.attributes) === JSON.stringify(attributes),
    );
  }

  upsertCartItem(items: CartItem[], newItem: CartItem): void {
    const existingIndex = this.findCartItemIndex(
      items,
      newItem.productId,
      newItem.attributes,
    );
    if (existingIndex > -1) {
      items[existingIndex].quantity += newItem.quantity;
      items[existingIndex].totalPrice =
        items[existingIndex].quantity * items[existingIndex].unitPrice;
    } else {
      items.push(newItem);
    }
  }

  findItemIndexInCart(items: CartItem[], productId: string): number {
    return items.findIndex((item) => item.productId.toString() === productId);
  }

  updateItemQuantity(item: CartItem, quantity: number): void {
    item.quantity = quantity;
    item.totalPrice = item.quantity * item.unitPrice;
  }

  removeItemFromCart(items: CartItem[], productId: string): CartItem[] {
    return items.filter((item) => item.productId.toString() !== productId);
  }

  updateCartItemPrice(item: CartItem, product: any): boolean {
    if (product.price !== item.unitPrice) {
      item.unitPrice = product.price;
      item.totalPrice = product.price * item.quantity;
      return true;
    }
    return false;
  }

  createCartItem(
    product: any,
    quantity: number,
    variant: any,
    variantId?: string,
    attributes?: any,
  ): CartItem {
    return {
      productId: variantId || product._id,
      sku: variant.sku,
      quantity,
      attributes,
      name: `${product.name} - ${variant.name}`,
      unitPrice: variant.price,
      totalPrice: variant.price * quantity,
      mrp: variant.mrp,
      imageUrl: variant.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url,
    };
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { CartItem } from '../cart.schema';

@Injectable()
export class CartItemService {
  findCartItemIndex(
    items: CartItem[],
    variantId: string | undefined,
    productId: string,
  ): number {
    return items.findIndex((item) => {
      if (variantId) {
        return item.variantId?.toString() === variantId.toString();
      }
      return item.productId.toString() === productId.toString();
    });
  }

  upsertCartItem(items: CartItem[], newItem: CartItem): void {
    const existingIndex = this.findCartItemIndex(
      items,
      newItem.variantId,
      newItem.productId,
    );
    if (existingIndex > -1) {
      const newQuantity = items[existingIndex].quantity + newItem.quantity;
      if (newQuantity > 10) {
        throw new BadRequestException('Cannot add more than 10 items of the same SKU');
      }
      items[existingIndex].quantity = newQuantity;
      items[existingIndex].totalPrice =
        items[existingIndex].quantity * items[existingIndex].unitPrice;
    } else {
      if (newItem.quantity > 10) {
        throw new BadRequestException('Cannot add more than 10 items of the same SKU');
      }
      items.push(newItem);
    }
  }

  findItemIndexInCart(items: CartItem[], productId: string): number {
    return items.findIndex((item) => {
      if (item.variantId?.toString() === productId) {
        return true;
      }
      return item.productId.toString() === productId;
    });
  }

  updateItemQuantity(item: CartItem, quantity: number): void {
    if (quantity > 10) {
      throw new BadRequestException('Cannot add more than 10 items of the same SKU');
    }
    item.quantity = quantity;
    item.totalPrice = item.quantity * item.unitPrice;
  }

  removeItemFromCart(items: CartItem[], productId: string): CartItem[] {
    return items.filter((item) => {
      if (item.variantId?.toString() === productId) {
        return false;
      }
      return item.productId.toString() !== productId;
    });
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
      productId: product._id,
      variantId: variantId,
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

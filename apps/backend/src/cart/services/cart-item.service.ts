import { Injectable } from '@nestjs/common';
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
      items[existingIndex].quantity += newItem.quantity;
      items[existingIndex].totalPrice =
        items[existingIndex].quantity * items[existingIndex].unitPrice;
    } else {
      items.push(newItem);
    }
  }

  findItemIndexInCart(items: CartItem[], productId: string): number {
    const { product, variantId } = this.parseProductId(productId);
    
    return items.findIndex((item) => {
      if (variantId) {
        return item.variantId?.toString() === variantId;
      }
      return item.productId.toString() === product;
    });
  }

  private parseProductId(productId: string): { product: string; variantId?: string } {
    return { product: productId, variantId: productId };
  }

  updateItemQuantity(item: CartItem, quantity: number): void {
    item.quantity = quantity;
    item.totalPrice = item.quantity * item.unitPrice;
  }

  removeItemFromCart(items: CartItem[], productId: string): CartItem[] {
    const { product, variantId } = this.parseProductId(productId);
    
    return items.filter((item) => {
      if (variantId) {
        return item.variantId?.toString() !== variantId;
      }
      return item.productId.toString() !== product;
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

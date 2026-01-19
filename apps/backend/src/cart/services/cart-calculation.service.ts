import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cart, CartItem } from '../cart.schema';
import { ChargesService } from '../../charges/charges.service';
import { CartDiscountService } from './cart-discount.service';

@Injectable()
export class CartCalculationService {
  private readonly applyCouponOnMrp: boolean;

  constructor(
    private readonly chargesService: ChargesService,
    private readonly cartDiscountService: CartDiscountService,
    private readonly configService: ConfigService,
  ) {
    this.applyCouponOnMrp =
      this.configService.get<boolean>('cart.applyCouponOnMrp') || false;
  }

  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  calculateMrpTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  }

  calculateGrandTotal(
    subtotal: number,
    shippingCost: number,
    estimatedTax: number,
    handlingCharge: number,
    discountAmount: number,
  ): number {
    return Math.max(
      0,
      subtotal + shippingCost + estimatedTax + handlingCharge - discountAmount,
    );
  }

  async getHandlingCharge(): Promise<number> {
    const charges = await this.chargesService.getCharges();
    return charges?.active ? charges.handlingCharge : 0;
  }

  async recalculateCart(cart: Cart): Promise<void> {
    const hasCoupon = !!cart.couponCode;
    const useMrpForCalculation = this.applyCouponOnMrp && hasCoupon;

    const subtotal = useMrpForCalculation
      ? this.calculateMrpTotal(cart.items)
      : this.calculateSubtotal(cart.items);

    const discountAmount =
      await this.cartDiscountService.calculateDiscountAmount(
        cart.couponCode,
        subtotal,
        cart.items,
      );
    const handlingCharge = cart.items.length > 0 ? await this.getHandlingCharge() : 0;

    const shippingCost = 0;
    const estimatedTax = 0;
    const grandTotal = this.calculateGrandTotal(
      subtotal,
      shippingCost,
      estimatedTax,
      handlingCharge,
      discountAmount,
    );

    cart.totalsSummary = {
      subtotal,
      discountAmount,
      shippingCost,
      estimatedTax,
      handlingCharge,
      grandTotal,
    };
  }
}

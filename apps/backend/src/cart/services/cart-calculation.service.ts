import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cart, CartItem } from '../cart.schema';
import { ChargesService } from '../../charges/charges.service';
import { CartDiscountService } from './cart-discount.service';

function isNCRPincode(pincode: string): boolean {
  const pin = parseInt(pincode, 10);
  if (isNaN(pin)) return false;

  return (
    (pin >= 110001 && pin <= 110097) ||
    (pin >= 201001 && pin <= 201318) ||
    (pin >= 122001 && pin <= 122505) ||
    (pin >= 201001 && pin <= 201318) ||
    (pin >= 203001 && pin <= 203207) ||
    (pin >= 124500 && pin <= 124507) ||
    (pin >= 131001 && pin <= 131409) ||
    (pin >= 132101 && pin <= 132140)
  );
}

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

  async calculateShippingCost(subtotal: number, shippingAddress?: any): Promise<number> {
    if (!shippingAddress?.pincode) {
      return 0;
    }

    const charges = await this.chargesService.getCharges();
    if (!charges?.active) {
      return 0;
    }

    if (subtotal >= charges.freeDeliveryThreshold) {
      return 0;
    }

    const isNCR = isNCRPincode(shippingAddress.pincode);
    return isNCR ? charges.deliveryDelhiBelowThreshold : charges.deliveryRestBelowThreshold;
  }

  async recalculateCart(cart: Cart, shippingAddress?: any): Promise<void> {
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

    const shippingCost = await this.calculateShippingCost(subtotal, shippingAddress);
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

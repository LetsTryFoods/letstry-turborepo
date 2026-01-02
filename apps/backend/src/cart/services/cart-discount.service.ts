import { Injectable, BadRequestException } from '@nestjs/common';
import { CouponService } from '../../coupon/coupon.service';
import { DiscountType } from '../../coupon/coupon.schema';
import { CartItem } from '../cart.schema';
import { WinstonLoggerService } from '../../logger/logger.service';

@Injectable()
export class CartDiscountService {
  constructor(
    private readonly couponService: CouponService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async validateAndApplyCoupon(
    couponCode: string,
    subtotal: number,
  ): Promise<void> {
    try {
      await this.couponService.validateCoupon(couponCode, subtotal);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async calculateDiscountAmount(
    couponCode: string | undefined,
    subtotal: number,
    items: CartItem[],
  ): Promise<number> {
    if (!couponCode) {
      return 0;
    }

    try {
      return await this.calculateDiscount(subtotal, items, couponCode);
    } catch (error) {
      this.logger.warn(
        `Coupon ${couponCode} became invalid: ${error.message}`,
        'CartModule',
      );
      return 0;
    }
  }

  async calculateDiscount(
    subtotal: number,
    items: CartItem[],
    couponCode: string,
  ): Promise<number> {
    const coupon = await this.couponService.validateCoupon(
      couponCode,
      subtotal,
    );
    const applicableAmount = this.calculateApplicableAmount(
      coupon,
      subtotal,
      items,
    );

    let discountAmount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = this.calculatePercentageDiscount(
        applicableAmount,
        coupon.discountValue,
        coupon.maxDiscountAmount,
      );
    } else if (coupon.discountType === DiscountType.FIXED) {
      discountAmount = coupon.discountValue;
    }

    return Math.min(discountAmount, subtotal);
  }

  calculateApplicableAmount(
    coupon: any,
    subtotal: number,
    items: CartItem[],
  ): number {
    return subtotal;
  }

  calculatePercentageDiscount(
    applicableAmount: number,
    discountValue: number,
    maxDiscountAmount?: number,
  ): number {
    let discountAmount = (applicableAmount * discountValue) / 100;
    if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
      discountAmount = maxDiscountAmount;
    }
    return discountAmount;
  }
}

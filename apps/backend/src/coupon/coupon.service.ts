import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument, DiscountType } from './coupon.schema';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async createCoupon(input: any): Promise<Coupon> {
    const existingCoupon = await this.couponModel.findOne({ code: input.code });
    if (existingCoupon) {
      throw new BadRequestException('Coupon with this code already exists');
    }
    const coupon = new this.couponModel(input);
    return coupon.save();
  }

  async getCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponModel.findOne({ code });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async validateCoupon(code: string, cartTotal: number, userAgent?: string): Promise<Coupon> {
    const coupon = await this.getCouponByCode(code);

    this.validateStatus(coupon);
    this.validateValidityPeriod(coupon);
    this.validateUsageLimit(coupon);
    this.validateEligibility(coupon, cartTotal);
    if (userAgent) {
      this.validatePlatform(coupon, userAgent);
    }

    return coupon;
  }

  private detectPlatform(userAgent: string): string {
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) ? 'MOBILE' : 'DESKTOP';
  }

  private validatePlatform(coupon: Coupon, userAgent: string): void {
    const detectedPlatform = this.detectPlatform(userAgent);
    if (coupon.platform !== 'BOTH' && coupon.platform !== detectedPlatform) {
      throw new BadRequestException(`Coupon is only valid for ${coupon.platform.toLowerCase()} platform`);
    }
  }

  private validateStatus(coupon: Coupon): void {
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }
  }

  private validateValidityPeriod(coupon: Coupon): void {
    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (!coupon.hasInfiniteValidity && coupon.endDate && now > coupon.endDate) {
      throw new BadRequestException('Coupon is expired');
    }
  }

  private validateUsageLimit(coupon: Coupon): void {
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }
  }

  private validateEligibility(coupon: Coupon, cartTotal: number): void {
    if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
      throw new BadRequestException(
        `Minimum cart value of ${coupon.minCartValue} required`,
      );
    }
  }

  async incrementUsageCount(code: string): Promise<void> {
    await this.couponModel.updateOne({ code }, { $inc: { usageCount: 1 } });
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async deleteCoupon(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    await this.couponModel.findByIdAndDelete(id);
    return coupon;
  }

  async getActiveCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return this.couponModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        $or: [
          { hasInfiniteValidity: true },
          { endDate: { $gte: now } },
        ],
        $and: [
          {
            $or: [
              { usageLimit: { $exists: false } },
              { usageLimit: null },
              { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
            ],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}

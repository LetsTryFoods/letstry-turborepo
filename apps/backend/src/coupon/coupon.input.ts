import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { DiscountType, CouponPlatform } from './coupon.schema';

@InputType()
export class CreateCouponInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  code: string;

  @Field(() => DiscountType)
  discountType: DiscountType;

  @Field(() => Float)
  discountValue: number;

  @Field(() => Float, { nullable: true })
  minCartValue?: number;

  @Field(() => Float, { nullable: true })
  maxDiscountAmount?: number;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ defaultValue: false })
  hasInfiniteValidity?: boolean;

  @Field(() => CouponPlatform, { defaultValue: CouponPlatform.BOTH })
  platform?: CouponPlatform;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  usageLimit?: number;
}

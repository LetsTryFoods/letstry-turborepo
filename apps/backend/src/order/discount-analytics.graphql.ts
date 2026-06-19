import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

/**
 * Per-order discount analysis.
 *
 * Formula:
 *   impliedMRP         = subtotal / 0.70          (30% off MRP assumed)
 *   netRevenue         = subtotal + deliveryCharge - logisticsCost
 *   discountOnMRP      = impliedMRP - subtotal     (the 30% discount given)
 *   netCostToBusiness  = logisticsCost - deliveryCharge (delivery cost absorbed)
 *   netDiscountAmount  = discountOnMRP + netCostToBusiness
 *                      = impliedMRP - netRevenue   (total value given away)
 *   netDiscountPct     = (netDiscountAmount / impliedMRP) × 100
 */
@ObjectType()
export class OrderDiscountItem {
  @Field()
  orderId: string;       // custom ORD_xxx

  @Field({ nullable: true })
  orderNumber?: string;

  @Field(() => Float)
  subtotal: number;      // product revenue after 30% off (before delivery)

  @Field(() => Float)
  deliveryCharge: number; // delivery fee collected from customer (0 if free)

  @Field(() => Float)
  logisticsCost: number; // actual courier cost company paid (volumetric-weight based)

  @Field(() => Float)
  netRevenue: number;    // subtotal + deliveryCharge - logisticsCost

  @Field(() => Float)
  impliedMRP: number;    // subtotal / 0.70

  @Field(() => Float)
  discountOnMRP: number; // impliedMRP - subtotal (the 30% discount)

  @Field(() => Float)
  netCostToBusiness: number; // logisticsCost - deliveryCharge (delivery absorbed by company)

  @Field(() => Float)
  netDiscountAmount: number; // impliedMRP - netRevenue (total "given away")

  @Field(() => Float)
  netDiscountPct: number;    // netDiscountAmount / impliedMRP × 100

  // Optional box details
  @Field({ nullable: true })
  boxName?: string;

  @Field({ nullable: true })
  boxPhotoUrl?: string;

  @Field(() => Float, { nullable: true })
  volumetricWeight?: number;
}

@ObjectType()
export class OrderDiscountSummary {
  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  totalSubtotal: number;

  @Field(() => Float)
  totalDeliveryChargesCollected: number;

  @Field(() => Float)
  totalLogisticsCost: number;

  @Field(() => Float)
  totalNetRevenue: number;

  @Field(() => Float)
  impliedTotalMRP: number;

  @Field(() => Float)
  totalDiscountOnMRP: number;

  @Field(() => Float)
  totalNetCostToBusiness: number;

  @Field(() => Float)
  totalNetDiscountAmount: number;

  @Field(() => Float)
  avgNetDiscountPct: number;

  @Field(() => Int)
  freeDeliveryOrdersCount: number;

  @Field(() => Int)
  paidDeliveryOrdersCount: number;
}

@ObjectType()
export class OrderDiscountAnalyticsResponse {
  @Field(() => Int)
  month: number;

  @Field(() => Int)
  year: number;

  @Field(() => OrderDiscountSummary)
  summary: OrderDiscountSummary;

  @Field(() => [OrderDiscountItem])
  orders: OrderDiscountItem[];
}

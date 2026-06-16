import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { PackingEvidence } from './packing-evidence.type';

@ObjectType()
export class ItemDimensions {
  @Field(() => Float)
  length: number;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  height: number;

  @Field(() => Float)
  weight: number;

  @Field()
  unit: string;
}

@ObjectType()
export class PackingItem {
  @Field()
  productId: string;

  @Field()
  sku: string;

  @Field()
  ean: string;

  @Field()
  name: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int, { nullable: true })
  scannedCount?: number;

  @Field(() => Int, { nullable: true })
  shortCount?: number;

  @Field(() => Int, { nullable: true })
  shortComponentCount?: number;

  @Field(() => Float, { nullable: true })
  unitPrice?: number;

  @Field(() => ItemDimensions)
  dimensions: ItemDimensions;

  @Field()
  isFragile: boolean;

  @Field()
  imageUrl: string;
}

@ObjectType()
export class ShippingInfo {
  @Field()
  recipientName: string;

  @Field({ nullable: true })
  recipientPhone?: string;

  @Field()
  addressLine1: string;

  @Field({ nullable: true })
  addressLine2?: string;

  @Field()
  city: string;

  @Field()
  pincode: string;

  @Field()
  state: string;
}

@ObjectType()
export class ShipmentInfo {
  @Field({ nullable: true })
  awbNumber?: string;

  @Field({ nullable: true })
  provider?: string;
}

@ObjectType()
export class PackingOrder {
  @Field(() => ID)
  id: string;

  @Field()
  orderId: string;

  @Field()
  orderNumber: string;

  @Field()
  status: string;

  @Field(() => Float)
  priority: number;

  @Field({ nullable: true })
  assignedTo?: string;

  @Field({ nullable: true })
  packerName?: string;

  @Field({ nullable: true })
  assignedAt?: Date;

  @Field(() => [PackingItem])
  items: PackingItem[];

  @Field()
  hasErrors: boolean;

  @Field({ nullable: true })
  packingStartedAt?: Date;

  @Field({ nullable: true })
  packingCompletedAt?: Date;

  @Field(() => Float, { nullable: true })
  estimatedPackTime?: number;

  @Field({ nullable: true })
  specialInstructions?: string;

  @Field()
  isExpress: boolean;

  @Field(() => PackingEvidence, { nullable: true })
  evidence?: PackingEvidence;

  @Field(() => ShippingInfo, { nullable: true })
  shippingInfo?: ShippingInfo;

  @Field(() => ShipmentInfo, { nullable: true })
  shipmentInfo?: ShipmentInfo;
}


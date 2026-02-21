import {
  Field,
  ObjectType,
  InputType,
  registerEnumType,
  Int,
} from '@nestjs/graphql';
import { OrderStatus } from './order.schema';
import { PaginationMeta } from '../common/pagination';
import { PaymentStatus } from '../payment/entities/payment.schema';

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@ObjectType()
export class OrderPaymentType {
  @Field()
  _id: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field({ nullable: true })
  method?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field()
  amount: string;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  handlingCharge?: number;
}

@ObjectType()
export class OrderShippingAddressType {
  @Field()
  fullName: string;

  @Field()
  phone: string;

  @Field({ nullable: true })
  addressType?: string;

  @Field()
  addressLine1: string;

  @Field({ nullable: true })
  addressLine2?: string;

  @Field({ nullable: true })
  floor?: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  pincode: string;

  @Field({ nullable: true })
  landmark?: string;

  @Field({ nullable: true })
  formattedAddress?: string;

  @Field({ nullable: true })
  latitude?: number;

  @Field({ nullable: true })
  longitude?: number;
}

@ObjectType()
export class OrderCustomerType {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}

@ObjectType()
export class OrderItemType {
  @Field({ nullable: true })
  variantId?: string;

  @Field()
  quantity: number;

  @Field({ nullable: true })
  price?: string;

  @Field({ nullable: true })
  totalPrice?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  variant?: string;

  @Field({ nullable: true })
  image?: string;
}

@ObjectType()
export class OrderUserInfo {
  @Field()
  identityId: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  status: string;
}

@ObjectType()
export class BoxDimensionType {
  @Field()
  l: number;

  @Field()
  w: number;

  @Field()
  h: number;
}

@ObjectType()
export class OrderType {
  @Field()
  _id: string;

  @Field()
  orderId: string;

  @Field()
  identityId: string;

  @Field()
  paymentOrderId: string;

  @Field()
  cartId: string;

  @Field()
  totalAmount: string;

  @Field()
  subtotal: string;

  @Field()
  discount: string;

  @Field()
  deliveryCharge: string;

  @Field()
  currency: string;

  @Field(() => OrderStatus)
  orderStatus: OrderStatus;

  @Field({ nullable: true })
  shippingAddressId?: string;

  @Field(() => [OrderItemType])
  items: OrderItemType[];

  @Field(() => OrderPaymentType, { nullable: true })
  payment?: OrderPaymentType;

  @Field(() => OrderShippingAddressType, { nullable: true })
  shippingAddress?: OrderShippingAddressType;

  @Field(() => OrderCustomerType, { nullable: true })
  customer?: OrderCustomerType;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field({ nullable: true })
  trackingNumber?: string;

  @Field({ nullable: true })
  cancellationReason?: string;

  @Field({ nullable: true })
  estimatedWeight?: number;

  @Field(() => BoxDimensionType, { nullable: true })
  boxDimensions?: BoxDimensionType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}



@ObjectType()
export class OrderWithUserInfo extends OrderType {
  @Field(() => OrderUserInfo, { nullable: true })
  userInfo?: OrderUserInfo;
}

@ObjectType()
export class OrderStatusCount {
  @Field(() => Int)
  confirmed: number;

  @Field(() => Int)
  packed: number;

  @Field(() => Int)
  shipped: number;

  @Field(() => Int)
  inTransit: number;

  @Field(() => Int)
  delivered: number;

  @Field(() => Int)
  shipmentFailed: number;
}

@ObjectType()
export class OrdersSummary {
  @Field(() => Int)
  totalOrders: number;

  @Field()
  totalRevenue: string;

  @Field(() => OrderStatusCount)
  statusCounts: OrderStatusCount;
}

@ObjectType()
export class PaginatedOrdersResponse {
  @Field(() => [OrderType])
  orders: OrderType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@ObjectType()
export class AdminOrdersResponse {
  @Field(() => [OrderWithUserInfo])
  orders: OrderWithUserInfo[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;

  @Field(() => OrdersSummary)
  summary: OrdersSummary;
}

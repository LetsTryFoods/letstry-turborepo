import {
  Field,
  ObjectType,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { PaymentStatus, PaymentMethod } from '../entities/payment.schema';

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

@ObjectType()
export class PaymentEventType {
  @Field()
  _id: string;

  @Field()
  cartId: string;

  @Field()
  userId: string;

  @Field()
  totalAmount: string;

  @Field()
  currency: string;

  @Field()
  isPaymentDone: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaymentOrderType {
  @Field()
  _id: string;

  @Field()
  paymentOrderId: string;

  @Field()
  paymentEventId: string;

  @Field()
  identityId: string;

  @Field({ nullable: true })
  orderId?: string;

  @Field()
  amount: string;

  @Field()
  currency: string;

  @Field(() => PaymentStatus)
  paymentOrderStatus: PaymentStatus;

  @Field(() => PaymentMethod, { nullable: true })
  paymentMethod?: PaymentMethod;

  @Field({ nullable: true })
  pspTxnId?: string;

  @Field({ nullable: true })
  pspOrderId?: string;

  @Field({ nullable: true })
  pspToken?: string;

  @Field({ nullable: true })
  pspResponseMessage?: string;

  @Field({ nullable: true })
  failureReason?: string;

  @Field({ nullable: true })
  executedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class LedgerType {
  @Field()
  _id: string;

  @Field()
  transactionId: string;

  @Field()
  paymentOrderId: string;

  @Field()
  accountDebit: string;

  @Field()
  accountCredit: string;

  @Field()
  amount: string;

  @Field()
  currency: string;

  @Field()
  description: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PaymentRefundType {
  @Field()
  _id: string;

  @Field()
  refundId: string;

  @Field()
  paymentOrderId: string;

  @Field()
  refundAmount: string;

  @Field()
  currency: string;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => PaymentStatus)
  refundStatus: PaymentStatus;

  @Field({ nullable: true })
  pspRefundId?: string;

  @Field({ nullable: true })
  pspResponseMessage?: string;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class OrderType {
  @Field()
  _id: string;

  @Field()
  orderId: string;

  @Field()
  userId: string;

  @Field()
  paymentOrderId: string;

  @Field()
  cartId: string;

  @Field()
  totalAmount: string;

  @Field()
  currency: string;

  @Field()
  orderStatus: string;

  @Field({ nullable: true })
  shippingAddressId?: string;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}


@ObjectType()
export class InitiatePaymentResponse {
  @Field()
  paymentOrderId: string;

  @Field()
  redirectUrl: string;
}

@ObjectType()
export class PaymentStatusResponse {
  @Field()
  paymentOrderId: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field({ nullable: true })
  message?: string;

  @Field(() => PaymentOrderType)
  paymentOrder: PaymentOrderType;
}

@ObjectType()
export class RefundResponse {
  @Field()
  refundId: string;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field({ nullable: true })
  message?: string;
}

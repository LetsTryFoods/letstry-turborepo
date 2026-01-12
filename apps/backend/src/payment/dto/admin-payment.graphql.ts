import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PaymentOrderType, PaymentRefundType } from './payment.graphql';

@ObjectType()
export class PaymentListItemType {
  @Field()
  _id: string;

  @Field()
  paymentOrderId: string;

  @Field({ nullable: true })
  orderId?: string;

  @Field({ nullable: true })
  identityId?: string;

  @Field()
  amount: string;

  @Field()
  currency: string;

  @Field()
  paymentOrderStatus: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field({ nullable: true })
  pspTxnId?: string;
}

@ObjectType()
export class PaymentsSummaryType {
  @Field(() => Int)
  totalPayments: number;

  @Field()
  totalAmount: string;

  @Field()
  totalRefunded: string;

  @Field()
  successCount: number;

  @Field()
  failedCount: number;

  @Field()
  pendingCount: number;
}

@ObjectType()
export class PaymentsListResponse {
  @Field(() => [PaymentListItemType])
  payments: PaymentListItemType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => PaymentsSummaryType)
  summary: PaymentsSummaryType;
}

@ObjectType()
export class PaymentDetailType extends PaymentOrderType {
  @Field(() => [PaymentRefundType], { nullable: true })
  refunds?: PaymentRefundType[];

  @Field({ nullable: true })
  customerEmail?: string;

  @Field({ nullable: true })
  customerName?: string;
}

@ObjectType()
export class RefundInitiateResponse {
  @Field()
  success: boolean;

  @Field()
  refundId: string;

  @Field({ nullable: true })
  message?: string;
}

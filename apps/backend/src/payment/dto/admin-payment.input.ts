import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { PaymentStatus, PaymentMethod } from '../entities/payment.schema';

@InputType()
export class PaymentFiltersInput {
  @Field(() => [PaymentStatus], { nullable: true })
  @IsOptional()
  @IsEnum(PaymentStatus, { each: true })
  statuses?: PaymentStatus[];

  @Field(() => [PaymentMethod], { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod, { each: true })
  paymentMethods?: PaymentMethod[];

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  minAmount?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  maxAmount?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  identityId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orderId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchQuery?: string;
}

@InputType()
export class GetPaymentsListInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  page: number;

  @Field(() => Int, { defaultValue: 50 })
  @IsNumber()
  @Min(1)
  limit: number;

  @Field(() => PaymentFiltersInput, { nullable: true })
  @IsOptional()
  filters?: PaymentFiltersInput;
}

@InputType()
export class InitiateAdminRefundInput {
  @Field()
  @IsString()
  paymentOrderId: string;

  @Field()
  @IsString()
  refundAmount: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

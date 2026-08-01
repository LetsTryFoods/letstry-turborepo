import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Length,
} from 'class-validator';

@InputType()
export class InitiatePaymentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  cartId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(36, 36)
  idempotencyKey?: string;

  // UTM / attribution fields — sent from frontend on checkout
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utmTerm?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  utmContent?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sourceLabel?: string; // e.g. "Affiliate / Paisatrail"

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referrer?: string;
}

@InputType()
export class ProcessRefundInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  paymentOrderId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  refundAmount: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

@InputType()
export class CheckPaymentStatusInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  paymentOrderId: string;
}

@InputType()
export class BulkTransactionStatusInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  fromDate: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  toDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

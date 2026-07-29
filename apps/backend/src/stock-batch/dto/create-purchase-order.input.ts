import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreatePurchaseOrderInput {
  @Field()
  billNumber: string;

  @Field({ nullable: true })
  billDate?: string;

  @Field({ nullable: true })
  vendorName?: string;

  @Field({ nullable: true })
  vendorContact?: string;

  @Field(() => Float, { nullable: true })
  totalAmount?: number;

  @Field(() => [String], { nullable: true })
  billImageUrls?: string[];

  @Field({ nullable: true })
  performedBy?: string;

  @Field({ nullable: true })
  notes?: string;
}

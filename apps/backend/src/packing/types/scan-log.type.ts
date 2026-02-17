import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class ScanLog {
  @Field(() => ID)
  id: string;

  @Field()
  packingOrderId: string;

  @Field()
  packerId: string;

  @Field()
  ean: string;

  @Field()
  scannedAt: Date;

  @Field()
  isValid: boolean;

  @Field({ nullable: true })
  errorType?: string;

  @Field({ nullable: true })
  matchedProductId?: string;

  @Field({ nullable: true })
  matchedSku?: string;

  @Field(() => Int, { nullable: true })
  expectedQuantity?: number;

  @Field(() => Int, { nullable: true })
  scannedQuantity?: number;

  @Field()
  isRetrospective: boolean;

  @Field({ nullable: true })
  retrospectiveNotes?: string;

  @Field({ nullable: true })
  flaggedBy?: string;

  @Field({ nullable: true })
  flaggedAt?: Date;

  @Field({ nullable: true })
  itemName?: string;
}

import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class TrackingHistoryResponse {
  @Field(() => ID)
  id: string;

  @Field()
  shipmentId: string;

  @Field()
  statusCode: string;

  @Field()
  statusDescription: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  actionDate?: string;

  @Field({ nullable: true })
  actionTime?: string;

  @Field()
  actionDatetime: Date;

  @Field({ nullable: true })
  latitude?: number;

  @Field({ nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  remarks?: string;

  @Field({ nullable: true })
  nonDeliveryReason?: string;

  @Field()
  scdOtp: boolean;

  @Field()
  ndcOtp: boolean;

  @Field()
  createdAt: Date;
}

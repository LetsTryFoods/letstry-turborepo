import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PickupLocationType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  addressLine1?: string;

  @Field({ nullable: true })
  addressLine2?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  pincode?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field({ nullable: true })
  provider?: string;
}

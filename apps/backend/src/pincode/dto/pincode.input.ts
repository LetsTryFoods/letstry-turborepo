import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class PincodeInput {
  @Field()
  pincode: string;

  @Field()
  product: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  zone: string;

  @Field(() => Int)
  tat: number;
}

@ObjectType()
export class ServiceDetail {
  @Field()
  isDeliverable: boolean;

  @Field(() => Int, { nullable: true })
  estimatedDays?: number;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  zone?: string;
}

@ObjectType()
export class PincodeServiceabilityResult {
  @Field()
  isDeliverable: boolean;

  @Field(() => Int, { nullable: true })
  estimatedDays?: number;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field(() => ServiceDetail, { nullable: true })
  smartExpress?: ServiceDetail;

  @Field(() => ServiceDetail, { nullable: true })
  priority?: ServiceDetail;
}

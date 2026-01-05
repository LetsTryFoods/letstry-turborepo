import { ObjectType, Field, ID, Float, InputType } from '@nestjs/graphql';

@ObjectType()
@InputType('BoxDimensionsInput')
export class BoxDimensions {
  @Field(() => Float)
  l: number;

  @Field(() => Float)
  w: number;

  @Field(() => Float)
  h: number;
}

@ObjectType()
export class BoxSize {
  @Field(() => ID)
  id: string;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field(() => BoxDimensions)
  internalDimensions: BoxDimensions;

  @Field(() => Float)
  maxWeight: number;

  @Field(() => Float)
  cost: number;

  @Field()
  isActive: boolean;
}

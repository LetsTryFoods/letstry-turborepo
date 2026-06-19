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

  @Field(() => BoxDimensions, { nullable: true })
  internalDimensions?: BoxDimensions;

  @Field(() => Float, { nullable: true })
  maxWeight?: number;

  @Field(() => Float, { nullable: true })
  cost?: number;

  @Field(() => Float, { nullable: true })
  lengthInches?: number;

  @Field(() => Float, { nullable: true })
  breadthInches?: number;

  @Field(() => Float, { nullable: true })
  heightInches?: number;

  @Field(() => Float, { nullable: true })
  lengthCm?: number;

  @Field(() => Float, { nullable: true })
  breadthCm?: number;

  @Field(() => Float, { nullable: true })
  heightCm?: number;

  @Field(() => [String], { nullable: true })
  photos?: string[];

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}

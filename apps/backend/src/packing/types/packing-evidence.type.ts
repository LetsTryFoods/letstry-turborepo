import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { BoxDimensions } from '../../box-size/types/box-size.type';

@ObjectType()
export class BoxInfo {
  @Field()
  code: string;

  @Field(() => BoxDimensions)
  dimensions: BoxDimensions;
}

@ObjectType()
export class PackingEvidence {
  @Field(() => ID)
  id: string;

  @Field()
  packingOrderId: string;

  @Field()
  packerId: string;

  @Field(() => [String])
  prePackImages: string[];

  @Field(() => [String])
  postPackImages: string[];

  @Field(() => BoxInfo, { nullable: true })
  recommendedBox?: BoxInfo;

  @Field(() => BoxInfo, { nullable: true })
  actualBox?: BoxInfo;

  @Field()
  boxMismatch: boolean;

  @Field(() => BoxDimensions, { nullable: true })
  detectedBoxDimensions?: BoxDimensions;

  @Field(() => Float, { nullable: true })
  dimensionConfidence?: number;

  @Field()
  uploadedAt: Date;
}

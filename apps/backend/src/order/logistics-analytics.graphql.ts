import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class RegionStatsType {
  @Field()
  region: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  baseCost: number;

  @Field(() => Float)
  volumetricWeight: number;

  @Field(() => Float)
  totalCost: number;
}

@ObjectType()
export class BoxUsageType {
  @Field()
  boxId: string;

  @Field()
  boxName: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  costGenerated: number;
}

@ObjectType()
export class LogisticsAnalyticsResponse {
  @Field(() => Int)
  month: number;

  @Field(() => Int)
  year: number;

  @Field(() => Float)
  totalCost: number;

  @Field(() => Float)
  totalBaseCost: number;

  @Field(() => Float)
  fuelCharge: number;

  @Field(() => Float)
  fovCharge: number;

  @Field(() => Float)
  gstCharge: number;

  @Field(() => Float)
  totalVolumetricWeight: number;

  @Field(() => Int)
  totalBoxesUsed: number;

  @Field(() => [RegionStatsType])
  regionStats: RegionStatsType[];

  @Field(() => [BoxUsageType])
  boxUsage: BoxUsageType[];

  @Field(() => BoxUsageType, { nullable: true })
  mostUsedBox?: BoxUsageType;

  @Field(() => BoxUsageType, { nullable: true })
  leastUsedBox?: BoxUsageType;
}

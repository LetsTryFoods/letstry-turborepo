import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class SearchTypeBreakdown {
  @Field()
  _id: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class RecentSearch {
  @Field()
  id: string;

  @Field()
  searchQuery: string;

  @Field()
  searchType: string;

  @Field()
  foundResult: boolean;

  @Field()
  createdAt: string;

  @Field()
  userAgent: string;

  @Field()
  ipAddress: string;
}

@ObjectType()
export class TrackingAnalyticsResponse {
  @Field(() => Int)
  totalSearches: number;

  @Field(() => Int)
  successfulSearches: number;

  @Field(() => Float)
  successRate: number;

  @Field(() => [SearchTypeBreakdown])
  searchTypeBreakdown: SearchTypeBreakdown[];

  @Field(() => [RecentSearch])
  recentSearches: RecentSearch[];
}
import { ObjectType, Field, ID, Int, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class PressMention {
  @Field(() => ID) _id: string;
  @Field() slug: string;
  @Field() publication: string;
  @Field({ nullable: true }) publicationLogoUrl?: string;
  @Field() headline: string;
  @Field() url: string;
  @Field({ nullable: true }) excerpt?: string;
  @Field({ nullable: true }) coverImageUrl?: string;
  @Field(() => GraphQLISODateTime) publishedAt: Date;
  @Field({ nullable: true }) category?: string;
  @Field() isActive: boolean;
  @Field(() => Int) position: number;
  @Field(() => GraphQLISODateTime) createdAt: Date;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
}

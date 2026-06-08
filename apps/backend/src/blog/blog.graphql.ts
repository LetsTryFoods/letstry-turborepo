import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { SeoBase } from '../seo-core/seo-base.schema';

@ObjectType()
export class Blog {
  @Field(() => ID)
  _id: string;

  @Field()
  slug: string;

  @Field()
  title: string;

  @Field()
  excerpt: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  date?: string;

  @Field()
  author: string;

  @Field({ nullable: true })
  authorId?: string;

  @Field()
  category: string;

  @Field(() => [String], { nullable: true })
  pillarSlugs?: string[];

  @Field(() => [String], { nullable: true })
  mentionedProductIds?: string[];

  @Field(() => Number, { nullable: true })
  readingTimeMinutes?: number;

  @Field(() => SeoBase, { nullable: true })
  seo?: SeoBase;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => Number, { nullable: true })
  position?: number;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

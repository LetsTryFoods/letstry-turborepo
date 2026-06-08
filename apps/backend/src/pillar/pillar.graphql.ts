import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { SeoBase } from '../seo-core/seo-base.schema';

@ObjectType()
export class PillarSectionType {
  @Field() heading: string;
  @Field() body: string;
  @Field({ nullable: true }) speakable?: boolean;
  @Field(() => [String], { nullable: true }) featuredProductIds?: string[];
}

@ObjectType()
export class PillarFaqEntryType {
  @Field() question: string;
  @Field() answer: string;
}

@ObjectType()
export class PillarCategoryTileType {
  @Field() categorySlug: string;
  @Field() name: string;
  @Field() blurb: string;
}

@ObjectType()
export class Pillar {
  @Field(() => ID) _id: string;
  @Field() slug: string;
  @Field({ nullable: true }) customRoute?: string;
  @Field() title: string;
  @Field() intro: string;
  @Field({ nullable: true }) heroImageUrl?: string;
  @Field(() => [PillarCategoryTileType])
  categoryTiles: PillarCategoryTileType[];
  @Field(() => [String]) featuredProductIds: string[];
  @Field(() => [PillarSectionType]) sections: PillarSectionType[];
  @Field(() => [PillarFaqEntryType]) faqs: PillarFaqEntryType[];
  @Field(() => [String]) relatedPillarSlugs: string[];
  @Field() isActive: boolean;
  @Field(() => Int) position: number;
  @Field(() => SeoBase, { nullable: true }) seo?: SeoBase;
  @Field(() => GraphQLISODateTime) createdAt: Date;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
}

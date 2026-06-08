import {
  ObjectType,
  InputType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { SeoBase } from '../seo-core/seo-base.schema';

// ─── Output types ────────────────────────────────────────────────────────────

@ObjectType()
export class CategoryTileType {
  @Field()
  name: string;

  @Field({ nullable: true })
  blurb?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  shopNowUrl: string;

  @Field(() => Int)
  position: number;
}

@ObjectType()
export class CategoryFaqType {
  @Field()
  question: string;

  @Field()
  answer: string;

  @Field(() => Int)
  position: number;
}

@ObjectType()
export class CategoryLandingPageType {
  @Field(() => ID)
  _id: string;

  @Field()
  slug: string;

  @Field()
  pageTitle: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  tilesHeading?: string;

  @Field({ nullable: true })
  faqHeading?: string;

  @Field(() => [CategoryTileType])
  tiles: CategoryTileType[];

  @Field(() => [CategoryFaqType])
  faqs: CategoryFaqType[];

  @Field(() => SeoBase, { nullable: true })
  seo?: SeoBase;

  @Field()
  isActive: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

// ─── Input types ─────────────────────────────────────────────────────────────

@InputType()
export class CategoryTileInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  blurb?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  shopNowUrl: string;

  @Field(() => Int, { nullable: true })
  position?: number;
}

@InputType()
export class CategoryFaqInput {
  @Field()
  question: string;

  @Field()
  answer: string;

  @Field(() => Int, { nullable: true })
  position?: number;
}

@InputType()
export class CategoryLandingPageSeoInput {
  @Field({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  metaDescription?: string;

  @Field(() => [String], { nullable: true })
  metaKeywords?: string[];

  @Field({ nullable: true })
  canonicalUrl?: string;

  @Field({ nullable: true })
  ogTitle?: string;

  @Field({ nullable: true })
  ogDescription?: string;

  @Field({ nullable: true })
  ogImage?: string;
}

@InputType()
export class CreateCategoryLandingPageInput {
  @Field()
  slug: string;

  @Field()
  pageTitle: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  tilesHeading?: string;

  @Field({ nullable: true })
  faqHeading?: string;

  @Field(() => [CategoryTileInput], { nullable: true })
  tiles?: CategoryTileInput[];

  @Field(() => [CategoryFaqInput], { nullable: true })
  faqs?: CategoryFaqInput[];

  @Field(() => CategoryLandingPageSeoInput, { nullable: true })
  seo?: CategoryLandingPageSeoInput;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class UpdateCategoryLandingPageInput {
  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  pageTitle?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  tilesHeading?: string;

  @Field({ nullable: true })
  faqHeading?: string;

  @Field(() => [CategoryTileInput], { nullable: true })
  tiles?: CategoryTileInput[];

  @Field(() => [CategoryFaqInput], { nullable: true })
  faqs?: CategoryFaqInput[];

  @Field(() => CategoryLandingPageSeoInput, { nullable: true })
  seo?: CategoryLandingPageSeoInput;

  @Field({ nullable: true })
  isActive?: boolean;
}

import { InputType, Field, Int } from '@nestjs/graphql';
import { SeoBaseInput } from '../seo-core/seo-base.input';

@InputType()
export class PillarSectionInput {
  @Field() heading: string;
  @Field() body: string;
  @Field({ nullable: true }) speakable?: boolean;
  @Field(() => [String], { nullable: true }) featuredProductIds?: string[];
}

@InputType()
export class PillarFaqEntryInput {
  @Field() question: string;
  @Field() answer: string;
}

@InputType()
export class PillarCategoryTileInput {
  @Field() categorySlug: string;
  @Field() name: string;
  @Field() blurb: string;
}

@InputType()
export class CreatePillarInput {
  @Field() slug: string;
  @Field({ nullable: true }) customRoute?: string;
  @Field() title: string;
  @Field() intro: string;
  @Field({ nullable: true }) heroImageUrl?: string;
  @Field(() => [PillarCategoryTileInput], { nullable: true }) categoryTiles?: PillarCategoryTileInput[];
  @Field(() => [String], { nullable: true }) featuredProductIds?: string[];
  @Field(() => [PillarSectionInput], { nullable: true }) sections?: PillarSectionInput[];
  @Field(() => [PillarFaqEntryInput], { nullable: true }) faqs?: PillarFaqEntryInput[];
  @Field(() => [String], { nullable: true }) relatedPillarSlugs?: string[];
  @Field({ nullable: true }) isActive?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field(() => SeoBaseInput, { nullable: true }) seo?: SeoBaseInput;
}

@InputType()
export class UpdatePillarInput {
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) customRoute?: string;
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) intro?: string;
  @Field({ nullable: true }) heroImageUrl?: string;
  @Field(() => [PillarCategoryTileInput], { nullable: true }) categoryTiles?: PillarCategoryTileInput[];
  @Field(() => [String], { nullable: true }) featuredProductIds?: string[];
  @Field(() => [PillarSectionInput], { nullable: true }) sections?: PillarSectionInput[];
  @Field(() => [PillarFaqEntryInput], { nullable: true }) faqs?: PillarFaqEntryInput[];
  @Field(() => [String], { nullable: true }) relatedPillarSlugs?: string[];
  @Field({ nullable: true }) isActive?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
  @Field(() => SeoBaseInput, { nullable: true }) seo?: SeoBaseInput;
}

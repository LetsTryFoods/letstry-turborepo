import { InputType, Field, ID } from '@nestjs/graphql';
import { SeoBaseInput } from '../seo-core/seo-base.input';

@InputType()
export class CategoryFaqEntryInput {
  @Field()
  question: string;

  @Field()
  answer: string;
}

@InputType()
export class CreateCategoryInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  favourite?: boolean;

  @Field({ nullable: true })
  mobile?: boolean;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  mobileImageUrl?: string;

  @Field({ nullable: true })
  codeValue?: string;

  @Field({ nullable: true })
  inCodeSet?: string;

  @Field({ nullable: true })
  isArchived?: boolean;

  // ---- Sprint 4 rich content ---------------------------------------------
  @Field({ nullable: true }) longDescription?: string;
  @Field({ nullable: true }) editorialIntro?: string;
  @Field(() => [CategoryFaqEntryInput], { nullable: true }) categoryFaqs?: CategoryFaqEntryInput[];
  @Field(() => [String], { nullable: true }) featuredProductIds?: string[];
  @Field(() => [String], { nullable: true }) pillarSlugs?: string[];
  @Field(() => [String], { nullable: true }) editorialHighlights?: string[];

  @Field(() => SeoBaseInput, { nullable: true })
  seo?: SeoBaseInput;
}

@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  favourite?: boolean;

  @Field({ nullable: true })
  mobile?: boolean;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  mobileImageUrl?: string;

  @Field({ nullable: true })
  codeValue?: string;

  @Field({ nullable: true })
  inCodeSet?: string;

  @Field({ nullable: true })
  isArchived?: boolean;

  // ---- Sprint 4 rich content (all optional on update) --------------------
  @Field({ nullable: true }) longDescription?: string;
  @Field({ nullable: true }) editorialIntro?: string;
  @Field(() => [CategoryFaqEntryInput], { nullable: true }) categoryFaqs?: CategoryFaqEntryInput[];
  @Field(() => [String], { nullable: true }) featuredProductIds?: string[];
  @Field(() => [String], { nullable: true }) pillarSlugs?: string[];
  @Field(() => [String], { nullable: true }) editorialHighlights?: string[];

  @Field(() => SeoBaseInput, { nullable: true })
  seo?: SeoBaseInput;
}

@InputType()
export class AddProductsToCategoryInput {
  @Field(() => ID)
  categoryId: string;

  @Field(() => [ID])
  productIds: string[];
}

@InputType()
export class RemoveProductsFromCategoryInput {
  @Field(() => ID)
  categoryId: string;

  @Field(() => [ID])
  productIds: string[];
}

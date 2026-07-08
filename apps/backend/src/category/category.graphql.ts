import { ObjectType, Field, ID } from '@nestjs/graphql';
import { SeoBase } from '../seo-core/seo-base.schema';

@ObjectType()
export class CategoryFaqEntry {
  @Field()
  question: string;

  @Field()
  answer: string;
}

@ObjectType()
export class Category {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  favourite?: boolean;

  @Field({ nullable: true })
  mobile?: boolean;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  mobileImageUrl?: string;

  @Field({ nullable: true })
  codeValue?: string;

  @Field({ nullable: true })
  inCodeSet?: string;

  @Field()
  productCount: number;

  @Field()
  isArchived: boolean;

  // ---- Sprint 4 rich content ---------------------------------------------
  @Field({ nullable: true }) longDescription?: string;
  @Field({ nullable: true }) editorialIntro?: string;
  @Field(() => [CategoryFaqEntry], { nullable: true })
  categoryFaqs?: CategoryFaqEntry[];
  @Field(() => [String], { nullable: true }) featuredProductIds?: string[];
  @Field(() => [String], { nullable: true }) productOrder?: string[];
  @Field(() => [String], { nullable: true }) pillarSlugs?: string[];
  @Field(() => [String], { nullable: true }) editorialHighlights?: string[];

  @Field(() => SeoBase, { nullable: true })
  seo?: SeoBase;

  @Field(() => [require('../product/product.graphql').Product], {
    nullable: true,
  })
  products?: any[];

  @Field(() => [Category], { nullable: true })
  children?: Category[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

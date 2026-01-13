import { InputType, Field, ID } from '@nestjs/graphql';
import { SeoBaseInput } from '../seo-core/seo-base.input';

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

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  codeValue?: string;

  @Field({ nullable: true })
  inCodeSet?: string;

  @Field({ nullable: true })
  isArchived?: boolean;

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

  @Field(() => String, { nullable: true })
  parentId?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  codeValue?: string;

  @Field({ nullable: true })
  inCodeSet?: string;

  @Field({ nullable: true })
  isArchived?: boolean;

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

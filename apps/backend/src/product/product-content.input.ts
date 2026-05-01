/**
 * GraphQL input types mirroring the rich-content sub-schemas.
 */

import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ProductNutritionInput {
  @Field({ nullable: true })
  servingSize?: string;

  @Field({ nullable: true })
  servingsPerPack?: string;

  @Field({ nullable: true })
  calories?: string;

  @Field({ nullable: true })
  caloriesPerServing?: string;

  @Field({ nullable: true })
  fatContent?: string;

  @Field({ nullable: true })
  saturatedFatContent?: string;

  @Field({ nullable: true })
  transFatContent?: string;

  @Field({ nullable: true })
  cholesterolContent?: string;

  @Field({ nullable: true })
  sodiumContent?: string;

  @Field({ nullable: true })
  carbohydrateContent?: string;

  @Field({ nullable: true })
  fiberContent?: string;

  @Field({ nullable: true })
  sugarContent?: string;

  @Field({ nullable: true })
  proteinContent?: string;

  @Field({ nullable: true })
  ironContent?: string;

  @Field({ nullable: true })
  calciumContent?: string;
}

@InputType()
export class LifestyleImageInput {
  @Field()
  url: string;

  @Field()
  alt: string;

  @Field({ nullable: true })
  caption?: string;
}

@InputType()
export class ProductFaqEntryInput {
  @Field()
  question: string;

  @Field()
  answer: string;
}

@InputType()
export class ProductHighlightInput {
  @Field()
  text: string;
}

@InputType()
export class ProductCertificationInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  number?: string;

  @Field({ nullable: true })
  iconUrl?: string;
}

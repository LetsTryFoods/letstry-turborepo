import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class SectionPlatformLinkInput {
  @Field()
  platform: string;

  @Field()
  url: string;
}

@InputType()
export class LandingPageSectionInput {
  @Field()
  type: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  buttonText?: string;

  @Field({ nullable: true })
  buttonLink?: string;

  @Field(() => [String], { nullable: true })
  productSlugs?: string[];

  @Field(() => [SectionPlatformLinkInput], { nullable: true })
  platformLinks?: SectionPlatformLinkInput[];

  @Field({ nullable: true })
  backgroundColor?: string;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class LandingPageSeoInput {
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
export class CreateLandingPageInput {
  @Field()
  slug: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => [LandingPageSectionInput], { nullable: true })
  sections?: LandingPageSectionInput[];

  @Field(() => LandingPageSeoInput, { nullable: true })
  seo?: LandingPageSeoInput;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  position?: number;
}

@InputType()
export class UpdateLandingPageInput {
  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => [LandingPageSectionInput], { nullable: true })
  sections?: LandingPageSectionInput[];

  @Field(() => LandingPageSeoInput, { nullable: true })
  seo?: LandingPageSeoInput;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  position?: number;
}

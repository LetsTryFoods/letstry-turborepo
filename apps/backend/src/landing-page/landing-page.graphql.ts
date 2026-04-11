import { ObjectType, Field, ID, GraphQLISODateTime, Int } from '@nestjs/graphql';
import { SeoBase } from '../seo-core/seo-base.schema';

@ObjectType()
export class SectionPlatformLink {
  @Field()
  platform: string;

  @Field()
  url: string;
}

@ObjectType()
export class LandingPageSection {
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

  @Field(() => [String])
  productSlugs: string[];

  @Field(() => [SectionPlatformLink])
  platformLinks: SectionPlatformLink[];

  @Field({ nullable: true })
  backgroundColor?: string;

  @Field(() => Int)
  position: number;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class LandingPage {
  @Field(() => ID)
  _id: string;

  @Field()
  slug: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => [LandingPageSection])
  sections: LandingPageSection[];

  @Field(() => SeoBase, { nullable: true })
  seo?: SeoBase;

  @Field()
  isActive: boolean;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

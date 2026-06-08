import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field } from '@nestjs/graphql';

@Schema({ _id: false })
@ObjectType()
export class SeoBase {
  @Prop()
  @Field({ nullable: true })
  metaTitle?: string;

  @Prop()
  @Field({ nullable: true })
  metaDescription?: string;

  @Prop({ type: [String], default: [] })
  @Field(() => [String], { nullable: true })
  metaKeywords?: string[];

  @Prop()
  @Field({ nullable: true })
  canonicalUrl?: string;

  @Prop()
  @Field({ nullable: true })
  ogTitle?: string;

  @Prop()
  @Field({ nullable: true })
  ogDescription?: string;

  @Prop()
  @Field({ nullable: true })
  ogImage?: string;

  // ---- Sprint 4 additions ------------------------------------------------
  // Allow content team to override Twitter card without rebuilding the
  // whole metadata block; defaults to summary_large_image when unset.
  @Prop()
  @Field({ nullable: true })
  twitterCard?: string;

  @Prop()
  @Field({ nullable: true })
  twitterTitle?: string;

  @Prop()
  @Field({ nullable: true })
  twitterDescription?: string;

  @Prop()
  @Field({ nullable: true })
  twitterImage?: string;

  // Per-page robots directive. Empty = use defaults from layout.
  // Values like 'noindex' or 'noindex, nofollow' supported.
  @Prop()
  @Field({ nullable: true })
  robots?: string;

  // Optional human-readable note for the content team to record why
  // certain SEO choices were made (e.g. "Title kept short for kid-search").
  // Never rendered to the public site.
  @Prop()
  @Field({ nullable: true })
  internalNote?: string;
}

export const SeoBaseSchema = SchemaFactory.createForClass(SeoBase);

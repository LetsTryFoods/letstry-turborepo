/**
 * Product page rich-content sub-schemas.
 *
 * These fields are CMS-authored content that powers the rich product
 * detail page on the storefront and feeds Product / NutritionInformation /
 * VideoObject schema. They sit alongside (not replacing) the existing
 * structural product fields (name, slug, variants, etc.).
 *
 * Every field is optional — the storefront template hides empty sections
 * gracefully so a content team can fill them progressively.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType, Field, Float } from '@nestjs/graphql';

// ---------------------------------------------------------------------------
// NutritionInformation — Schema.org NutritionInformation maps to these.
// All optional; emit as schema only when content team fills the values.
// ---------------------------------------------------------------------------
@Schema({ _id: false })
@ObjectType()
export class ProductNutrition {
  @Prop()
  @Field({ nullable: true })
  servingSize?: string; // e.g. "30g"

  @Prop()
  @Field({ nullable: true })
  servingsPerPack?: string;

  @Prop()
  @Field({ nullable: true })
  calories?: string; // "540 kcal" (per 100g)

  @Prop()
  @Field({ nullable: true })
  caloriesPerServing?: string;

  @Prop()
  @Field({ nullable: true })
  fatContent?: string;

  @Prop()
  @Field({ nullable: true })
  saturatedFatContent?: string;

  @Prop()
  @Field({ nullable: true })
  transFatContent?: string;

  @Prop()
  @Field({ nullable: true })
  cholesterolContent?: string;

  @Prop()
  @Field({ nullable: true })
  sodiumContent?: string;

  @Prop()
  @Field({ nullable: true })
  carbohydrateContent?: string;

  @Prop()
  @Field({ nullable: true })
  fiberContent?: string;

  @Prop()
  @Field({ nullable: true })
  sugarContent?: string;

  @Prop()
  @Field({ nullable: true })
  proteinContent?: string;

  @Prop()
  @Field({ nullable: true })
  ironContent?: string;

  @Prop()
  @Field({ nullable: true })
  calciumContent?: string;
}

export const ProductNutritionSchema =
  SchemaFactory.createForClass(ProductNutrition);

// ---------------------------------------------------------------------------
// Lifestyle image — separate from variant images. These are usage / pairing
// shots used in the gallery. Each has its own alt for accessibility + SEO.
// ---------------------------------------------------------------------------
@Schema({ _id: false })
@ObjectType()
export class LifestyleImage {
  @Prop({ required: true })
  @Field()
  url: string;

  @Prop({ required: true })
  @Field()
  alt: string;

  @Prop()
  @Field({ nullable: true })
  caption?: string;
}

export const LifestyleImageSchema = SchemaFactory.createForClass(LifestyleImage);

// ---------------------------------------------------------------------------
// CMS-authored product FAQ. Supplements the data-driven FAQ generator.
// ---------------------------------------------------------------------------
@Schema({ _id: false })
@ObjectType()
export class ProductFaqEntry {
  @Prop({ required: true })
  @Field()
  question: string;

  @Prop({ required: true })
  @Field()
  answer: string;
}

export const ProductFaqEntrySchema = SchemaFactory.createForClass(ProductFaqEntry);

// ---------------------------------------------------------------------------
// Pros / cons (positiveNotes / negativeNotes in Schema.org).
// ---------------------------------------------------------------------------
@Schema({ _id: false })
@ObjectType()
export class ProductHighlight {
  @Prop({ required: true })
  @Field()
  text: string;
}

export const ProductHighlightSchema =
  SchemaFactory.createForClass(ProductHighlight);

// ---------------------------------------------------------------------------
// Certification or award the product holds (FSSAI license, Org. India,
// India Organic, FSSC 22000, etc.). Surfaces as Schema.org award + visible
// trust badge on the PDP.
// ---------------------------------------------------------------------------
@Schema({ _id: false })
@ObjectType()
export class ProductCertification {
  @Prop({ required: true })
  @Field()
  name: string;

  @Prop()
  @Field({ nullable: true })
  number?: string;

  @Prop()
  @Field({ nullable: true })
  iconUrl?: string;
}

export const ProductCertificationSchema =
  SchemaFactory.createForClass(ProductCertification);

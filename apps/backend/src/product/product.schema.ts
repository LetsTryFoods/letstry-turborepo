import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ObjectType,
  Field,
  ID,
  Float,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { ProductSeo } from './product-seo.schema';
import {
  ProductNutrition,
  ProductNutritionSchema,
  LifestyleImage,
  LifestyleImageSchema,
  ProductFaqEntry,
  ProductFaqEntrySchema,
  ProductHighlight,
  ProductHighlightSchema,
  ProductCertification,
  ProductCertificationSchema,
} from './product-content.schema';

export type ProductDocument = Product & Document;

@ObjectType()
export class ProductImage {
  @Field()
  url: string;

  @Field()
  alt: string;
}

@Schema({ _id: true })
@ObjectType()
export class ProductVariant {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true })
  @Field()
  sku: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ required: true })
  @Field(() => Float)
  price: number;

  @Prop({ required: true })
  @Field(() => Float)
  mrp: number;

  @Prop({ required: true })
  @Field(() => Float)
  discountPercent: number;

  @Prop({ required: true, default: 'product' })
  @Field()
  discountSource: string;

  @Prop({ required: true })
  @Field(() => Float)
  weight: number;

  @Prop({ required: true })
  @Field()
  weightUnit: string;

  @Prop({ required: true })
  @Field()
  packageSize: string;

  @Prop({ required: true })
  @Field(() => Float)
  length: number;

  @Prop({ required: true })
  @Field(() => Float)
  height: number;

  @Prop({ required: true })
  @Field(() => Float)
  breadth: number;

  @Prop({ required: true, default: 0 })
  @Field(() => Int)
  stockQuantity: number;

  @Prop({ required: true, default: 'in_stock' })
  @Field()
  availabilityStatus: string;

  @Prop({ type: [{ url: String, alt: String }], required: true })
  @Field(() => [ProductImage])
  images: ProductImage[];

  @Prop({ required: true })
  @Field()
  thumbnailUrl: string;

  @Prop({ required: true, default: false })
  @Field()
  isDefault: boolean;

  @Prop({ required: true, default: true })
  @Field()
  isActive: boolean;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

@Schema({ timestamps: true })
@ObjectType()
export class Product {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ nullable: true })
  @Field({ nullable: true })
  favourite?: boolean;

  @Prop({ required: true, unique: true })
  @Field()
  slug: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  description?: string;

  @Prop({ type: [String], required: true, default: [] })
  @Field(() => [String])
  categoryIds: string[];

  @Prop({ required: true })
  @Field()
  brand: string;

  @Prop()
  @Field({ nullable: true })
  gtin?: string;

  @Prop()
  @Field({ nullable: true })
  mpn?: string;

  @Prop({ required: true, default: 'INR' })
  @Field()
  currency: string;

  @Prop({ required: true })
  @Field()
  ingredients: string;

  @Prop()
  @Field({ nullable: true })
  allergens?: string;

  @Prop({ required: true })
  @Field()
  shelfLife: string;

  @Prop({ required: true, default: true })
  @Field()
  isVegetarian: boolean;

  @Prop({ required: true, default: false })
  @Field()
  isGlutenFree: boolean;

  @Prop({
    type: [ProductVariantSchema],
    required: true,
  })
  @Field(() => [ProductVariant])
  variants: ProductVariant[];

  @Prop({ type: Number })
  @Field(() => Float, { nullable: true })
  rating?: number;

  @Prop({ type: Number, default: 0 })
  @Field(() => Int)
  ratingCount: number;

  @Prop({ type: [String], default: [] })
  @Field(() => [String])
  keywords: string[];

  @Prop({ type: [String], default: [] })
  @Field(() => [String])
  tags: string[];

  @Prop({ default: false })
  @Field()
  isArchived: boolean;

  // -------------------------------------------------------------------------
  // Sprint 4 — rich CMS content for SEO / AEO. All optional; storefront
  // hides empty sections. Filling these is the content team's primary job.
  // -------------------------------------------------------------------------

  // Long-form description shown below the gallery (HTML / rich text).
  // Aim 300-800 words per product, woven with target keywords.
  @Prop()
  @Field({ nullable: true })
  longDescription?: string;

  // "Why eat this" — health benefit bullet points (HTML).
  @Prop()
  @Field({ nullable: true })
  healthBenefits?: string;

  // "How to enjoy" — pairing & serving suggestions (HTML).
  @Prop()
  @Field({ nullable: true })
  servingSuggestions?: string;

  // Storage instructions ("Store in a cool, dry place. Reseal after opening.")
  @Prop()
  @Field({ nullable: true })
  storageInstructions?: string;

  // Origin / sourcing story (HTML).
  @Prop()
  @Field({ nullable: true })
  originStory?: string;

  // Manufacturing-process narrative ("roasted, not fried", "stone-ground").
  @Prop()
  @Field({ nullable: true })
  manufacturingProcess?: string;

  // Audience the product is designed for. Surfaces as Schema.org audience.
  // Suggested values: kids, adults, fitness, vrat-observers, diabetics,
  // gifting, corporate-gifting, family-snacking.
  @Prop({ type: [String], default: [] })
  @Field(() => [String], { nullable: true })
  audience?: string[];

  // Use cases / occasions ("Diwali gifting", "Navratri vrat", "tea-time",
  // "post-workout"). Drives festival/seasonal landing pages.
  @Prop({ type: [String], default: [] })
  @Field(() => [String], { nullable: true })
  occasions?: string[];

  // Pros — Schema.org positiveNotes. 3-5 short claims, e.g. "100% groundnut
  // oil", "No palm oil", "High-protein".
  @Prop({ type: [ProductHighlightSchema], default: [] })
  @Field(() => [ProductHighlight], { nullable: true })
  pros?: ProductHighlight[];

  // Cons — Schema.org negativeNotes. Honest disclosures (e.g. "Contains
  // tree nuts" for Purani Delhi, "Contains maida" for rusk). Honest
  // disclosure is required by the brand-claim matrix.
  @Prop({ type: [ProductHighlightSchema], default: [] })
  @Field(() => [ProductHighlight], { nullable: true })
  cons?: ProductHighlight[];

  // Certifications & awards (FSSAI, India Organic, FSSC 22000).
  @Prop({ type: [ProductCertificationSchema], default: [] })
  @Field(() => [ProductCertification], { nullable: true })
  certifications?: ProductCertification[];

  // Lifestyle / usage shots that live alongside variant packshots.
  @Prop({ type: [LifestyleImageSchema], default: [] })
  @Field(() => [LifestyleImage], { nullable: true })
  lifestyleImages?: LifestyleImage[];

  // Embed URL for product video (YouTube / Vimeo / hosted). Drives
  // Schema.org VideoObject when present.
  @Prop()
  @Field({ nullable: true })
  videoUrl?: string;

  @Prop()
  @Field({ nullable: true })
  videoTitle?: string;

  @Prop()
  @Field({ nullable: true })
  videoDescription?: string;

  @Prop()
  @Field({ nullable: true })
  videoThumbnailUrl?: string;

  // CMS-authored FAQs — supplement the data-driven FAQ generator. When set,
  // these appear ALONGSIDE the auto-generated questions and are emitted into
  // FAQPage schema.
  @Prop({ type: [ProductFaqEntrySchema], default: [] })
  @Field(() => [ProductFaqEntry], { nullable: true })
  productFaqs?: ProductFaqEntry[];

  // Pillar pages this product belongs to (slugs). Drives breadcrumbs
  // (Home > Pillar > Category > Product) and "featured products" on
  // pillar templates. Example: ['no-palm-oil-snacks', 'palm-oil-free-namkeen']
  @Prop({ type: [String], default: [] })
  @Field(() => [String], { nullable: true })
  pillarSlugs?: string[];

  // Related-product picker. When empty, storefront falls back to
  // same-category siblings.
  @Prop({ type: [String], default: [] })
  @Field(() => [String], { nullable: true })
  relatedProductIds?: string[];

  // Frequently-bought-together / bundle suggestions.
  @Prop({ type: [String], default: [] })
  @Field(() => [String], { nullable: true })
  bundleProductIds?: string[];

  // Per-product nutrition table (Schema.org NutritionInformation).
  @Prop({ type: ProductNutritionSchema, default: null })
  @Field(() => ProductNutrition, { nullable: true })
  nutrition?: ProductNutrition;

  // FSSAI license number specific to this product / batch (different from
  // the org-level license shown in the footer).
  @Prop()
  @Field({ nullable: true })
  fssaiLicense?: string;

  // Country of origin (ISO 3166-1 alpha-2). Defaults handled in the
  // storefront when unset; emit explicitly for export-eligible SKUs.
  @Prop()
  @Field({ nullable: true })
  countryOfOrigin?: string;

  // Override per-variant delivery lead time (in days, single value or
  // 'min-max' range). Surfaces as Offer.deliveryLeadTime in JSON-LD.
  @Prop()
  @Field({ nullable: true })
  deliveryLeadTime?: string;

  @Field(() => ProductSeo, { nullable: true })
  seo?: ProductSeo;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('id').get(function (this: any) {
  return this._id?.toString();
});

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_: any, ret: any) {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    delete ret.__v;
  },
});

ProductSchema.index({ categoryIds: 1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ 'variants._id': 1 });
ProductSchema.index({ keywords: 1 });
ProductSchema.index({ 'variants.availabilityStatus': 1 });
ProductSchema.index({ createdAt: -1 });

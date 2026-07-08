import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SeoBase, SeoBaseSchema } from '../seo-core/seo-base.schema';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: Boolean, default: false, index: true })
  favourite: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  mobile: boolean;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: String, default: null, index: true })
  parentId: string | undefined;

  @Prop()
  imageUrl: string;

  @Prop({ required: false })
  mobileImageUrl?: string;

  @Prop({ required: false })
  codeValue?: string;

  @Prop({ required: false })
  inCodeSet?: string;

  @Prop({ default: 0 })
  productCount: number;

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;

  // ---- Sprint 4 rich content ---------------------------------------------
  // Long-form description (HTML) shown above the product grid.
  @Prop({ required: false })
  longDescription?: string;

  // Editorial intro shown in the answer-box at the top of the category page.
  // Pairs with Speakable schema. Aim 40-60 words for AEO citation rates.
  @Prop({ required: false })
  editorialIntro?: string;

  // CMS-authored category-level FAQs. Supplements (or replaces) the
  // hard-coded category-faqs.ts entries.
  @Prop({
    type: [{ question: String, answer: String }],
    default: [],
  })
  categoryFaqs?: { question: string; answer: string }[];

  // Featured products to pin at the top of the category grid.
  @Prop({ type: [String], default: [] })
  featuredProductIds?: string[];

  // Explicit display order for products in this category.
  // Stored as an ordered array of product _id strings.
  // Products not listed here are appended after the ordered ones.
  @Prop({ type: [String], default: [] })
  productOrder?: string[];

  // Pillar pages this category belongs to. Used for cross-category
  // internal linking from the pillar templates.
  @Prop({ type: [String], default: [] })
  pillarSlugs?: string[];

  // Editorial highlights surfaced as "Why shop this category" bullets.
  @Prop({ type: [String], default: [] })
  editorialHighlights?: string[];

  @Prop({ type: SeoBaseSchema, default: null })
  seo?: SeoBase;

  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

CategorySchema.index({ createdAt: -1 });

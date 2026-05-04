import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SeoBaseSchema, SeoBase } from '../seo-core/seo-base.schema';

export const PILLAR_MODEL = 'Pillar';

export type PillarDocument = Pillar & Document;

/**
 * Pillar — a CMS-driven landing page that captures a non-branded keyword
 * cluster (e.g. "no palm oil snacks", "no maida snacks", "healthy vrat
 * snacks"). The storefront `/p/[slug]` template is fully data-driven from
 * this collection so the content team can launch new pillars without code.
 *
 * Each pillar has:
 *  - hero / intro (with Speakable-flagged paragraph for AEO)
 *  - sections (rich-text blocks; can render featured products)
 *  - FAQs (FAQPage schema)
 *  - featured categories + products (cross-linking)
 *  - cluster blogs (auto-derived from blog.pillarSlugs include)
 */
@Schema({ _id: false })
export class PillarSection {
  @Prop({ required: true }) heading: string;
  @Prop({ required: true }) body: string; // HTML
  @Prop({ default: false }) speakable?: boolean;
  @Prop({ type: [String], default: [] }) featuredProductIds?: string[];
}

export const PillarSectionSchema = SchemaFactory.createForClass(PillarSection);

@Schema({ _id: false })
export class PillarFaqEntry {
  @Prop({ required: true }) question: string;
  @Prop({ required: true }) answer: string;
}

export const PillarFaqEntrySchema =
  SchemaFactory.createForClass(PillarFaqEntry);

@Schema({ _id: false })
export class PillarCategoryTile {
  @Prop({ required: true }) categorySlug: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) blurb: string;
}

export const PillarCategoryTileSchema =
  SchemaFactory.createForClass(PillarCategoryTile);

@Schema({ timestamps: true })
export class Pillar {
  @Prop({ required: true, unique: true })
  slug: string;

  /**
   * Optional override for the storefront URL where this pillar is served.
   *
   * Defaults to `/p/<slug>` when null/empty. Set to a clean URL like
   * `/no-palm-oil-snacks` or `/no-maida-snacks` to publish at a top-level
   * path instead.
   *
   * Storefront resolution order:
   *  1. /<segment> dynamic route checks Pillar.customRoute === '/<segment>'
   *  2. Falls through to Category lookup if no match
   *
   * Admin-side validation (in pillars admin page) blocks saving a customRoute
   * that collides with an existing category slug to prevent shadowing.
   */
  @Prop({ required: false })
  customRoute?: string;

  @Prop({ required: true })
  title: string;

  // 40-60 word answer-engine-friendly intro. Pairs with Speakable.
  @Prop({ required: true })
  intro: string;

  @Prop()
  heroImageUrl?: string;

  // Categories shown as tiles ("Shop X by Category"). Order matters.
  @Prop({ type: [PillarCategoryTileSchema], default: [] })
  categoryTiles: PillarCategoryTile[];

  // Featured products to surface above the fold.
  @Prop({ type: [String], default: [] })
  featuredProductIds: string[];

  // Long-form sections (problem framing, comparison, education, etc.).
  @Prop({ type: [PillarSectionSchema], default: [] })
  sections: PillarSection[];

  @Prop({ type: [PillarFaqEntrySchema], default: [] })
  faqs: PillarFaqEntry[];

  // Sibling pillars shown in a "Related pillars" block at bottom.
  @Prop({ type: [String], default: [] })
  relatedPillarSlugs: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  position: number;

  @Prop({ type: SeoBaseSchema, required: false })
  seo?: SeoBase;

  createdAt: Date;
  updatedAt: Date;
}

export const PillarSchema = SchemaFactory.createForClass(Pillar);

PillarSchema.virtual('id').get(function (this: any) {
  return this._id?.toString();
});

PillarSchema.set('toJSON', {
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

PillarSchema.index({ slug: 1 });
PillarSchema.index({ isActive: 1 });
PillarSchema.index({ position: 1 });

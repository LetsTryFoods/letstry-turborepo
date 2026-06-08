import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SeoBaseSchema, SeoBase } from '../seo-core/seo-base.schema';

export const BLOG_MODEL = 'Blog';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  excerpt: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  image?: string;

  @Prop({ required: false })
  date?: string;

  @Prop({ required: true })
  author: string;

  // Optional reference to an Author document for E-E-A-T (author profile,
  // bio, photo, credentials). When set, the storefront emits Person
  // schema linked to the Author profile page; otherwise it falls back to
  // the legacy `author` string.
  @Prop()
  authorId?: string;

  @Prop({ required: true })
  category: string;

  // Pillar pages this blog supports. Drives "back to pillar" breadcrumbs
  // and contributes to cluster-blog lists on the pillar page template.
  @Prop({ type: [String], default: [] })
  pillarSlugs?: string[];

  // Products explicitly mentioned in this post. Renders the
  // "Products mentioned in this post" widget on the storefront.
  @Prop({ type: [String], default: [] })
  mentionedProductIds?: string[];

  // Reading time in minutes (auto-computed at write time, but stored so
  // the storefront can render without re-parsing the HTML body).
  @Prop()
  readingTimeMinutes?: number;

  @Prop({ type: SeoBaseSchema, required: false })
  seo?: SeoBase;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ required: false, type: Number, default: 0 })
  position?: number;

  createdAt: Date;

  updatedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.virtual('id').get(function (this: any) {
  return this._id?.toString();
});

BlogSchema.set('toJSON', {
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

BlogSchema.index({ slug: 1 });
BlogSchema.index({ position: 1 });
BlogSchema.index({ isActive: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const PRESS_MENTION_MODEL = 'PressMention';

export type PressMentionDocument = PressMention & Document;

/**
 * PressMention — a single piece of media coverage for the brand. Drives the
 * /press storefront page and the NewsArticle JSON-LD blocks emitted from it.
 *
 * Each entry represents an article *about* Let's Try Foods published by an
 * external publication. The brand is the `mentions` target, not the author.
 */
@Schema({ timestamps: true })
export class PressMention {
  @Prop({ required: true, unique: true })
  slug: string;

  // Publication that ran the piece, e.g., "Times of India", "YourStory".
  @Prop({ required: true })
  publication: string;

  // Hosted logo for the publication (used as a small avatar in the press
  // grid and as `publisher.logo` in NewsArticle schema).
  @Prop()
  publicationLogoUrl?: string;

  // Headline of the article as it appeared in the publication.
  @Prop({ required: true })
  headline: string;

  // Canonical URL of the article on the publisher's site.
  @Prop({ required: true })
  url: string;

  // Optional pull-quote / excerpt — short snippet used as `description` in
  // schema and as a teaser in the press grid.
  @Prop()
  excerpt?: string;

  // Optional cover image for the article (publication's hero image, with
  // attribution / fair use considerations on the storefront).
  @Prop()
  coverImageUrl?: string;

  // Date the article was published by the external publication.
  @Prop({ required: true })
  publishedAt: Date;

  // Optional category tag, e.g., "feature", "review", "interview", "listicle".
  @Prop()
  category?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  position: number;

  createdAt: Date;
  updatedAt: Date;
}

export const PressMentionSchema = SchemaFactory.createForClass(PressMention);

PressMentionSchema.virtual('id').get(function (this: any) {
  return this._id?.toString();
});

PressMentionSchema.set('toJSON', {
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

PressMentionSchema.index({ slug: 1 });
PressMentionSchema.index({ isActive: 1, publishedAt: -1 });

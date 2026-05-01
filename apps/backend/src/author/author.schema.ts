import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const AUTHOR_MODEL = 'Author';

export type AuthorDocument = Author & Document;

@Schema({ _id: false })
export class AuthorSocialLink {
  @Prop({ required: true }) platform: string; // linkedin, twitter, instagram, youtube, substack, etc.
  @Prop({ required: true }) url: string;
}

export const AuthorSocialLinkSchema =
  SchemaFactory.createForClass(AuthorSocialLink);

/**
 * Author — a Person profile that can be referenced from blog posts (and
 * later other content). Drives `Person` schema for E-E-A-T, the
 * /author/[slug] profile page, and visible bylines.
 */
@Schema({ timestamps: true })
export class Author {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  jobTitle?: string;

  // Markdown / HTML bio.
  @Prop()
  bio?: string;

  // Hosted photo URL.
  @Prop()
  photoUrl?: string;

  // Email — used for `Person.email` if visible-on-page is acceptable.
  // Leave blank to skip emitting.
  @Prop()
  publicEmail?: string;

  // Areas of expertise — drives `Person.knowsAbout` schema.
  @Prop({ type: [String], default: [] })
  expertise: string[];

  // Credentials (RD, MSc Nutrition, journalist credentials).
  @Prop({ type: [String], default: [] })
  credentials: string[];

  @Prop({ type: [AuthorSocialLinkSchema], default: [] })
  socialLinks: AuthorSocialLink[];

  // Marks the founder/team member so the storefront can render with
  // "founder" framing on the team page.
  @Prop({ default: false })
  isFounder: boolean;

  // Marks the author as part of the team — drives /team page rendering.
  @Prop({ default: false })
  isTeamMember: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  position: number;

  createdAt: Date;
  updatedAt: Date;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

AuthorSchema.virtual('id').get(function (this: any) {
  return this._id?.toString();
});

AuthorSchema.set('toJSON', {
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

AuthorSchema.index({ slug: 1 });
AuthorSchema.index({ isActive: 1, position: 1 });

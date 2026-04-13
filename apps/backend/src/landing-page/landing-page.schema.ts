import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SeoBaseSchema, SeoBase } from '../seo-core/seo-base.schema';

export const LANDING_PAGE_MODEL = 'LandingPage';

export type LandingPageDocument = LandingPage & Document;

@Schema({ _id: false })
export class SectionPlatformLink {
  @Prop({ required: true })
  platform: string;

  @Prop({ required: true })
  url: string;
}

export const SectionPlatformLinkSchema = SchemaFactory.createForClass(SectionPlatformLink);

@Schema({ _id: false })
export class LandingPageSection {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  subtitle?: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: false })
  buttonText?: string;

  @Prop({ required: false })
  buttonLink?: string;

  @Prop({ type: [String], default: [] })
  productSlugs: string[];

  @Prop({ type: [SectionPlatformLinkSchema], default: [] })
  platformLinks: SectionPlatformLink[];

  @Prop({ required: false })
  backgroundColor?: string;

  @Prop({ required: true, default: 0 })
  position: number;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const LandingPageSectionSchema = SchemaFactory.createForClass(LandingPageSection);

@Schema({ timestamps: true })
export class LandingPage {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  thumbnailUrl?: string;

  @Prop({ type: [LandingPageSectionSchema], default: [] })
  sections: LandingPageSection[];

  @Prop({ type: SeoBaseSchema, required: false })
  seo?: SeoBase;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: 0 })
  position: number;
}

export const LandingPageSchema = SchemaFactory.createForClass(LandingPage);

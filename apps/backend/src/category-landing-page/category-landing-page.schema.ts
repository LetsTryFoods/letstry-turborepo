import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SeoBaseSchema, SeoBase } from '../seo-core/seo-base.schema';

export const CATEGORY_LANDING_PAGE_MODEL = 'CategoryLandingPage';

export type CategoryLandingPageDocument = CategoryLandingPage & Document;

@Schema({ _id: false })
export class CategoryTile {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  blurb?: string;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: true })
  shopNowUrl: string;

  @Prop({ required: true, default: 0 })
  position: number;
}

export const CategoryTileSchema = SchemaFactory.createForClass(CategoryTile);

@Schema({ _id: false })
export class CategoryFaq {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ required: true, default: 0 })
  position: number;
}

export const CategoryFaqSchema = SchemaFactory.createForClass(CategoryFaq);

@Schema({ timestamps: true })
export class CategoryLandingPage {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  pageTitle: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  tilesHeading?: string;

  @Prop({ required: false })
  faqHeading?: string;

  @Prop({ type: [CategoryTileSchema], default: [] })
  tiles: CategoryTile[];

  @Prop({ type: [CategoryFaqSchema], default: [] })
  faqs: CategoryFaq[];

  @Prop({ type: SeoBaseSchema, required: false })
  seo?: SeoBase;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const CategoryLandingPageSchema =
  SchemaFactory.createForClass(CategoryLandingPage);

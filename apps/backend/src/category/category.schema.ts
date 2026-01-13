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

  @Prop({ required: false })
  description?: string;

  @Prop({ type: String, default: null, index: true })
  parentId: string | undefined;

  @Prop()
  imageUrl: string;

  @Prop({ required: false })
  codeValue?: string;

  @Prop({ required: false })
  inCodeSet?: string;

  @Prop({ default: 0 })
  productCount: number;

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;

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

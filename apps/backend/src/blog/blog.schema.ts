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

    @Prop({ required: true })
    category: string;

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

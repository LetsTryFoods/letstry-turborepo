import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

export type BlogCategoryDocument = BlogCategory & Document;

@Schema({ timestamps: true })
@ObjectType()
export class BlogCategory {
    @Field(() => ID)
    _id: string;

    @Prop({ required: true, unique: true })
    @Field()
    name: string;

    @Prop({ required: true, unique: true })
    @Field()
    slug: string;

    @Prop({ required: false })
    @Field({ nullable: true })
    description?: string;

    @Prop({ default: true })
    @Field({ nullable: true })
    isActive?: boolean;

    @Prop({ required: false, type: Number, default: 0 })
    @Field(() => Number, { nullable: true })
    position?: number;

    @Field(() => GraphQLISODateTime)
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt: Date;
}

export const BlogCategorySchema = SchemaFactory.createForClass(BlogCategory);

BlogCategorySchema.virtual('id').get(function (this: any) {
    return this._id?.toString();
});

BlogCategorySchema.set('toJSON', {
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

BlogCategorySchema.index({ slug: 1 });
BlogCategorySchema.index({ position: 1 });
BlogCategorySchema.index({ isActive: 1 });

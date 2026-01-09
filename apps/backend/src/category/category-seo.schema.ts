import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { SeoBase } from '../seo-core/seo-base.schema';

export type CategorySeoDocument = CategorySeo & Document;

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
@ObjectType()
export class CategorySeo extends SeoBase {
    @Field(() => ID)
    _id: string;

    @Prop({ required: true })
    @Field()
    categoryId: string;



    @Field(() => GraphQLISODateTime)
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt: Date;
}

export const CategorySeoSchema = SchemaFactory.createForClass(CategorySeo);

CategorySeoSchema.virtual('id').get(function (this: any) {
    return this._id.toString();
});

CategorySeoSchema.index({ categoryId: 1 }, { unique: true });

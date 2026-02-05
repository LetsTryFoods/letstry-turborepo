import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Blog {
    @Field(() => ID)
    _id: string;

    @Prop({ required: true, unique: true })
    @Field()
    slug: string;

    @Prop({ required: true })
    @Field()
    title: string;

    @Prop({ required: true })
    @Field()
    excerpt: string;

    @Prop({ required: true })
    @Field()
    content: string;

    @Prop({ required: false })
    @Field({ nullable: true })
    image?: string;

    @Prop({ required: false })
    @Field({ nullable: true })
    date?: string;

    @Prop({ required: true })
    @Field()
    author: string;

    @Prop({ required: true })
    @Field()
    category: string;

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

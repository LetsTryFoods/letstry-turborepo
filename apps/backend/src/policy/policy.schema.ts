import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { SeoBase, SeoBaseSchema } from '../seo-core/seo-base.schema';

export type PolicyDocument = Policy & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Policy {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true, unique: true })
  @Field()
  title: string;

  @Prop({ required: true })
  @Field()
  content: string;

  @Prop({ required: true, unique: true })
  @Field()
  type: string;

  @Prop({ type: SeoBaseSchema, default: null })
  @Field(() => SeoBase, { nullable: true })
  seo?: SeoBase;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);

PolicySchema.virtual('id').get(function (this: any) {
  return this._id?.toString();
});

PolicySchema.set('toJSON', {
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

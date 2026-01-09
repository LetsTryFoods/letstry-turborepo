import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { SeoBase } from '../seo-core/seo-base.schema';

export type PolicySeoDocument = PolicySeo & Document;

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
@ObjectType()
export class PolicySeo extends SeoBase {
    @Field(() => ID)
    _id: string;

    @Prop({ required: true })
    @Field()
    policyId: string;



    @Field(() => GraphQLISODateTime)
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt: Date;
}

export const PolicySeoSchema = SchemaFactory.createForClass(PolicySeo);

PolicySeoSchema.virtual('id').get(function (this: any) {
    return this._id?.toString();
});

PolicySeoSchema.index({ policyId: 1 }, { unique: true });

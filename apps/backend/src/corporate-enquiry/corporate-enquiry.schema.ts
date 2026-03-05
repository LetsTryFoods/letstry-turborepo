import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID, GraphQLISODateTime, registerEnumType } from '@nestjs/graphql';

export type CorporateEnquiryDocument = CorporateEnquiry & Document;

export enum PurposeOfInquiry {
    FestiveGifting = 'FestiveGifting',
    WholesaleRetail = 'WholesaleRetail',
    WeddingGifting = 'WeddingGifting',
    CorporateGifting = 'CorporateGifting',
    PantrySnacking = 'PantrySnacking',
    PersonalGifting = 'PersonalGifting',
    EmployeeGifting = 'EmployeeGifting',
    Others = 'Others',
}

registerEnumType(PurposeOfInquiry, { name: 'PurposeOfInquiry' });

@Schema({ timestamps: true })
@ObjectType()
export class CorporateEnquiry {
    @Field(() => ID)
    _id: string;

    @Prop()
    @Field({ nullable: true })
    companyName?: string;

    @Prop({ required: true, trim: true })
    @Field()
    name: string;

    @Prop({ required: true, trim: true })
    @Field()
    phone: string;

    @Prop({ required: true, lowercase: true, trim: true })
    @Field()
    email: string;

    @Prop({ required: true, enum: PurposeOfInquiry })
    @Field(() => PurposeOfInquiry)
    purposeOfInquiry: PurposeOfInquiry;

    @Prop()
    @Field({ nullable: true })
    otherPurpose?: string;

    @Field(() => GraphQLISODateTime)
    createdAt: Date;

    @Field(() => GraphQLISODateTime)
    updatedAt: Date;
}

export const CorporateEnquirySchema = SchemaFactory.createForClass(CorporateEnquiry);

CorporateEnquirySchema.index({ createdAt: -1 });
CorporateEnquirySchema.index({ email: 1 });

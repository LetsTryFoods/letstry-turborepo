import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { PurposeOfInquiry } from './corporate-enquiry.schema';

@InputType()
export class SubmitCorporateEnquiryInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    companyName?: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    name: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @Field()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Field(() => PurposeOfInquiry)
    @IsNotEmpty()
    @IsEnum(PurposeOfInquiry)
    purposeOfInquiry: PurposeOfInquiry;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    otherPurpose?: string;
}

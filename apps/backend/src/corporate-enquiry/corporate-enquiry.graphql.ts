import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CorporateEnquiryResponse {
    @Field()
    success: boolean;

    @Field()
    message: string;
}

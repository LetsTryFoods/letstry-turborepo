import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CorporateEnquiry, CorporateEnquiryDocument } from './corporate-enquiry.schema';
import { SubmitCorporateEnquiryInput } from './corporate-enquiry.input';
import { CorporateEnquiryResponse } from './corporate-enquiry.graphql';

@Injectable()
export class CorporateEnquiryService {
    constructor(
        @InjectModel(CorporateEnquiry.name)
        private readonly corporateEnquiryModel: Model<CorporateEnquiryDocument>,
    ) { }

    async submit(input: SubmitCorporateEnquiryInput): Promise<CorporateEnquiryResponse> {
        await this.corporateEnquiryModel.create(input);
        return { success: true, message: 'Your enquiry has been submitted successfully.' };
    }

    async findAll(): Promise<CorporateEnquiry[]> {
        return this.corporateEnquiryModel.find().sort({ createdAt: -1 }).exec();
    }
}

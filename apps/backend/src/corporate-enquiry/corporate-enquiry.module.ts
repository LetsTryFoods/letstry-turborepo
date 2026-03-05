import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CorporateEnquiry, CorporateEnquirySchema } from './corporate-enquiry.schema';
import { CorporateEnquiryService } from './corporate-enquiry.service';
import { CorporateEnquiryResolver } from './corporate-enquiry.resolver';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: CorporateEnquiry.name,
                schema: CorporateEnquirySchema,
            },
        ]),
    ],
    providers: [CorporateEnquiryService, CorporateEnquiryResolver],
    exports: [CorporateEnquiryService],
})
export class CorporateEnquiryModule { }

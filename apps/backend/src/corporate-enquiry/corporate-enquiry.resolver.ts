import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { CorporateEnquiryService } from './corporate-enquiry.service';
import { SubmitCorporateEnquiryInput } from './corporate-enquiry.input';
import { CorporateEnquiryResponse } from './corporate-enquiry.graphql';
import { CorporateEnquiry } from './corporate-enquiry.schema';
import { Public } from '../common/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@Resolver()
export class CorporateEnquiryResolver {
    constructor(private readonly corporateEnquiryService: CorporateEnquiryService) { }

    @Mutation(() => CorporateEnquiryResponse)
    @Public()
    async submitCorporateEnquiry(
        @Args('input') input: SubmitCorporateEnquiryInput,
    ): Promise<CorporateEnquiryResponse> {
        return this.corporateEnquiryService.submit(input);
    }

    @Query(() => [CorporateEnquiry])
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    async getAllCorporateEnquiries(): Promise<CorporateEnquiry[]> {
        return this.corporateEnquiryService.findAll();
    }
}

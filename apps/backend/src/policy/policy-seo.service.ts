import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PolicySeo, PolicySeoDocument } from './policy-seo.schema';
import { PolicySeoInput } from './policy-seo.input';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class PolicySeoService {
    constructor(
        @InjectModel(PolicySeo.name)
        private readonly policySeoModel: Model<PolicySeoDocument>,
        private readonly logger: WinstonLoggerService,
    ) { }

    async findByPolicyId(policyId: string): Promise<PolicySeo | null> {
        return this.policySeoModel.findOne({ policyId }).exec();
    }

    async update(policyId: string, seoInput: PolicySeoInput): Promise<PolicySeo | null> {
        const seo = await this.policySeoModel
            .findOneAndUpdate(
                { policyId },
                { $set: seoInput },
                { new: true, upsert: true },
            )
            .exec();
        this.logger.log(`PolicySeo updated for policy: ${policyId}`);
        return seo;
    }

    async delete(policyId: string): Promise<void> {
        await this.policySeoModel.deleteOne({ policyId }).exec();
        this.logger.log(`PolicySeo deleted for policy: ${policyId}`);
    }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolicyService } from './policy.service';
import { PolicyResolver } from './policy.resolver';
import { Policy, PolicySchema } from './policy.schema';
import { AdminModule } from '../admin/admin.module';
import { PolicySeo, PolicySeoSchema } from './policy-seo.schema';
import { PolicySeoService } from './policy-seo.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Policy.name, schema: PolicySchema },
      { name: PolicySeo.name, schema: PolicySeoSchema },
    ]),
    AdminModule,
    LoggerModule,
  ],
  providers: [PolicyService, PolicySeoService, PolicyResolver],
  exports: [PolicyService, PolicySeoService],
})
export class PolicyModule { }

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LandingPageService } from './landing-page.service';
import { LandingPageResolver } from './landing-page.resolver';
import { LandingPageSchema, LANDING_PAGE_MODEL } from './landing-page.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LANDING_PAGE_MODEL, schema: LandingPageSchema }]),
    AdminModule,
  ],
  providers: [LandingPageService, LandingPageResolver],
  exports: [LandingPageService],
})
export class LandingPageModule {}

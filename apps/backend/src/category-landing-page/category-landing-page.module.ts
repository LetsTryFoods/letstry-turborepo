import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryLandingPageService } from './category-landing-page.service';
import { CategoryLandingPageResolver } from './category-landing-page.resolver';
import {
  CATEGORY_LANDING_PAGE_MODEL,
  CategoryLandingPageSchema,
} from './category-landing-page.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CATEGORY_LANDING_PAGE_MODEL, schema: CategoryLandingPageSchema },
    ]),
  ],
  providers: [CategoryLandingPageService, CategoryLandingPageResolver],
  exports: [CategoryLandingPageService],
})
export class CategoryLandingPageModule {}

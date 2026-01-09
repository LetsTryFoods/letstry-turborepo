import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { Category, CategorySchema } from './category.schema';
import { CategorySeo, CategorySeoSchema } from './category-seo.schema';
import { CategorySeoService } from './category-seo.service';
import { CategoryLoader } from './category.loader';
import { LoggerModule } from '../logger/logger.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: CategorySeo.name, schema: CategorySeoSchema },
    ]),
    LoggerModule,
    forwardRef(() => ProductModule),
  ],
  providers: [CategoryService, CategorySeoService, CategoryResolver, CategoryLoader],
  exports: [CategoryService, CategorySeoService, CategoryLoader],
})
export class CategoryModule { }

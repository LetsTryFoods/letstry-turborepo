import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { ProductSeoService } from './product-seo.service';
import { ProductResolver } from './product.resolver';
import { Product, ProductSchema } from './product.schema';
import { ProductSeo, ProductSeoSchema } from './product-seo.schema';
import { LoggerModule } from '../logger/logger.module';
import { CategoryModule } from '../category/category.module';
import { InventoryLog, InventoryLogSchema } from './inventory-log.schema';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductSeo.name, schema: ProductSeoSchema },
      { name: InventoryLog.name, schema: InventoryLogSchema },
    ]),
    LoggerModule,
    forwardRef(() => CategoryModule),
  ],
  providers: [ProductService, ProductSeoService, ProductResolver, InventoryService],
  exports: [
    ProductService,
    ProductSeoService,
    InventoryService,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
})
export class ProductModule { }

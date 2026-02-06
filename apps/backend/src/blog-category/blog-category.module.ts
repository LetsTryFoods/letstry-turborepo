import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogCategory, BlogCategorySchema } from './blog-category.schema';
import { BlogCategoryService } from './blog-category.service';
import { BlogCategoryResolver } from './blog-category.resolver';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BlogCategory.name, schema: BlogCategorySchema },
        ]),
        AdminModule,
    ],
    providers: [BlogCategoryService, BlogCategoryResolver],
    exports: [BlogCategoryService],
})
export class BlogCategoryModule { }

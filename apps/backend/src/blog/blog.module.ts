import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogService } from './blog.service';
import { BlogResolver } from './blog.resolver';
import { BlogSchema, BLOG_MODEL } from './blog.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: BLOG_MODEL, schema: BlogSchema }]),
        AdminModule,
    ],
    providers: [BlogService, BlogResolver],
    exports: [BlogService],
})
export class BlogModule { }

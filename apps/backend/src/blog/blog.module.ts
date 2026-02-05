import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogService } from './blog.service';
import { BlogResolver } from './blog.resolver';
import { Blog, BlogSchema } from './blog.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
        AdminModule,
    ],
    providers: [BlogService, BlogResolver],
    exports: [BlogService],
})
export class BlogModule { }

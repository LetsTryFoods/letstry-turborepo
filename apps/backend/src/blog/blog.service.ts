import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blog.schema';
import { CreateBlogInput, UpdateBlogInput } from './blog.input';
import { CacheService } from '../cache/cache.service';
import { CacheKeyFactory } from '../cache/cache-key.factory';
import { CacheInvalidatorService } from '../cache/cache-invalidator.service';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class BlogService {
    private readonly TTL = 15552000000;
    private readonly CACHE_TYPE_ALL = 'all';
    private readonly CACHE_TYPE_ACTIVE = 'active';

    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
        private readonly cacheService: CacheService,
        private readonly cacheKeyFactory: CacheKeyFactory,
        private readonly cacheInvalidatorService: CacheInvalidatorService,
        private readonly logger: WinstonLoggerService,
    ) { }

    async create(createBlogInput: CreateBlogInput): Promise<Blog> {
        this.logger.log('Creating new blog...');
        const createdBlog = new this.blogModel(createBlogInput);
        const savedBlog = await createdBlog.save();
        await this.cacheInvalidatorService.invalidateBlog();
        this.logger.log(`Blog created: ${savedBlog._id}`);
        return savedBlog.toObject();
    }

    async findAll(): Promise<Blog[]> {
        this.logger.log('Fetching all blogs...');
        return this.getCachedList(this.CACHE_TYPE_ALL, async () => {
            this.logger.log('Cache MISS - Fetching blogs from DB');
            const blogs = await this.blogModel.find().sort({ position: 1 }).lean().exec();
            this.logger.log(`Found ${blogs.length} blogs in DB`);
            return blogs;
        });
    }

    async findActive(): Promise<Blog[]> {
        return this.getCachedList(this.CACHE_TYPE_ACTIVE, () =>
            this.blogModel
                .find({ isActive: true })
                .sort({ position: 1 })
                .lean()
                .exec(),
        );
    }

    async findOne(id: string): Promise<Blog> {
        return this.findByIdOrThrow(id);
    }

    async findBySlug(slug: string): Promise<Blog> {
        const blog = await this.blogModel.findOne({ slug }).lean().exec();
        if (!blog) {
            throw new NotFoundException(`Blog with slug ${slug} not found`);
        }
        return blog as Blog;
    }

    async update(id: string, updateBlogInput: UpdateBlogInput): Promise<Blog> {
        const blog = await this.blogModel
            .findByIdAndUpdate(id, updateBlogInput, { new: true })
            .lean()
            .exec();

        if (!blog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        await this.cacheInvalidatorService.invalidateBlog();
        this.logger.log(`Blog updated: ${id}`);
        return blog as Blog;
    }

    async remove(id: string): Promise<Blog> {
        const blog = await this.blogModel.findByIdAndDelete(id).lean().exec();

        if (!blog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        await this.cacheInvalidatorService.invalidateBlog();
        this.logger.log(`Blog removed: ${id}`);
        return blog as Blog;
    }

    private async getCachedList(
        type: string,
        fetcher: () => Promise<any[]>,
    ): Promise<Blog[]> {
        const versionKey = this.cacheKeyFactory.getBlogListVersionKey();
        const version = await this.cacheService.getVersion(versionKey);
        const key = this.cacheKeyFactory.getBlogListKey(version, type);

        const cached = await this.cacheService.get<Blog[]>(key);
        if (cached) return cached;

        const data = (await fetcher()) as Blog[];
        await this.cacheService.set(key, data, this.TTL);
        return data;
    }

    private async findByIdOrThrow(id: string): Promise<Blog> {
        const blog = await this.blogModel.findById(id).lean().exec();
        if (!blog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }
        return blog as Blog;
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogCategory, BlogCategoryDocument } from './blog-category.schema';
import { CreateBlogCategoryInput, UpdateBlogCategoryInput } from './blog-category.input';
import { CacheService } from '../cache/cache.service';
import { CacheKeyFactory } from '../cache/cache-key.factory';
import { CacheInvalidatorService } from '../cache/cache-invalidator.service';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class BlogCategoryService {
    private readonly TTL = 15552000000;
    private readonly CACHE_TYPE_ALL = 'all';
    private readonly CACHE_TYPE_ACTIVE = 'active';

    constructor(
        @InjectModel(BlogCategory.name) private blogCategoryModel: Model<BlogCategoryDocument>,
        private readonly cacheService: CacheService,
        private readonly cacheKeyFactory: CacheKeyFactory,
        private readonly cacheInvalidatorService: CacheInvalidatorService,
        private readonly logger: WinstonLoggerService,
    ) { }

    async create(createBlogCategoryInput: CreateBlogCategoryInput): Promise<BlogCategory> {
        this.logger.log('Creating new blog category...');
        const createdCategory = new this.blogCategoryModel(createBlogCategoryInput);
        const savedCategory = await createdCategory.save();
        await this.invalidateCache();
        this.logger.log(`Blog category created: ${savedCategory._id}`);
        return savedCategory.toObject();
    }

    async findAll(): Promise<BlogCategory[]> {
        this.logger.log('Fetching all blog categories...');
        return this.getCachedList(this.CACHE_TYPE_ALL, async () => {
            this.logger.log('Cache MISS - Fetching blog categories from DB');
            const categories = await this.blogCategoryModel.find().sort({ position: 1 }).lean().exec();
            this.logger.log(`Found ${categories.length} blog categories in DB`);
            return categories;
        });
    }

    async findActive(): Promise<BlogCategory[]> {
        return this.getCachedList(this.CACHE_TYPE_ACTIVE, () =>
            this.blogCategoryModel
                .find({ isActive: true })
                .sort({ position: 1 })
                .lean()
                .exec(),
        );
    }

    async findOne(id: string): Promise<BlogCategory> {
        return this.findByIdOrThrow(id);
    }

    async update(id: string, updateBlogCategoryInput: UpdateBlogCategoryInput): Promise<BlogCategory> {
        const category = await this.blogCategoryModel
            .findByIdAndUpdate(id, updateBlogCategoryInput, { new: true })
            .lean()
            .exec();

        if (!category) {
            throw new NotFoundException(`Blog category with ID ${id} not found`);
        }

        await this.invalidateCache();
        this.logger.log(`Blog category updated: ${id}`);
        return category as BlogCategory;
    }

    async remove(id: string): Promise<BlogCategory> {
        const category = await this.blogCategoryModel.findByIdAndDelete(id).lean().exec();

        if (!category) {
            throw new NotFoundException(`Blog category with ID ${id} not found`);
        }

        await this.invalidateCache();
        this.logger.log(`Blog category removed: ${id}`);
        return category as BlogCategory;
    }

    private async getCachedList(
        type: string,
        fetcher: () => Promise<any[]>,
    ): Promise<BlogCategory[]> {
        const versionKey = this.cacheKeyFactory.getBlogCategoryListVersionKey();
        const version = await this.cacheService.getVersion(versionKey);
        const key = this.cacheKeyFactory.getBlogCategoryListKey(version, type);

        const cached = await this.cacheService.get<BlogCategory[]>(key);
        if (cached) return cached;

        const data = (await fetcher()) as BlogCategory[];
        await this.cacheService.set(key, data, this.TTL);
        return data;
    }

    private async findByIdOrThrow(id: string): Promise<BlogCategory> {
        const category = await this.blogCategoryModel.findById(id).lean().exec();
        if (!category) {
            throw new NotFoundException(`Blog category with ID ${id} not found`);
        }
        return category as BlogCategory;
    }

    private async invalidateCache(): Promise<void> {
        await this.cacheInvalidatorService.invalidateBlogCategory();
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategorySeo, CategorySeoDocument } from './category-seo.schema';
import { CategorySeoInput } from './category-seo.input';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class CategorySeoService {
    constructor(
        @InjectModel(CategorySeo.name)
        private readonly categorySeoModel: Model<CategorySeoDocument>,
        private readonly logger: WinstonLoggerService,
    ) { }

    async findByCategoryId(categoryId: string): Promise<CategorySeo | null> {
        return this.categorySeoModel.findOne({ categoryId }).exec();
    }

    async create(
        categoryId: string,
        seoInput: CategorySeoInput,
    ): Promise<CategorySeo> {
        const seo = new this.categorySeoModel({
            categoryId,
            ...seoInput,
        });
        const savedSeo = await seo.save();
        this.logger.log(`CategorySeo created for category: ${categoryId}`);
        return savedSeo;
    }

    async update(
        categoryId: string,
        seoInput: CategorySeoInput,
    ): Promise<CategorySeo | null> {
        const seo = await this.categorySeoModel
            .findOneAndUpdate(
                { categoryId },
                { $set: seoInput },
                { new: true, upsert: true },
            )
            .exec();
        this.logger.log(`CategorySeo updated for category: ${categoryId}`);
        return seo;
    }

    async delete(categoryId: string): Promise<void> {
        await this.categorySeoModel.deleteOne({ categoryId }).exec();
        this.logger.log(`CategorySeo deleted for category: ${categoryId}`);
    }
}

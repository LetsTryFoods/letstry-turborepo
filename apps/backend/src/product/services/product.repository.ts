import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product.schema';
import { ProductFilter } from './product.types';

export class ProductRepository {
  constructor(private readonly productModel: Model<ProductDocument>) { }

  async countDocuments(filter: ProductFilter): Promise<number> {
    return this.productModel.countDocuments(filter).exec();
  }

  async find(filter: ProductFilter): Promise<Product[]> {
    return this.productModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(filter: ProductFilter): Promise<Product | null> {
    return this.productModel.findOne(filter).exec();
  }

  async findPaginated(
    filter: ProductFilter,
    skip: number,
    limit: number,
  ): Promise<Product[]> {
    return this.productModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findPaginatedWithSearch(
    filter: ProductFilter,
    skip: number,
    limit: number,
    searchTerm: string,
  ): Promise<Product[]> {
    const regex = new RegExp(searchTerm, 'i');
    return this.productModel
      .aggregate([
        { $match: filter },
        {
          $addFields: {
            tags: { $ifNull: ['$tags', []] },
            keywords: { $ifNull: ['$keywords', []] },
            nameMatchScore: {
              $cond: [{ $regexMatch: { input: '$name', regex } }, 2, 0],
            },
            brandMatchScore: {
              $cond: [{ $regexMatch: { input: '$brand', regex } }, 1, 0],
            },
            relevanceScore: {
              $add: [
                { $cond: [{ $regexMatch: { input: '$name', regex } }, 2, 0] },
                { $cond: [{ $regexMatch: { input: '$brand', regex } }, 1, 0] },
              ],
            },
          },
        },
        { $sort: { relevanceScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { nameMatchScore: 0, brandMatchScore: 0, relevanceScore: 0 } },
      ])
      .exec();
  }

  async create(data: any): Promise<Product> {
    const product = new this.productModel(data);
    return product.save();
  }

  async findByIdAndUpdate(
    id: string,
    update: any,
    options?: any,
  ): Promise<Product | null> {
    return this.productModel.findByIdAndUpdate(id, update, options).exec();
  }

  async findById(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec();
  }
}

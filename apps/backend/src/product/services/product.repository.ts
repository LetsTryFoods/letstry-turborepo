import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product.schema';
import { ProductFilter } from './product.types';

export class ProductRepository {
  constructor(private readonly productModel: Model<ProductDocument>) { }

  async countDocuments(filter: ProductFilter): Promise<number> {
    return this.productModel.countDocuments(filter as any).exec();
  }

  async find(filter: ProductFilter): Promise<Product[]> {
    return this.productModel.find(filter as any).sort({ createdAt: -1 }).exec();
  }

  async findOne(filter: ProductFilter): Promise<Product | null> {
    return this.productModel.findOne(filter as any).exec();
  }

  async findPaginated(
    filter: ProductFilter,
    skip: number,
    limit: number,
  ): Promise<Product[]> {
    return this.productModel
      .find(filter as any)
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
        {
          $project: {
            nameMatchScore: 0,
            brandMatchScore: 0,
            relevanceScore: 0,
          },
        },
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

  async findBySlugs(slugs: string[]): Promise<Product[]> {
    return this.productModel.find({ slug: { $in: slugs } }).exec();
  }

  /**
   * Exact match lookup by variant SKU or variant GTIN.
   * Uses the indexed fields for O(1) lookup — no regex, no full scan.
   */
  async findBySkuOrGtin(identifier: string): Promise<Product | null> {
    return this.productModel
      .findOne({
        $or: [{ 'variants.sku': identifier }, { 'variants.gtin': identifier }],
      })
      .exec();
  }

  async updateMany(filter: any, update: any): Promise<any> {
    return this.productModel.updateMany(filter, update).exec();
  }

  async delete(id: string): Promise<Product | null> {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  /**
   * Returns all non-archived products that have at least one in-stock
   * variant with isSaleVariant = true.
   */
  async findSaleProducts(): Promise<Product[]> {
    return this.productModel
      .find({
        isArchived: false,
        variants: {
          $elemMatch: {
            isSaleVariant: true,
            availabilityStatus: 'in_stock',
            stockQuantity: { $gt: 0 },
          },
        },
      })
      .sort({ updatedAt: -1 })
      .exec();
  }
}

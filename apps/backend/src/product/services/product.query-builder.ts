import { ProductFilter } from './product.types';

export class ProductQueryBuilder {
  private filter: ProductFilter = {};

  withArchived(includeArchived: boolean): this {
    if (!includeArchived) {
      this.filter.isArchived = { $ne: true };
    }
    return this;
  }

  withId(id: string): this {
    this.filter._id = id;
    return this;
  }

  withSlug(slug: string): this {
    this.filter.slug = slug;
    return this;
  }

  withCategoryId(categoryId: string): this {
    this.filter.categoryIds = categoryId;
    return this;
  }

  withVariantId(variantId: string): this {
    this.filter.variants = {
      $elemMatch: { _id: variantId },
    };
    return this;
  }

  withoutOutOfStock(includeOutOfStock: boolean): this {
    if (!includeOutOfStock) {
      this.filter.variants = {
        $elemMatch: {
          availabilityStatus: { $ne: 'out_of_stock' },
          isActive: true,
        },
      };
    }
    return this;
  }

  /**
   * Backend stock filter for inventory page:
   * - 'OUT' → all variants have stockQuantity === 0
   * - 'LOW' → at least one variant has 0 < stockQuantity < 10
   * - 'IN'  → at least one variant has stockQuantity >= 10
   */
  withStockFilter(stockFilter?: 'OUT' | 'LOW' | 'IN'): this {
    if (!stockFilter || stockFilter === 'ALL' as any) return this;
    if (stockFilter === 'OUT') {
      this.filter.variants = {
        $not: { $elemMatch: { stockQuantity: { $gt: 0 } } },
      } as any;
    } else if (stockFilter === 'LOW') {
      this.filter.variants = {
        $elemMatch: { stockQuantity: { $gt: 0, $lt: 10 } },
      };
    } else if (stockFilter === 'IN') {
      this.filter.variants = {
        $elemMatch: { stockQuantity: { $gte: 10 } },
      };
    }
    return this;
  }

  withSearch(searchTerm: string): this {
    if (!searchTerm) return this;

    const keywords = searchTerm.split(/\s+/).filter((k) => k.length > 0);
    if (keywords.length === 0) return this;

    const keywordFilters = keywords.map((keyword) => {
      const regex = new RegExp(keyword, 'i');
      return {
        $or: [
          { name: regex },
          { brand: regex },
          { keywords: regex },
          { tags: regex },
        ],
      };
    });

    if (keywordFilters.length === 1) {
      this.filter.$or = keywordFilters[0].$or;
    } else {
      this.filter.$and = keywordFilters;
    }

    return this;
  }

  getSearchTerm(): string | undefined {
    return this._searchTerm;
  }

  private _searchTerm?: string;

  withNameOnlySearch(searchTerm: string): this {
    if (!searchTerm) return this;
    const regex = new RegExp(searchTerm, 'i');
    this.filter.name = regex;
    return this;
  }

  excludeId(id: string): this {
    this.filter._id = { $ne: id };
    return this;
  }

  build(): ProductFilter {
    if (
      this.filter.variants &&
      this.filter.isArchived !== undefined &&
      !this.filter.$and
    ) {
      const variantsFilter = this.filter.variants;
      const isArchivedFilter = this.filter.isArchived;
      delete this.filter.variants;
      delete this.filter.isArchived;
      this.filter.$and = [{ isArchived: isArchivedFilter }, { variants: variantsFilter }];
    }
    return this.filter;
  }

  static forId(id: string, includeArchived: boolean): ProductFilter {
    return new ProductQueryBuilder()
      .withId(id)
      .withArchived(includeArchived)
      .build();
  }

  static forSlug(slug: string, includeArchived: boolean): ProductFilter {
    return new ProductQueryBuilder()
      .withSlug(slug)
      .withArchived(includeArchived)
      .build();
  }

  static forCategory(
    categoryId: string,
    includeArchived: boolean,
  ): ProductFilter {
    return new ProductQueryBuilder()
      .withCategoryId(categoryId)
      .withArchived(includeArchived)
      .withoutOutOfStock(true)
      .build();
  }

  static forAll(
    includeOutOfStock: boolean,
    includeArchived: boolean,
    stockFilter?: 'OUT' | 'LOW' | 'IN',
  ): ProductFilter {
    return new ProductQueryBuilder()
      .withArchived(includeArchived)
      .withoutOutOfStock(includeOutOfStock)
      .withStockFilter(stockFilter)
      .build();
  }

  static forSearch(
    searchTerm: string,
    includeArchived: boolean,
  ): ProductFilter {
    return new ProductQueryBuilder()
      .withSearch(searchTerm)
      .withArchived(includeArchived)
      .withoutOutOfStock(true)
      .build();
  }

  static forVariantId(
    variantId: string,
    includeArchived: boolean,
  ): ProductFilter {
    return new ProductQueryBuilder()
      .withArchived(includeArchived)
      .withVariantId(variantId)
      .build();
  }

  static forSlugCheck(slug: string, excludeId?: string): ProductFilter {
    const builder = new ProductQueryBuilder().withSlug(slug);
    if (excludeId) {
      builder.excludeId(excludeId);
    }
    return builder.build();
  }

  static forNameSearch(
    searchTerm: string,
    includeArchived: boolean,
  ): ProductFilter {
    return new ProductQueryBuilder()
      .withNameOnlySearch(searchTerm)
      .withArchived(includeArchived)
      .withoutOutOfStock(true)
      .build();
  }
}

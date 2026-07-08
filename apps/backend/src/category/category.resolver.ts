import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { CategorySeoService } from './category-seo.service';
import { Category } from './category.graphql';
import { CategorySeo } from './category-seo.schema';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  AddProductsToCategoryInput,
  RemoveProductsFromCategoryInput,
  ReorderCategoryProductsInput,
} from './category.input';
import { CategorySeoInput } from './category-seo.input';
import { Public } from '../common/decorators/public.decorator';
import { ProductService } from '../product/product.service';
import { Product } from '../product/product.graphql';
import { PaginatedCategories, PaginationInput } from '../common/pagination';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categorySeoService: CategorySeoService,
    private readonly productService: ProductService,
  ) {}

  @Query(() => PaginatedCategories, { name: 'categories' })
  @Public()
  async getCategories(
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 10 },
    })
    pagination: PaginationInput,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived: boolean,
  ): Promise<PaginatedCategories> {
    const result = await this.categoryService.findAllPaginated(
      pagination.page,
      pagination.limit,
      includeArchived,
    );
    return {
      items: result.items as any,
      meta: result.meta,
    };
  }

  @Query(() => PaginatedCategories, { name: 'rootCategories' })
  @Public()
  async getRootCategories(
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 10 },
    })
    pagination: PaginationInput,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived: boolean,
  ): Promise<PaginatedCategories> {
    const result = await this.categoryService.findRootCategoriesPaginated(
      pagination.page,
      pagination.limit,
      includeArchived,
    );
    return {
      items: result.items as any,
      meta: result.meta,
    };
  }

  @Query(() => PaginatedCategories, { name: 'categoryChildren' })
  @Public()
  async getCategoryChildren(
    @Args('parentId', { type: () => ID }) parentId: string,
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 10 },
    })
    pagination: PaginationInput,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived: boolean,
  ): Promise<PaginatedCategories> {
    const result = await this.categoryService.findChildrenPaginated(
      parentId,
      pagination.page,
      pagination.limit,
      includeArchived,
    );
    return {
      items: result.items as any,
      meta: result.meta,
    };
  }

  @Query(() => PaginatedCategories, { name: 'searchCategories' })
  @Public()
  async searchCategories(
    @Args('searchTerm') searchTerm: string,
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 10 },
    })
    pagination: PaginationInput,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived: boolean,
  ): Promise<PaginatedCategories> {
    const result = await this.categoryService.searchCategoriesPaginated(
      searchTerm,
      pagination.page,
      pagination.limit,
      includeArchived,
    );
    return {
      items: result.items as any,
      meta: result.meta,
    };
  }

  @Query(() => Category, { name: 'category', nullable: true })
  @Public()
  async getCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived: boolean,
  ): Promise<Category | null> {
    try {
      return (await this.categoryService.findOne(id, includeArchived)) as any;
    } catch {
      return null;
    }
  }

  @Query(() => Category, { name: 'categoryBySlug', nullable: true })
  @Public()
  async getCategoryBySlug(
    @Args('slug') slug: string,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived: boolean,
  ): Promise<Category | null> {
    try {
      return (await this.categoryService.findBySlug(
        slug,
        includeArchived,
      )) as any;
    } catch {
      return null;
    }
  }

  @Mutation(() => Category, { name: 'createCategory' })
  @Roles(Role.ADMIN)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.create(input) as any;
  }

  @Mutation(() => Category, { name: 'updateCategory' })
  @Roles(Role.ADMIN)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.update(id, input) as any;
  }

  @Mutation(() => Category, { name: 'archiveCategory' })
  @Roles(Role.ADMIN)
  async archiveCategory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Category> {
    return this.categoryService.archive(id) as any;
  }

  @Mutation(() => Category, { name: 'unarchiveCategory' })
  @Roles(Role.ADMIN)
  async unarchiveCategory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Category> {
    return this.categoryService.unarchive(id) as any;
  }

  @Mutation(() => Boolean, { name: 'addProductsToCategory' })
  @Roles(Role.ADMIN)
  async addProductsToCategory(
    @Args('input') input: AddProductsToCategoryInput,
  ): Promise<boolean> {
    return this.categoryService.addProductsToCategory(
      input.categoryId,
      input.productIds,
    );
  }

  @Mutation(() => Boolean, { name: 'removeProductsFromCategory' })
  @Roles(Role.ADMIN)
  async removeProductsFromCategory(
    @Args('input') input: RemoveProductsFromCategoryInput,
  ): Promise<boolean> {
    return this.categoryService.removeProductsFromCategory(
      input.categoryId,
      input.productIds,
    );
  }

  @Mutation(() => Boolean, { name: 'reorderCategoryProducts' })
  @Roles(Role.ADMIN)
  async reorderCategoryProducts(
    @Args('input') input: ReorderCategoryProductsInput,
  ): Promise<boolean> {
    return this.categoryService.reorderProducts(
      input.categoryId,
      input.orderedProductIds,
    );
  }

  // Public so storefront can fetch products via Category in a single query
  // (e.g. GET_CATEGORY_BY_SLUG / GET_CATEGORY_WITH_PRODUCTS for category PLPs).
  // Previously @Roles(Role.ADMIN) — would 403 any storefront query that
  // selected `products` on a Category.
  @ResolveField(() => [Product], { name: 'products' })
  @Public()
  async getProducts(@Parent() category: Category): Promise<Product[]> {
    const products = await this.productService.findByCategoryId(category._id);

    // If no order is defined, return as is
    if (!category.productOrder || category.productOrder.length === 0) {
      return products;
    }

    // Fast O(N) map-based lookup for sorting
    const orderMap = new Map<string, number>();
    category.productOrder.forEach((id, index) => {
      orderMap.set(id.toString(), index);
    });

    return products.sort((a, b) => {
      const aIndex = orderMap.get(a._id.toString());
      const bIndex = orderMap.get(b._id.toString());

      // If both have an explicit order, sort by that order
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }
      // If only A has an order, it comes first
      if (aIndex !== undefined) return -1;
      // If only B has an order, it comes first
      if (bIndex !== undefined) return 1;
      
      // If neither has an order, keep their original relative positions (usually creation date/fallback)
      return 0;
    });
  }

  @ResolveField(() => Number, { name: 'productCount' })
  @Public()
  async getProductCount(@Parent() category: Category): Promise<number> {
    return this.productService.countByCategoryId(category._id);
  }

  @ResolveField(() => [Category], { name: 'children', nullable: true })
  @Public()
  async getChildren(@Parent() category: Category): Promise<Category[]> {
    return this.categoryService.findChildren(category._id, false) as any;
  }

  @ResolveField(() => CategorySeo, { name: 'seo', nullable: true })
  @Public()
  async getSeo(@Parent() category: Category): Promise<CategorySeo | null> {
    if (!category.seo || !category.seo.metaTitle) {
      const seoFromCollection = await this.categorySeoService.findByCategoryId(
        category._id,
      );
      if (seoFromCollection) return seoFromCollection;
      return null;
    }

    return {
      _id: category._id,
      categoryId: category._id,
      metaTitle: category.seo.metaTitle,
      metaDescription: category.seo.metaDescription,
      metaKeywords: category.seo.metaKeywords,
      canonicalUrl: category.seo.canonicalUrl,
      ogTitle: category.seo.ogTitle,
      ogDescription: category.seo.ogDescription,
      ogImage: category.seo.ogImage,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    } as CategorySeo;
  }

  @Mutation(() => CategorySeo, { name: 'updateCategorySeo' })
  @Roles(Role.ADMIN)
  async updateCategorySeo(
    @Args('categoryId', { type: () => ID }) categoryId: string,
    @Args('input') input: CategorySeoInput,
  ): Promise<CategorySeo | null> {
    return this.categorySeoService.update(categoryId, input);
  }

  @Mutation(() => Boolean, { name: 'deleteCategorySeo' })
  @Roles(Role.ADMIN)
  async deleteCategorySeo(
    @Args('categoryId', { type: () => ID }) categoryId: string,
  ): Promise<boolean> {
    await this.categorySeoService.delete(categoryId);
    return true;
  }
}

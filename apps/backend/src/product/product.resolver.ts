import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product, ProductVariant, PriceRange } from './product.graphql';
import { ProductSeo } from './product-seo.schema';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from './product.input';
import { Public } from '../common/decorators/public.decorator';
import { Category } from '../category/category.graphql';
import { CategoryLoader } from '../category/category.loader';
import { CategoryService } from '../category/category.service';
import { PaginatedProducts, PaginationInput } from '../common/pagination';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { InventoryService } from './services/inventory.service';
import { InventoryLog, InventoryAction } from './inventory-log.schema';
import { ObjectType, Field } from '@nestjs/graphql';


@ObjectType()
class InventorySnapshot {
  @Field()
  sku: string;

  @Field(() => Int)
  stockQuantity: number;

  @Field()
  availabilityStatus: string;

  @Field(() => [InventoryLog])
  recentLogs: InventoryLog[];
}

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryLoader: CategoryLoader,
    private readonly inventoryService: InventoryService,
  ) { }

  @Query(() => PaginatedProducts, { name: 'products' })
  @Public()
  async getProducts(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('includeOutOfStock', { type: () => Boolean, defaultValue: true })
    includeOutOfStock?: boolean,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived?: boolean,
  ): Promise<PaginatedProducts> {
    const page = pagination?.page;
    const limit = pagination?.limit;
    return this.productService.findAllPaginated(
      page,
      limit,
      includeOutOfStock,
      includeArchived,
    );
  }

  @Query(() => [Product], { name: 'allProductsUncached' })
  async getAllProductsUncached(
    @Args('includeOutOfStock', { type: () => Boolean, defaultValue: true })
    includeOutOfStock?: boolean,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived?: boolean,
  ): Promise<Product[]> {
    // This calls ProductService.findAll which uses createNoCache() internally.
    return this.productService.findAll(includeOutOfStock, includeArchived);
  }

  @Query(() => Product, { name: 'product', nullable: true })
  @Public()
  async getProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Product | null> {
    try {
      return await this.productService.findOne(id);
    } catch {
      return null;
    }
  }

  @Query(() => Product, { name: 'productBySlug', nullable: true })
  @Public()
  async getProductBySlug(@Args('slug') slug: string): Promise<Product | null> {
    try {
      return await this.productService.findBySlug(slug);
    } catch {
      return null;
    }
  }

  @Query(() => [Product], { name: 'productsBySlugList' })
  @Public()
  async getProductsBySlugList(
    @Args('slugs', { type: () => [String] }) slugs: string[],
  ): Promise<Product[]> {
    return this.productService.findBySlugList(slugs);
  }

  @Query(() => PaginatedProducts, { name: 'productsByCategory' })
  @Public()
  async getProductsByCategory(
    @Args('categoryId', { type: () => ID }) categoryId: string,
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 10 },
    })
    pagination: PaginationInput,
  ): Promise<PaginatedProducts> {
    const result = await this.productService.findByCategoryIdPaginated(
      categoryId,
      pagination.page,
      pagination.limit,
    );
    return {
      items: result.items,
      meta: result.meta,
    };
  }

  @Query(() => PaginatedProducts, { name: 'searchProducts' })
  @Public()
  async searchProducts(
    @Args('searchTerm') searchTerm: string,
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 10 },
    })
    pagination: PaginationInput,
    @Args('nameOnly', { type: () => Boolean, defaultValue: false })
    nameOnly: boolean,
    @Args('includeArchived', { type: () => Boolean, defaultValue: false })
    includeArchived: boolean,
  ): Promise<PaginatedProducts> {
    const result = await this.productService.searchProductsPaginated(
      searchTerm,
      pagination.page,
      pagination.limit,
      nameOnly,
      includeArchived,
    );
    return {
      items: result.items,
      meta: result.meta,
    };
  }

  @Mutation(() => Product, { name: 'createProduct' })
  @Roles(Role.ADMIN)
  async createProduct(
    @Args('input') input: CreateProductInput,
  ): Promise<Product> {
    return this.productService.create(input);
  }

  @Mutation(() => Product, { name: 'updateProduct' })
  @Roles(Role.ADMIN)
  async updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductInput,
  ): Promise<Product> {
    return this.productService.update(id, input);
  }

  @Mutation(() => Product, { name: 'deleteProduct' })
  @Roles(Role.ADMIN)
  async deleteProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Product> {
    return this.productService.remove(id);
  }

  @Mutation(() => Product, { name: 'archiveProduct' })
  @Roles(Role.ADMIN)
  async archiveProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Product> {
    return this.productService.archive(id);
  }

  @Mutation(() => Product, { name: 'unarchiveProduct' })
  @Roles(Role.ADMIN)
  async unarchiveProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Product> {
    return this.productService.unarchive(id);
  }

  @Mutation(() => Product, { name: 'updateProductStock' })
  @Roles(Role.ADMIN)
  async updateProductStock(
    @Args('id', { type: () => ID }) id: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<Product> {
    return this.productService.updateStock(id, quantity);
  }

  @Mutation(() => Product, { name: 'addProductVariant' })
  @Roles(Role.ADMIN)
  async addProductVariant(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('input') input: CreateProductVariantInput,
  ): Promise<Product> {
    return this.productService.addVariant(productId, input);
  }

  @Mutation(() => Product, { name: 'updateProductVariant' })
  @Roles(Role.ADMIN)
  async updateProductVariant(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('variantId', { type: () => ID }) variantId: string,
    @Args('input') input: UpdateProductVariantInput,
  ): Promise<Product> {
    return this.productService.updateVariant(productId, variantId, input);
  }

  @Mutation(() => Product, { name: 'removeProductVariant' })
  @Roles(Role.ADMIN)
  async removeProductVariant(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('variantId', { type: () => ID }) variantId: string,
  ): Promise<Product> {
    return this.productService.removeVariant(productId, variantId);
  }

  @Mutation(() => Product, { name: 'setDefaultProductVariant' })
  @Roles(Role.ADMIN)
  async setDefaultProductVariant(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('variantId', { type: () => ID }) variantId: string,
  ): Promise<Product> {
    return this.productService.setDefaultVariant(productId, variantId);
  }

  @Mutation(() => Product, { name: 'updateProductVariantStock' })
  @Roles(Role.ADMIN)
  async updateProductVariantStock(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('variantId', { type: () => ID }) variantId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<Product> {
    // Find the SKU for this variantId so InventoryService can do the update
    const product = await this.productService.findOne(productId);
    const variant = product?.variants?.find(
      (v: any) => v._id?.toString() === variantId,
    );
    if (variant?.sku) {
      // Route through InventoryService: creates audit log + auto-syncs availabilityStatus
      await this.inventoryService.setStockLevel(variant.sku, quantity, {
        performedBy: 'ADMIN_PANEL',
        notes: `Stock set via Admin Inventory Hub`,
      });
      // Return the updated product
      return this.productService.findOne(productId);
    }
    // Fallback to direct update if SKU can't be resolved
    return this.productService.updateVariantStock(productId, variantId, quantity);
  }

  @Mutation(() => Boolean, { name: 'zeroAllProductStock' })
  @Roles(Role.ADMIN)
  async zeroAllProductStock(): Promise<boolean> {
    return this.productService.zeroAllStock();
  }

  @Query(() => ProductVariant, { name: 'productVariant', nullable: true })
  @Public()
  async getProductVariant(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('variantId', { type: () => ID }) variantId: string,
  ): Promise<ProductVariant | null> {
    const product = await this.productService.findOne(productId);
    return product.variants.find((v) => v._id.toString() === variantId) || null;
  }

  @ResolveField(() => [Category], { name: 'categories', nullable: true })
  async getCategories(@Parent() product: Product): Promise<Category[]> {
    if (!product.categoryIds || product.categoryIds.length === 0) return [];
    const categories = await Promise.all(
      product.categoryIds.map((id) =>
        this.categoryLoader.batchCategories.load(id),
      ),
    );
    return categories.filter((c) => c !== null) as any[];
  }

  @ResolveField(() => ProductVariant, {
    name: 'defaultVariant',
    nullable: true,
  })
  @Public()
  async getDefaultVariant(
    @Parent() product: Product,
  ): Promise<ProductVariant | null> {
    return (
      product.variants.find((v) => v.isDefault) || product.variants[0] || null
    );
  }

  @ResolveField(() => PriceRange, { name: 'priceRange' })
  @Public()
  async getPriceRange(@Parent() product: Product): Promise<PriceRange> {
    const prices = product.variants.map((v) => v.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  @ResolveField(() => [ProductVariant], { name: 'availableVariants' })
  @Public()
  async getAvailableVariants(
    @Parent() product: Product,
  ): Promise<ProductVariant[]> {
    return product.variants.filter((v) => v.isActive && v.stockQuantity > 0);
  }

  @ResolveField(() => ProductSeo, { name: 'seo', nullable: true })
  @Public()
  async getSeo(@Parent() product: Product): Promise<ProductSeo | null> {
    return this.productService.findSeoByProductId(product._id);
  }

  // ─── adjustInventory ───────────────────────────────────────────────────────
  // Positive delta → treated as INWARD; negative → MANUAL_ADJUSTMENT.
  @Mutation(() => InventoryLog, { name: 'adjustInventory' })
  @Roles(Role.ADMIN, Role.PACKER)
  async adjustInventory(
    @Args('identifier') identifier: string,
    @Args('incrementBy', { type: () => Int }) incrementBy: number,
    @Args('reason', { type: () => String, nullable: true }) reason: string,
    @Args('referenceId', { type: () => String, nullable: true })
    referenceId: string,
    @Args('performedBy', { type: () => String, nullable: true })
    performedBy: string,
  ): Promise<any> {
    const action =
      incrementBy > 0
        ? InventoryAction.INWARD
        : InventoryAction.MANUAL_ADJUSTMENT;
    const result = await this.inventoryService.adjustStockByIdentifier(
      identifier,
      incrementBy,
      action,
      { notes: reason, referenceId, performedBy },
    );
    const logs = await this.inventoryService.getLogsBySku(result.sku);
    return logs[0];
  }

  // ─── recordStockInward ─────────────────────────────────────────────────────
  // Dedicated Stock-In from Proof App scan or admin panel.
  // Always records as INWARD with vendor / purchase-order metadata.
  @Mutation(() => InventoryLog, { name: 'recordStockInward' })
  @Roles(Role.ADMIN, Role.PACKER)
  async recordStockInward(
    @Args('identifier') identifier: string,
    @Args('quantityAdded', { type: () => Int }) quantityAdded: number,
    @Args('vendor', { type: () => String, nullable: true }) vendor: string,
    @Args('purchaseOrderRef', { type: () => String, nullable: true })
    purchaseOrderRef: string,
    @Args('performedBy', { type: () => String, nullable: true })
    performedBy: string,
    @Args('notes', { type: () => String, nullable: true }) notes: string,
  ): Promise<any> {
    const result = await this.inventoryService.recordInward(
      identifier,
      quantityAdded,
      { vendor, referenceId: purchaseOrderRef, performedBy, notes },
    );
    const logs = await this.inventoryService.getLogsBySku(result.sku);
    return logs[0];
  }

  // ─── setInventory (Proof App absolute set) ─────────────────────────────────
  @Mutation(() => InventoryLog, { name: 'setInventory' })
  @Roles(Role.ADMIN, Role.PACKER)
  async setInventory(
    @Args('identifier') identifier: string,
    @Args('newStockLevel', { type: () => Int }) newStockLevel: number,
    @Args('performedBy', { type: () => String, nullable: true })
    performedBy: string,
  ): Promise<any> {
    const result = await this.inventoryService.setStockLevel(
      identifier,
      newStockLevel,
      { performedBy, notes: 'Manual stock set via Proof App' },
    );
    const logs = await this.inventoryService.getLogsBySku(result.sku);
    return logs[0];
  }

  // ─── forceAvailabilityStatus ───────────────────────────────────────────────
  // Mark product Out of Stock / back In Stock without touching quantity.
  @Mutation(() => InventoryLog, { name: 'forceAvailabilityStatus' })
  @Roles(Role.ADMIN)
  async forceAvailabilityStatus(
    @Args('identifier') identifier: string,
    @Args('status') status: string,
    @Args('reason') reason: string,
    @Args('performedBy', { type: () => String, nullable: true })
    performedBy: string,
  ): Promise<any> {
    if (status !== 'in_stock' && status !== 'out_of_stock') {
      throw new Error("status must be 'in_stock' or 'out_of_stock'");
    }
    await this.inventoryService.forceAvailabilityStatus(
      identifier,
      status as 'in_stock' | 'out_of_stock',
      performedBy || 'ADMIN',
      reason,
    );
    const logs = await this.inventoryService.getLogsBySku(
      (await this.inventoryService.findProductByAnyIdentifier(identifier))
        ?.variants?.find((v) => v.sku === identifier || v.gtin === identifier)
        ?.sku || identifier,
    );
    return logs[0];
  }

  // ─── inventoryLogs (with pagination + action filter) ──────────────────────
  @Query(() => [InventoryLog], { name: 'inventoryLogs' })
  @Roles(Role.ADMIN)
  async getInventoryLogs(
    @Args('sku') sku: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('actionType', { type: () => InventoryAction, nullable: true })
    actionType?: InventoryAction,
  ): Promise<InventoryLog[]> {
    if (page || limit || actionType) {
      const { logs } = await this.inventoryService.getLogsBySkuPaginated(
        sku,
        page || 1,
        limit || 20,
        actionType,
      );
      return logs;
    }
    return this.inventoryService.getLogsBySku(sku);
  }

  // ─── inventorySnapshot ────────────────────────────────────────────────────
  @Query(() => InventorySnapshot, { name: 'inventorySnapshot', nullable: true })
  @Roles(Role.ADMIN, Role.PACKER)
  async getInventorySnapshot(
    @Args('identifier') identifier: string,
  ): Promise<any> {
    return this.inventoryService.getInventorySnapshot(identifier);
  }

  /**
   * Exact indexed lookup by variant SKU or variant GTIN.
   * Returns null when not found. Accessible by Packers.
   */
  @Query(() => Product, { name: 'findProductByIdentifier', nullable: true })
  @Roles(Role.ADMIN, Role.PACKER)
  async findProductByIdentifier(
    @Args('identifier') identifier: string,
  ): Promise<Product | null> {
    return this.productService.findBySkuOrGtin(identifier);
  }

  /**
   * Returns all products that have at least one in-stock variant with
   * isSaleVariant = true. Used to power the Sale section on the homepage
   * and the /sale page on the website.
   */
  @Query(() => [Product], { name: 'nearExpirySaleProducts' })
  @Public()
  async getNearExpirySaleProducts(): Promise<Product[]> {
    return this.productService.findSaleProducts();
  }

  /**
   * All active products (unlike nearExpirySaleProducts, not limited to
   * isSaleVariant items), paginated and sorted by discount percentage
   * (highest first). Powers /landing-sale.
   */
  @Query(() => PaginatedProducts, { name: 'saleProductsPaginated' })
  @Public()
  async getSaleProductsPaginated(
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 10 },
    })
    pagination: PaginationInput,
  ): Promise<PaginatedProducts> {
    const result = await this.productService.findSaleProductsPaginated(
      pagination.page,
      pagination.limit,
    );
    return {
      items: result.items,
      meta: result.meta,
    };
  }
}

import { Resolver, Query, Mutation, Args, ID, Int, ResolveField, Parent, Float } from '@nestjs/graphql';
import { SkuMasterService } from './sku-master.service';
import { SkuMaster } from './sku-master.schema';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { InputType, Field } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../product/product.schema';

// ---------------------------------------------------------------------------
// Input type for bulk upsert — mirrors every nullable field in SkuMaster
// ---------------------------------------------------------------------------
@InputType()
export class SkuMasterRowInput {
  @Field(() => Int)
  masterSku: number;

  @Field()
  skuName: string;

  @Field({ nullable: true })
  vendorName?: string;

  @Field({ nullable: true })
  vendorContactDetails?: string;

  @Field({ nullable: true })
  jobStructure?: string;

  @Field({ nullable: true })
  uom?: string;

  @Field(() => Int, { nullable: true })
  caseSize?: number;

  @Field(() => Float, { nullable: true })
  mrp?: number;

  @Field(() => Float, { nullable: true })
  sellingPrice?: number;

  @Field({ nullable: true })
  npiLinksRaw?: string;

  @Field({ nullable: true })
  npiLinksUpdated?: string;

  @Field({ nullable: true })
  printFilesRaw?: string;

  @Field({ nullable: true })
  printFilesUpdated?: string;
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------
@Resolver(() => SkuMaster)
export class SkuMasterResolver {
  constructor(
    private readonly skuMasterService: SkuMasterService,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  @ResolveField(() => Float, { name: 'sellingPrice', nullable: true })
  async getSellingPrice(@Parent() skuMaster: SkuMaster): Promise<number | null> {
    if (!skuMaster.skuName) return null;

    const cleanedSkuName = skuMaster.skuName.trim();
    const escapedSkuName = cleanedSkuName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // 1. Exact case-insensitive match on variant name
    try {
      const product = await this.productModel.findOne({
        'variants.name': { $regex: new RegExp('^' + escapedSkuName + '$', 'i') }
      }).exec();

      if (product) {
        const variant = product.variants.find(
          (v) => v.name.toLowerCase() === cleanedSkuName.toLowerCase()
        );
        if (variant) return variant.price;
      }
    } catch (err) {
      // Ignore regex or query errors and proceed to next mapping strategy
    }

    // 2. Exact match or includes on SKU code using masterSku numeric ID
    try {
      const productBySku = await this.productModel.findOne({
        'variants.sku': { $regex: new RegExp(String(skuMaster.masterSku), 'i') }
      }).exec();

      if (productBySku) {
        const variant = productBySku.variants.find((v) =>
          v.sku.toLowerCase().includes(String(skuMaster.masterSku).toLowerCase())
        );
        if (variant) return variant.price;
      }
    } catch (err) {
      // Ignore and proceed
    }

    // 3. Looser substring matching on variant name
    try {
      const looserProduct = await this.productModel.findOne({
        'variants.name': { $regex: new RegExp(escapedSkuName, 'i') }
      }).exec();

      if (looserProduct) {
        const variant = looserProduct.variants.find((v) =>
          v.name.toLowerCase().includes(cleanedSkuName.toLowerCase()) ||
          cleanedSkuName.toLowerCase().includes(v.name.toLowerCase())
        );
        if (variant) return variant.price;
      }
    } catch (err) {
      // Ignore and proceed
    }

    // 4. Default: If not found in product database, fallback to SkuMaster MRP with 30% discount
    return skuMaster.mrp ? Number((skuMaster.mrp * 0.7).toFixed(2)) : null;
  }

  /**
   * Return all SKU master records, sorted by masterSku ascending.
   * Restricted to ADMIN role.
   */
  @Query(() => [SkuMaster], { name: 'skuMasters' })
  @Roles(Role.ADMIN)
  async getSkuMasters(): Promise<SkuMaster[]> {
    return this.skuMasterService.findAll();
  }

  /**
   * Return a single SKU master record by MongoDB _id.
   */
  @Query(() => SkuMaster, { name: 'skuMasterById', nullable: true })
  @Roles(Role.ADMIN)
  async getSkuMasterById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SkuMaster | null> {
    return this.skuMasterService.findById(id);
  }

  /**
   * Return a single SKU master record by its numeric masterSku value.
   */
  @Query(() => SkuMaster, { name: 'skuMasterByMasterSku', nullable: true })
  @Roles(Role.ADMIN)
  async getSkuMasterByMasterSku(
    @Args('masterSku', { type: () => Int }) masterSku: number,
  ): Promise<SkuMaster | null> {
    return this.skuMasterService.findByMasterSku(masterSku);
  }

  /**
   * Bulk-upsert rows parsed from an Excel / CSV file uploaded via the admin
   * panel. Returns the total number of records affected (inserted + updated).
   */
  @Mutation(() => Int, { name: 'bulkUpsertSkuMasters' })
  @Roles(Role.ADMIN)
  async bulkUpsertSkuMasters(
    @Args('rows', { type: () => [SkuMasterRowInput] }) rows: SkuMasterRowInput[],
  ): Promise<number> {
    return this.skuMasterService.bulkUpsert(rows);
  }
}

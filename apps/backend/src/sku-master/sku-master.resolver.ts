import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { SkuMasterService } from './sku-master.service';
import { SkuMaster } from './sku-master.schema';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { InputType, Field, Float } from '@nestjs/graphql';

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
  constructor(private readonly skuMasterService: SkuMasterService) {}

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

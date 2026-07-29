import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { StockBatchService } from './stock-batch.service';
import { StockBatch } from './stock-batch.schema';
import { PurchaseOrder } from './purchase-order.schema';
import { ReceiveBatchInput } from './dto/receive-batch.input';
import { CreatePurchaseOrderInput } from './dto/create-purchase-order.input';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver()
export class StockBatchResolver {
  constructor(private readonly stockBatchService: StockBatchService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // MUTATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Called from Proof App when new stock arrives.
   * Creates a StockBatch (and optionally a PurchaseOrder) and updates
   * variant.stockQuantity via InventoryService.
   */
  @Mutation(() => StockBatch, { name: 'receiveStockBatch' })
  @Roles(Role.ADMIN, Role.PACKER)
  async receiveStockBatch(
    @Args('input') input: ReceiveBatchInput,
  ): Promise<StockBatch> {
    return this.stockBatchService.receiveBatch(input);
  }

  /**
   * Creates a new Purchase Order (Bill Session) upfront before any batches are added.
   */
  @Mutation(() => PurchaseOrder, { name: 'createPurchaseOrder' })
  @Roles(Role.ADMIN, Role.PACKER)
  async createPurchaseOrder(
    @Args('input') input: CreatePurchaseOrderInput,
  ): Promise<PurchaseOrder> {
    return this.stockBatchService.createPurchaseOrder(input);
  }

  /**
   * Manual admin trigger for expiry check.
   * Marks expired batches and flags near-expiry batches as on_sale.
   * In production, add @Cron('0 6 * * *') to StockBatchService for daily auto-run.
   */
  @Mutation(() => String, { name: 'runExpiryCheck' })
  @Roles(Role.ADMIN)
  async runExpiryCheck(): Promise<string> {
    const result = await this.stockBatchService.runExpiryCheck();
    return `Done: ${result.expired} batch(es) expired, ${result.flagged} batch(es) flagged on_sale.`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────────────────

  /** All batches for a SKU sorted by expiryDate ASC (nearest first) */
  @Query(() => [StockBatch], { name: 'stockBatchesBySku' })
  @Roles(Role.ADMIN)
  async getStockBatchesBySku(
    @Args('sku') sku: string,
  ): Promise<StockBatch[]> {
    return this.stockBatchService.getBatchesBySku(sku);
  }

  /** All batches belonging to a PurchaseOrder (bill) */
  @Query(() => [StockBatch], { name: 'stockBatchesByPurchaseOrder' })
  @Roles(Role.ADMIN)
  async getStockBatchesByPo(
    @Args('purchaseOrderId', { type: () => ID }) purchaseOrderId: string,
  ): Promise<StockBatch[]> {
    return this.stockBatchService.getBatchesByPurchaseOrder(purchaseOrderId);
  }

  /** Paginated list of all PurchaseOrders (bills) */
  @Query(() => [PurchaseOrder], { name: 'purchaseOrders' })
  @Roles(Role.ADMIN, Role.PACKER)
  async getPurchaseOrders(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<PurchaseOrder[]> {
    const { items } = await this.stockBatchService.getPurchaseOrders(page, limit);
    return items;
  }

  /** Single PurchaseOrder detail */
  @Query(() => PurchaseOrder, { name: 'purchaseOrder', nullable: true })
  @Roles(Role.ADMIN, Role.PACKER)
  async getPurchaseOrder(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PurchaseOrder | null> {
    return this.stockBatchService.getPurchaseOrderById(id);
  }

  /**
   * Active batches expiring within `withinDays` days (default 30).
   * Used for admin expiry alert dashboard and near-expiry sale decisions.
   */
  @Query(() => [StockBatch], { name: 'expiringBatches' })
  @Roles(Role.ADMIN)
  async getExpiringBatches(
    @Args('withinDays', { type: () => Int, defaultValue: 30 }) withinDays: number,
  ): Promise<StockBatch[]> {
    return this.stockBatchService.getExpiringBatches(withinDays);
  }
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockBatch, StockBatchDocument, BatchStatus } from './stock-batch.schema';
import { PurchaseOrder, PurchaseOrderDocument, PurchaseOrderStatus } from './purchase-order.schema';
import { InventoryService } from '../product/services/inventory.service';
import { ReceiveBatchInput } from './dto/receive-batch.input';
import { CreatePurchaseOrderInput } from './dto/create-purchase-order.input';

@Injectable()
export class StockBatchService {
  private readonly logger = new Logger(StockBatchService.name);

  constructor(
    @InjectModel(StockBatch.name)
    private readonly batchModel: Model<StockBatchDocument>,
    @InjectModel(PurchaseOrder.name)
    private readonly poModel: Model<PurchaseOrderDocument>,
    private readonly inventoryService: InventoryService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate unique batch number: BATCH-{YEAR}-{SEQ:0000}
   * Uses total document count for sequencing (simple, monotonic).
   */
  private async generateBatchNumber(): Promise<string> {
    const count = await this.batchModel.countDocuments();
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(4, '0');
    return `BATCH-${year}-${seq}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECEIVE STOCK BATCH — called from Proof App when new goods arrive
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Creates (or attaches to) a PurchaseOrder, creates a StockBatch,
   * and calls InventoryService.recordInward() to update variant.stockQuantity.
   *
   * This is the single entry point for batch-tracked stock receiving.
   */
  async receiveBatch(input: ReceiveBatchInput): Promise<StockBatch> {
    this.logger.log(`Receiving batch for SKU=${input.sku}, qty=${input.quantityAdded}, expiry=${input.expiryDate}`);

    // ── Step 1: Resolve or create PurchaseOrder ───────────────────────────
    let po: PurchaseOrderDocument | null = null;

    if (input.purchaseOrderId) {
      po = await this.poModel.findById(input.purchaseOrderId).exec();
      if (!po) {
        throw new Error(`PurchaseOrder not found: ${input.purchaseOrderId}`);
      }
      this.logger.log(`Attached to existing PO: ${po.billNumber}`);
    } else if (input.billNumber) {
      po = await this.poModel.create({
        billNumber: input.billNumber,
        billDate: input.billDate || new Date().toISOString().split('T')[0],
        vendorName: input.vendorName,
        vendorContact: input.vendorContact,
        totalAmount: input.totalAmount,
        billImageUrls: input.billImageUrls || [],
        receivedBy: input.performedBy,
        status: PurchaseOrderStatus.CONFIRMED,
      });
      this.logger.log(`Created new PO: ${po.billNumber} (_id=${po._id})`);
    }
    // po may be null if no bill info provided — backward compat with label-less inward

    // ── Step 2: Create StockBatch ─────────────────────────────────────────
    const batchNumber = await this.generateBatchNumber();

    const batch = await this.batchModel.create({
      purchaseOrderId: po?._id?.toString() || null,
      sku: input.sku,
      batchNumber,
      expiryDate: input.expiryDate,
      manufactureDate: input.manufactureDate,
      quantityReceived: input.quantityAdded,
      quantityRemaining: input.quantityAdded,
      perUnitCost: input.perUnitCost,
      status: BatchStatus.ACTIVE,
      isOnSale: false,
      nearExpiryAlertDays: 30,
      receivedBy: input.performedBy,
    });

    this.logger.log(
      `Created StockBatch: ${batchNumber}, SKU=${input.sku}, ` +
      `qty=${input.quantityAdded}, expiry=${input.expiryDate}`,
    );

    // ── Step 3: Update variant.stockQuantity via existing InventoryService ─
    // This keeps the fast-read total on the Product document in sync.
    await this.inventoryService.recordInward(
      input.sku,
      input.quantityAdded,
      {
        referenceId: batch._id.toString(),
        performedBy: input.performedBy,
        notes:
          input.notes ||
          `Batch ${batchNumber} received. Expiry: ${input.expiryDate}` +
          (input.vendorName ? `. Vendor: ${input.vendorName}` : ''),
        vendor: input.vendorName,
      },
    );

    return batch;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FEFO DEDUCTION — called exclusively from packing.service.ts
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Deducts `qtyToDeduct` units from active batches sorted by expiryDate ASC
   * (First Expired, First Out).
   *
   * ⚠️ IMPORTANT: This method does NOT update variant.stockQuantity.
   * That is handled separately by packing.service.ts via
   * InventoryService.adjustStockByIdentifier() to avoid double deduction.
   *
   * Batches whose quantityRemaining reaches 0 are automatically marked DEPLETED.
   */
  async deductFEFO(
    sku: string,
    qtyToDeduct: number,
    referenceId: string,
    performedBy: string,
  ): Promise<void> {
    if (qtyToDeduct <= 0) return;

    this.logger.log(
      `FEFO deduct: SKU=${sku}, qty=${qtyToDeduct}, orderId=${referenceId}`,
    );

    const activeBatches = await this.batchModel
      .find({
        sku,
        status: BatchStatus.ACTIVE,
        quantityRemaining: { $gt: 0 },
      })
      .sort({ expiryDate: 1 })   // FEFO: nearest expiry first
      .exec();

    if (activeBatches.length === 0) {
      this.logger.warn(
        `FEFO: No active batches found for SKU=${sku}. ` +
        `Stock may have been set without batch tracking.`,
      );
      return; // Non-blocking — variant.stockQuantity still updated by caller
    }

    let remaining = qtyToDeduct;

    for (const batch of activeBatches) {
      if (remaining <= 0) break;

      const deductFromBatch = Math.min(remaining, batch.quantityRemaining);
      batch.quantityRemaining -= deductFromBatch;
      remaining -= deductFromBatch;

      if (batch.quantityRemaining === 0) {
        batch.status = BatchStatus.DEPLETED;
        this.logger.log(
          `Batch ${batch.batchNumber} DEPLETED (expiry=${batch.expiryDate})`,
        );
      }

      await batch.save();

      this.logger.log(
        `FEFO: deducted ${deductFromBatch} from batch ${batch.batchNumber} ` +
        `(expiry=${batch.expiryDate}, remaining=${batch.quantityRemaining})`,
      );
    }

    if (remaining > 0) {
      this.logger.warn(
        `FEFO: ${remaining} units could not be deducted from batches for SKU=${sku}. ` +
        `Batches may be out of sync with variant.stockQuantity.`,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PURCHASE ORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  async createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    const existing = await this.poModel.findOne({ billNumber: input.billNumber }).exec();
    if (existing) {
      throw new BadRequestException(`A bill with number "${input.billNumber}" already exists.`);
    }

    const po = await this.poModel.create({
      billNumber: input.billNumber,
      billDate: input.billDate || new Date().toISOString().split('T')[0],
      vendorName: input.vendorName,
      vendorContact: input.vendorContact,
      totalAmount: input.totalAmount,
      billImageUrls: input.billImageUrls || [],
      receivedBy: input.performedBy,
      notes: input.notes,
      status: PurchaseOrderStatus.CONFIRMED,
    });
    this.logger.log(`Created new standalone PO: ${po.billNumber} (_id=${po._id})`);
    return po;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────────────────

  /** All batches for a SKU sorted by expiry date (nearest first) */
  async getBatchesBySku(sku: string): Promise<StockBatch[]> {
    return this.batchModel.find({ sku }).sort({ expiryDate: 1 }).exec();
  }

  /** All batches belonging to a PurchaseOrder */
  async getBatchesByPurchaseOrder(purchaseOrderId: string): Promise<StockBatch[]> {
    return this.batchModel
      .find({ purchaseOrderId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /** Paginated list of all PurchaseOrders (newest first) */
  async getPurchaseOrders(
    page = 1,
    limit = 20,
  ): Promise<{ items: PurchaseOrder[]; total: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.poModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.poModel.countDocuments(),
    ]);
    return { items, total };
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    return this.poModel.findById(id).exec();
  }

  /** Batches expiring within `withinDays` days, active only, sorted nearest first */
  async getExpiringBatches(withinDays = 30): Promise<StockBatch[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return this.batchModel
      .find({
        status: BatchStatus.ACTIVE,
        expiryDate: { $lte: cutoff.toISOString().split('T')[0] },
      })
      .sort({ expiryDate: 1 })
      .exec();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXPIRY CHECK — run daily via @Cron or manual admin trigger
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Marks expired batches as EXPIRED.
   * Flags near-expiry batches as isOnSale = true.
   *
   * Called by:
   *   - runExpiryCheck() GraphQL mutation (manual admin trigger)
   *   - (Future) @Cron('0 6 * * *') daily at 6 AM
   */
  async runExpiryCheck(): Promise<{ flagged: number; expired: number }> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let flagged = 0;
    let expired = 0;

    this.logger.log(`Running expiry check for date: ${todayStr}`);

    // ── Mark expired ──────────────────────────────────────────────────────
    const expiredBatches = await this.batchModel
      .find({
        status: BatchStatus.ACTIVE,
        expiryDate: { $lte: todayStr },
      })
      .exec();

    for (const batch of expiredBatches) {
      batch.status = BatchStatus.EXPIRED;
      await batch.save();
      expired++;
      this.logger.warn(
        `Batch ${batch.batchNumber} EXPIRED (sku=${batch.sku}, expiry=${batch.expiryDate}, remaining=${batch.quantityRemaining})`,
      );
    }

    // ── Flag near-expiry as on_sale ───────────────────────────────────────
    const alertBatches = await this.batchModel
      .find({ status: BatchStatus.ACTIVE, isOnSale: false })
      .exec();

    for (const batch of alertBatches) {
      const daysUntilExpiry = Math.ceil(
        (new Date(batch.expiryDate).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysUntilExpiry <= batch.nearExpiryAlertDays) {
        batch.isOnSale = true;
        batch.status = BatchStatus.ON_SALE;
        await batch.save();
        flagged++;
        this.logger.log(
          `Batch ${batch.batchNumber} flagged ON_SALE ` +
          `(sku=${batch.sku}, expiry=${batch.expiryDate}, daysLeft=${daysUntilExpiry})`,
        );
      }
    }

    this.logger.log(
      `Expiry check done: ${expired} expired, ${flagged} flagged on_sale`,
    );

    return { flagged, expired };
  }
}

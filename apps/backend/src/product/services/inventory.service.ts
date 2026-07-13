import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, ProductVariant } from '../product.schema';
import {
  InventoryLog,
  InventoryLogDocument,
  InventoryAction,
} from '../inventory-log.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(InventoryLog.name)
    private logModel: Model<InventoryLogDocument>,
  ) { }

  // ─────────────────────────────────────────────────────────────────────────
  // STOCK IN — Incremental inward (used by scan/manual inward from Proof App)
  // Always records as INWARD action type, auto-syncs availabilityStatus.
  // ─────────────────────────────────────────────────────────────────────────
  async recordInward(
    identifier: string,
    quantityAdded: number,
    metadata: {
      vendor?: string;
      referenceId?: string;
      performedBy?: string;
      notes?: string;
    } = {},
  ): Promise<{ success: boolean; newStock: number; sku: string }> {
    if (quantityAdded <= 0) {
      throw new Error('quantityAdded must be a positive integer for INWARD');
    }
    const { product, variant } = await this.identifyVariant(identifier);
    const sku = variant.sku;
    const { previousStock } = await this.performAtomicIncrement(sku, quantityAdded);
    const newStock = previousStock + quantityAdded;

    // Auto-sync: when stock goes positive, mark in_stock
    await this.syncAvailabilityStatus(sku, newStock, variant.availabilityStatus);

    await this.recordTransaction({
      sku,
      productId: product._id.toString(),
      changeAmount: quantityAdded,
      previousStock,
      newStock,
      actionType: InventoryAction.INWARD,
      vendor: metadata.vendor,
      referenceId: metadata.referenceId,
      performedBy: metadata.performedBy,
      notes: metadata.notes,
    });

    return { success: true, newStock, sku };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STOCK ADJUSTMENT — Incremental (used by packing deduction & manual delta)
  // ─────────────────────────────────────────────────────────────────────────
  async adjustStockByIdentifier(
    identifier: string,
    amount: number,
    action: InventoryAction,
    metadata: {
      referenceId?: string;
      performedBy?: string;
      notes?: string;
    } = {},
  ): Promise<{ success: boolean; newStock: number; sku: string }> {
    const { product, variant } = await this.identifyVariant(identifier);
    const sku = variant.sku;
    const { previousStock } = await this.performAtomicIncrement(sku, amount);
    const newStock = previousStock + amount;

    // Auto-sync availability based on new stock level
    await this.syncAvailabilityStatus(sku, newStock, variant.availabilityStatus);

    await this.recordTransaction({
      sku,
      productId: product._id.toString(),
      changeAmount: amount,
      previousStock,
      newStock,
      actionType: action,
      ...metadata,
    });

    return { success: true, newStock, sku };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SET STOCK — Absolute set (used by Proof App "set to X" override)
  // ─────────────────────────────────────────────────────────────────────────
  async setStockLevel(
    identifier: string,
    newStockLevel: number,
    metadata: {
      referenceId?: string;
      performedBy?: string;
      notes?: string;
    } = {},
  ): Promise<{ success: boolean; newStock: number; sku: string }> {
    const { product, variant } = await this.identifyVariant(identifier);
    const sku = variant.sku;
    const previousStock = variant.stockQuantity;
    await this.performAbsoluteSet(sku, newStockLevel);
    const changeAmount = newStockLevel - previousStock;

    // Auto-sync availability based on new stock level
    await this.syncAvailabilityStatus(sku, newStockLevel, variant.availabilityStatus);

    await this.recordTransaction({
      sku,
      productId: product._id.toString(),
      changeAmount,
      previousStock,
      newStock: newStockLevel,
      actionType: InventoryAction.MANUAL_ADJUSTMENT,
      ...metadata,
    });
    return { success: true, newStock: newStockLevel, sku };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORCE AVAILABILITY — Override status without touching quantity
  // Used by admin: "Mark Out of Stock even if qty > 0" and the reverse
  // ─────────────────────────────────────────────────────────────────────────
  async forceAvailabilityStatus(
    identifier: string,
    status: 'in_stock' | 'out_of_stock',
    performedBy: string,
    reason: string,
  ): Promise<{ success: boolean; sku: string; newStatus: string }> {
    const { product, variant } = await this.identifyVariant(identifier);
    const sku = variant.sku;
    const currentStock = variant.stockQuantity;

    // Update only the availability status, not stockQuantity
    await this.productModel
      .findOneAndUpdate(
        { 'variants.sku': sku },
        { $set: { 'variants.$.availabilityStatus': status } },
      )
      .exec();

    // Log the override — changeAmount is 0 since quantity didn't change
    await this.recordTransaction({
      sku,
      productId: product._id.toString(),
      changeAmount: 0,
      previousStock: currentStock,
      newStock: currentStock,
      actionType: InventoryAction.AVAILABILITY_OVERRIDE,
      overrideReason: reason,
      performedBy,
      notes: `Status forced to '${status}'. Reason: ${reason}`,
    });

    return { success: true, sku, newStatus: status };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUERY — Logs by SKU with optional pagination + action filter
  // ─────────────────────────────────────────────────────────────────────────
  async getLogsBySku(sku: string): Promise<InventoryLog[]> {
    return this.logModel.find({ sku }).sort({ createdAt: -1 }).exec();
  }

  async getLogsBySkuPaginated(
    sku: string,
    page = 1,
    limit = 20,
    actionType?: InventoryAction,
  ): Promise<{ logs: InventoryLog[]; total: number }> {
    const filter: any = { sku };
    if (actionType) filter.actionType = actionType;
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.logModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.logModel.countDocuments(filter).exec(),
    ]);
    return { logs, total };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUERY — Snapshot: current stock + last N logs for a SKU
  // ─────────────────────────────────────────────────────────────────────────
  async getInventorySnapshot(identifier: string): Promise<{
    sku: string;
    stockQuantity: number;
    availabilityStatus: string;
    recentLogs: InventoryLog[];
  }> {
    const { variant } = await this.identifyVariant(identifier);
    const recentLogs = await this.logModel
      .find({ sku: variant.sku })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
    return {
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      availabilityStatus: variant.availabilityStatus,
      recentLogs,
    };
  }

  async findProductByAnyIdentifier(
    identifier: string,
  ): Promise<Product | null> {
    return this.productModel
      .findOne({
        $or: [
          { 'variants.sku': identifier },
          { 'variants.gtin': identifier },
          { gtin: identifier },
        ],
      })
      .exec();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Identify a variant by SKU or GTIN.
   */
  private async identifyVariant(
    identifier: string,
  ): Promise<{ product: ProductDocument; variant: ProductVariant }> {
    const product = await this.productModel
      .findOne({
        $or: [{ 'variants.sku': identifier }, { 'variants.gtin': identifier }],
      })
      .exec();

    if (!product) {
      throw new NotFoundException(
        `No product variant found for identifier: ${identifier}`,
      );
    }

    const variant = product.variants.find(
      (v) => v.sku === identifier || v.gtin === identifier,
    );

    if (!variant) {
      throw new Error(`Variant data mismatch for identifier: ${identifier}`);
    }

    return { product, variant };
  }

  /**
   * Atomic INCREMENTAL update ($inc). Returns the stock BEFORE the increment.
   */
  private async performAtomicIncrement(
    sku: string,
    amount: number,
  ): Promise<{ previousStock: number }> {
    const updatedProduct = await this.productModel
      .findOneAndUpdate(
        { 'variants.sku': sku },
        { $inc: { 'variants.$.stockQuantity': amount } },
        { new: false }, // return doc BEFORE update so we have previousStock
      )
      .exec();
    if (!updatedProduct)
      throw new Error(`Failed to update stock for SKU: ${sku}`);
    const variant = updatedProduct.variants.find((v) => v.sku === sku);
    if (!variant)
      throw new Error(
        `Variant with SKU ${sku} not found in the updated product`,
      );
    return { previousStock: variant.stockQuantity };
  }

  /**
   * ABSOLUTE set ($set).
   */
  private async performAbsoluteSet(
    sku: string,
    newStockLevel: number,
  ): Promise<void> {
    await this.productModel
      .findOneAndUpdate(
        { 'variants.sku': sku },
        { $set: { 'variants.$.stockQuantity': newStockLevel } },
      )
      .exec();
  }

  /**
   * Auto-sync availabilityStatus based on new stock level.
   * Rules:
   *  - newStock <= 0 → force 'out_of_stock'
   *  - newStock > 0 AND currently 'out_of_stock' → restore 'in_stock'
   * Does NOT override admin force-overrides for in_stock → out_of_stock
   * when stock is still positive (that's handled by forceAvailabilityStatus).
   */
  private async syncAvailabilityStatus(
    sku: string,
    newStock: number,
    currentStatus: string,
  ): Promise<void> {
    if (newStock <= 0 && currentStatus !== 'out_of_stock') {
      await this.productModel
        .findOneAndUpdate(
          { 'variants.sku': sku },
          { $set: { 'variants.$.availabilityStatus': 'out_of_stock' } },
        )
        .exec();
    } else if (newStock > 0 && currentStatus === 'out_of_stock') {
      await this.productModel
        .findOneAndUpdate(
          { 'variants.sku': sku },
          { $set: { 'variants.$.availabilityStatus': 'in_stock' } },
        )
        .exec();
    }
  }

  /**
   * Record audit log entry.
   */
  private async recordTransaction(
    logData: Partial<InventoryLog>,
  ): Promise<void> {
    await this.logModel.create(logData as any);
  }
}

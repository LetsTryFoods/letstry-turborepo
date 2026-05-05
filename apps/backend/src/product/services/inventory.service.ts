import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, ProductVariant } from '../product.schema';
import { InventoryLog, InventoryLogDocument, InventoryAction } from '../inventory-log.schema';

// Actions that use $set (absolute) vs $inc (relative)
const ABSOLUTE_ACTIONS = new Set([InventoryAction.MANUAL_ADJUSTMENT, InventoryAction.INWARD]);

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(InventoryLog.name) private logModel: Model<InventoryLogDocument>,
  ) {}

  /**
   * Main orchestrator — INCREMENTAL (used by packing only).
   * Adds or subtracts `amount` from current stock.
   */
  async adjustStockByIdentifier(
    identifier: string,
    amount: number,
    action: InventoryAction,
    metadata: { referenceId?: string; performedBy?: string; notes?: string } = {},
  ): Promise<{ success: boolean; newStock: number; sku: string }> {
    const { product, variant } = await this.identifyVariant(identifier);
    const sku = variant.sku;
    const { previousStock } = await this.performAtomicIncrement(sku, amount);
    const newStock = previousStock + amount;
    await this.recordTransaction({ sku, productId: product._id.toString(), changeAmount: amount, previousStock, newStock, actionType: action, ...metadata });
    return { success: true, newStock, sku };
  }

  /**
   * Main orchestrator — ABSOLUTE (used by Proof App manual/scan inward).
   * Sets stock TO the given value regardless of current stock.
   */
  async setStockLevel(
    identifier: string,
    newStockLevel: number,
    metadata: { referenceId?: string; performedBy?: string; notes?: string } = {},
  ): Promise<{ success: boolean; newStock: number; sku: string }> {
    const { product, variant } = await this.identifyVariant(identifier);
    const sku = variant.sku;
    const previousStock = variant.stockQuantity;
    await this.performAbsoluteSet(sku, newStockLevel);
    const changeAmount = newStockLevel - previousStock;
    await this.recordTransaction({ sku, productId: product._id.toString(), changeAmount, previousStock, newStock: newStockLevel, actionType: InventoryAction.MANUAL_ADJUSTMENT, ...metadata });
    return { success: true, newStock: newStockLevel, sku };
  }

  /**
   * Responsibility: Identify a variant by SKU or GTIN.
   * Matches the unique variant level fields.
   */
  private async identifyVariant(identifier: string): Promise<{ product: ProductDocument, variant: ProductVariant }> {
    const product = await this.productModel.findOne({
      $or: [
        { 'variants.sku': identifier },
        { 'variants.gtin': identifier }
      ]
    }).exec();

    if (!product) {
      throw new NotFoundException(`No product variant found for identifier: ${identifier}`);
    }

    const variant = product.variants.find(
      v => v.sku === identifier || v.gtin === identifier
    );

    if (!variant) {
      // This should logically not happen if product was found via $or, but added for type safety
      throw new Error(`Variant data mismatch for identifier: ${identifier}`);
    }

    return { product, variant };
  }

  /**
   * Responsibility: Perform atomic INCREMENTAL update ($inc).
   */
  private async performAtomicIncrement(sku: string, amount: number): Promise<{ previousStock: number }> {
    const updatedProduct = await this.productModel.findOneAndUpdate(
      { 'variants.sku': sku },
      { $inc: { 'variants.$.stockQuantity': amount } },
      { new: false },
    ).exec();
    if (!updatedProduct) throw new Error(`Failed to update stock for SKU: ${sku}`);
    const variant = updatedProduct.variants.find(v => v.sku === sku);
    if (!variant) throw new Error(`Variant with SKU ${sku} not found in the updated product`);
    return { previousStock: variant.stockQuantity };
  }

  /**
   * Responsibility: Perform ABSOLUTE set ($set).
   */
  private async performAbsoluteSet(sku: string, newStockLevel: number): Promise<void> {
    await this.productModel.findOneAndUpdate(
      { 'variants.sku': sku },
      { $set: { 'variants.$.stockQuantity': newStockLevel } },
    ).exec();
  }

  /**
   * Responsibility: Record the audit log entry.
   */
  private async recordTransaction(logData: Partial<InventoryLog>): Promise<void> {
    await this.logModel.create(logData);
  }

  /**
   * Public query methods
   */
  async getLogsBySku(sku: string): Promise<InventoryLog[]> {
    return this.logModel.find({ sku }).sort({ createdAt: -1 }).exec();
  }

  async findProductByAnyIdentifier(identifier: string): Promise<Product | null> {
    return this.productModel.findOne({
      $or: [
        { 'variants.sku': identifier },
        { 'variants.gtin': identifier },
        { gtin: identifier } // Fallback to product-level GTIN if any
      ]
    }).exec();
  }
}

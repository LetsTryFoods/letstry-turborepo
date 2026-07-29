import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ObjectType, Field, Int, Float, ID, registerEnumType } from '@nestjs/graphql';

export type StockBatchDocument = StockBatch & Document;

export enum BatchStatus {
  ACTIVE = 'active',
  DEPLETED = 'depleted',
  EXPIRED = 'expired',
  ON_SALE = 'on_sale',
}

registerEnumType(BatchStatus, { name: 'BatchStatus' });

/**
 * StockBatch — one document per stock receiving event per SKU.
 *
 * One purchase order (bill) can have multiple StockBatches (one per SKU line).
 * FEFO (First Expired First Out) is enforced at deduction time using expiryDate ASC.
 *
 * quantityRemaining is decremented atomically during packing.
 * variant.stockQuantity (on Product document) remains the canonical total — updated
 * separately by InventoryService.adjustStockByIdentifier().
 */
@Schema({ timestamps: true, collection: 'stockbatches' })
@ObjectType()
export class StockBatch {
  @Field(() => ID)
  _id: string;

  /** Reference to the bill/invoice this batch arrived with */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PurchaseOrder', index: true })
  @Field(() => ID, { nullable: true })
  purchaseOrderId?: string;

  /** Variant SKU — canonical identifier used throughout the codebase */
  @Prop({ required: true, index: true })
  @Field()
  sku: string;

  /** Auto-generated e.g. "BATCH-2025-0001" */
  @Prop({ required: true, unique: true })
  @Field()
  batchNumber: string;

  /**
   * Expiry date in "YYYY-MM-DD" format.
   * CRITICAL — FEFO sort is done on this field (ASC = nearest expiry first).
   */
  @Prop({ required: true, index: true })
  @Field()
  expiryDate: string;

  /** Manufacturing date — optional, "YYYY-MM-DD" */
  @Prop()
  @Field({ nullable: true })
  manufactureDate?: string;

  /** Total units received in this batch */
  @Prop({ required: true, type: Number })
  @Field(() => Int)
  quantityReceived: number;

  /**
   * Units still in warehouse for this batch.
   * Starts equal to quantityReceived; decremented by FEFO during completePacking.
   * Reaches 0 when status becomes DEPLETED.
   */
  @Prop({ required: true, type: Number })
  @Field(() => Int)
  quantityRemaining: number;

  /** Cost per unit in ₹ — for COGS/margin tracking */
  @Prop({ type: Number })
  @Field(() => Float, { nullable: true })
  perUnitCost?: number;

  /**
   * Batch lifecycle status:
   *   active   — in stock, available for packing
   *   depleted — quantityRemaining reached 0
   *   expired  — expiryDate has passed (set by daily cron)
   *   on_sale  — near expiry alert triggered (set by cron / admin)
   */
  @Prop({ type: String, enum: BatchStatus, default: BatchStatus.ACTIVE, index: true })
  @Field(() => BatchStatus)
  status: BatchStatus;

  /**
   * True when this batch has been flagged for near-expiry sale.
   * Set automatically when daysUntilExpiry <= nearExpiryAlertDays.
   */
  @Prop({ type: Boolean, default: false })
  @Field()
  isOnSale: boolean;

  /** Trigger isOnSale alert when expiry is within this many days (default 30) */
  @Prop({ type: Number, default: 30 })
  @Field(() => Int)
  nearExpiryAlertDays: number;

  /** Admin / packer who received this batch */
  @Prop()
  @Field({ nullable: true })
  receivedBy?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const StockBatchSchema = SchemaFactory.createForClass(StockBatch);

// Compound indexes for FEFO and status queries
StockBatchSchema.index({ sku: 1, expiryDate: 1 });           // FEFO query
StockBatchSchema.index({ sku: 1, status: 1 });               // active-batches-by-sku
StockBatchSchema.index({ expiryDate: 1, status: 1 });        // expiry cron
StockBatchSchema.index({ purchaseOrderId: 1 });              // batches by bill

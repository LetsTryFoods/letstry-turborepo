import { InputType, Field, Int, Float, ID } from '@nestjs/graphql';

@InputType()
export class ReceiveBatchInput {
  // ── Bill / PurchaseOrder ─────────────────────────────────────────────────
  /** Attach to an existing PO instead of creating a new one */
  @Field(() => ID, { nullable: true })
  purchaseOrderId?: string;

  /** Invoice number e.g. "INV-2025-441" — creates new PO if provided */
  @Field({ nullable: true })
  billNumber?: string;

  /** ISO date "YYYY-MM-DD" — defaults to today if omitted */
  @Field({ nullable: true })
  billDate?: string;

  @Field({ nullable: true })
  vendorName?: string;

  @Field({ nullable: true })
  vendorContact?: string;

  /** Total bill amount in ₹ */
  @Field(() => Float, { nullable: true })
  totalAmount?: number;

  /** R2 URLs of bill photos / PDFs */
  @Field(() => [String], { nullable: true })
  billImageUrls?: string[];

  // ── Per-SKU batch info ────────────────────────────────────────────────────
  /** Variant SKU — REQUIRED */
  @Field()
  sku: string;

  /** Units being received in this batch — REQUIRED */
  @Field(() => Int)
  quantityAdded: number;

  /**
   * Expiry date — REQUIRED — "YYYY-MM-DD"
   * Drives FEFO deduction order.
   */
  @Field()
  expiryDate: string;

  /** Manufacturing date — optional "YYYY-MM-DD" */
  @Field({ nullable: true })
  manufactureDate?: string;

  /** Cost per unit in ₹ */
  @Field(() => Float, { nullable: true })
  perUnitCost?: number;

  /** Admin / packer performing the inward */
  @Field({ nullable: true })
  performedBy?: string;

  @Field({ nullable: true })
  notes?: string;
}

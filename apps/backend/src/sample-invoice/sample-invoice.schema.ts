import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

// ── Line item stored inside each invoice ──────────────────────────────────────
@ObjectType()
export class SampleInvoiceItem {
  @Field()
  sku: string;

  @Field()
  skuName: string;

  @Field({ nullable: true })
  uom?: string;

  @Field(() => Float, { nullable: true })
  mrp?: number;

  @Field(() => Int)
  quantity: number;
}

// ── Embedded recipient sub-document ───────────────────────────────────────────
@ObjectType()
export class SampleInvoiceRecipient {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  notes?: string;
}

// ── Main invoice document ─────────────────────────────────────────────────────
export type SampleInvoiceDocument = SampleInvoice & Document;

@Schema({ timestamps: true })
@ObjectType()
export class SampleInvoice {
  @Field(() => ID)
  _id: string;

  /** Auto-generated invoice number e.g. INV-20250521-313 */
  @Prop({ required: true, unique: true })
  @Field()
  invoiceNumber: string;

  @Prop({
    type: {
      name: String,
      company: String,
      address: String,
      phone: String,
      notes: String,
    },
    _id: false,
  })
  @Field(() => SampleInvoiceRecipient, { nullable: true })
  recipient?: SampleInvoiceRecipient;

  @Prop({
    type: [
      {
        sku: String,
        skuName: String,
        uom: String,
        mrp: Number,
        quantity: Number,
        _id: false,
      },
    ],
  })
  @Field(() => [SampleInvoiceItem])
  items: SampleInvoiceItem[];

  /** Total pieces across all items */
  @Prop({ type: Number })
  @Field(() => Int)
  totalPcs: number;

  /** Sum of MRP × Qty for all items (reference only, no charge) */
  @Prop({ type: Number })
  @Field(() => Float)
  totalMrpValue: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const SampleInvoiceSchema = SchemaFactory.createForClass(SampleInvoice);
SampleInvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
SampleInvoiceSchema.index({ createdAt: -1 });

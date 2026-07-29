import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, Float, ID, registerEnumType } from '@nestjs/graphql';

export type PurchaseOrderDocument = PurchaseOrder & Document;

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
}

registerEnumType(PurchaseOrderStatus, { name: 'PurchaseOrderStatus' });

@Schema({ timestamps: true, collection: 'purchaseorders' })
@ObjectType()
export class PurchaseOrder {
  @Field(() => ID)
  _id: string;

  /** Invoice / bill number e.g. "INV-2025-441" */
  @Prop({ required: true, index: true, unique: true })
  @Field()
  billNumber: string;

  /** ISO date string e.g. "2025-07-29" */
  @Prop({ required: true })
  @Field()
  billDate: string;

  @Prop()
  @Field({ nullable: true })
  vendorName?: string;

  @Prop()
  @Field({ nullable: true })
  vendorContact?: string;

  @Prop()
  @Field({ nullable: true })
  vendorAddress?: string;

  /** Total bill amount in ₹ */
  @Prop({ type: Number })
  @Field(() => Float, { nullable: true })
  totalAmount?: number;

  /** R2 uploaded bill photo / PDF URLs */
  @Prop({ type: [String], default: [] })
  @Field(() => [String])
  billImageUrls: string[];

  @Prop()
  @Field({ nullable: true })
  notes?: string;

  /** Admin / packer who received the goods */
  @Prop()
  @Field({ nullable: true })
  receivedBy?: string;

  @Prop({ type: String, enum: PurchaseOrderStatus, default: PurchaseOrderStatus.CONFIRMED })
  @Field(() => PurchaseOrderStatus)
  status: PurchaseOrderStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder);
PurchaseOrderSchema.index({ billNumber: 1 });
PurchaseOrderSchema.index({ createdAt: -1 });

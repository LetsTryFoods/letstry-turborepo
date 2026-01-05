import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PackingStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PACKING = 'packing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ timestamps: true, collection: 'packingorders' })
export class PackingOrder extends Document {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  orderNumber: string;

  @Prop({ type: String, enum: PackingStatus, default: PackingStatus.PENDING })
  status: PackingStatus;

  @Prop({ required: true })
  priority: number;

  @Prop()
  assignedTo: string;

  @Prop()
  assignedAt: Date;

  @Prop({ type: [Object] })
  items: {
    productId: string;
    sku: string;
    ean: string;
    name: string;
    quantity: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
      weight: number;
      unit: 'cm' | 'inch';
    };
    isFragile: boolean;
    imageUrl: string;
  }[];

  @Prop({ default: false })
  hasErrors: boolean;

  @Prop({ type: [Object] })
  retrospectiveErrors?: {
    errorType: string;
    flaggedAt: Date;
    flaggedBy: string;
    notes: string;
    severity: 'minor' | 'major' | 'critical';
    source: 'customer_complaint' | 'quality_audit' | 'admin_review';
  }[];

  @Prop()
  packingStartedAt?: Date;

  @Prop()
  packingCompletedAt?: Date;

  @Prop({ type: Object })
  estimatedPackTime: number;

  @Prop()
  specialInstructions: string;

  @Prop({ default: false })
  isExpress: boolean;
}

export const PackingOrderSchema = SchemaFactory.createForClass(PackingOrder);

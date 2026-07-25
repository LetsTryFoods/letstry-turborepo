import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'label_scan_logs' })
export class LabelScanLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ required: true, index: true })
  orderDisplayId: string;

  @Prop({ required: true, index: true })
  awbNumber: string;

  @Prop({ default: 'AUTO_BARCODE', enum: ['AUTO_BARCODE', 'MANUAL_INPUT'] })
  scanType: string;

  @Prop({ default: false })
  whatsappSent: boolean;

  @Prop()
  whatsappSentAt?: Date;

  @Prop()
  recipientPhone?: string;

  @Prop()
  orderDate?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const LabelScanLogSchema = SchemaFactory.createForClass(LabelScanLog);

LabelScanLogSchema.index({ awbNumber: 1 });
LabelScanLogSchema.index({ orderDisplayId: 1 });
LabelScanLogSchema.index({ createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'dtdc_webhook_logs' })
export class DtdcWebhookLog extends Document {
  @Prop({ default: null, index: true })
  awbNumber: string;

  @Prop({ required: true, type: Object })
  payload: Record<string, any>;

  @Prop({ required: true, index: true })
  statusCode: string;

  @Prop({ default: false })
  processed: boolean;

  @Prop({ default: null })
  processedAt: Date;

  @Prop({ default: null })
  error: string;

  @Prop({ default: null })
  receivedAt: Date;
}

export const DtdcWebhookLogSchema =
  SchemaFactory.createForClass(DtdcWebhookLog);

DtdcWebhookLogSchema.index({ awbNumber: 1 });
DtdcWebhookLogSchema.index({ status: 1, createdAt: 1 });
DtdcWebhookLogSchema.index({ createdAt: 1 });

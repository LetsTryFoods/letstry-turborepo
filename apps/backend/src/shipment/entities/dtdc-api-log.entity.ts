import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'dtdc_api_logs' })
export class DtdcApiLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Shipment', default: null })
  shipmentId: Types.ObjectId;

  @Prop({ required: true, index: true })
  apiType: string;

  @Prop({ type: Object, default: null })
  requestPayload: Record<string, any>;

  @Prop({ type: Object, default: null })
  responsePayload: Record<string, any>;

  @Prop({ default: null })
  statusCode: number;

  @Prop({ required: true, index: true })
  success: boolean;

  @Prop({ default: null })
  errorMessage: string;

  @Prop({ default: null })
  durationMs: number;
}

export const DtdcApiLogSchema = SchemaFactory.createForClass(DtdcApiLog);

DtdcApiLogSchema.index({ shipmentId: 1 });
DtdcApiLogSchema.index({ apiType: 1, createdAt: 1 });
DtdcApiLogSchema.index({ success: 1, apiType: 1 });

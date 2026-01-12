import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'shipment_tracking_history' })
export class ShipmentTrackingHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Shipment', required: true, index: true })
  shipmentId: Types.ObjectId;

  @Prop({ required: true, index: true })
  statusCode: string;

  @Prop({ required: true })
  statusDescription: string;

  @Prop({ default: null })
  location: string;

  @Prop({ default: null })
  manifestNumber: string;

  @Prop({ required: true, type: Date })
  actionDate: Date;

  @Prop({ required: true })
  actionTime: string;

  @Prop({ required: true, type: Date, index: true })
  actionDatetime: Date;

  @Prop({ default: null })
  remarks: string;

  @Prop({ default: null, type: Number })
  latitude: number;

  @Prop({ default: null, type: Number })
  longitude: number;

  @Prop({ default: null, type: Boolean })
  scdOtp: boolean;

  @Prop({ default: null, type: Boolean })
  ndcOtp: boolean;

  @Prop({ type: Object, default: null })
  rawPayload: Record<string, any>;
}

export const ShipmentTrackingHistorySchema = SchemaFactory.createForClass(
  ShipmentTrackingHistory,
);

ShipmentTrackingHistorySchema.index({ shipmentId: 1, actionDatetime: 1 });
ShipmentTrackingHistorySchema.index({ statusCode: 1 });
ShipmentTrackingHistorySchema.index({ actionDate: 1 });

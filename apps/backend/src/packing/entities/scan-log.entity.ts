import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ScanLog extends Document {
  @Prop({ required: true })
  packingOrderId: string;

  @Prop({ required: true })
  packerId: string;

  @Prop({ required: true })
  ean: string;

  @Prop({ required: true })
  scannedAt: Date;

  @Prop({ default: true })
  isValid: boolean;

  @Prop()
  errorType?: string;

  @Prop()
  matchedProductId?: string;

  @Prop()
  matchedSku?: string;

  @Prop()
  expectedQuantity?: number;

  @Prop()
  scannedQuantity?: number;

  @Prop({ default: false })
  isRetrospective: boolean;

  @Prop()
  retrospectiveNotes?: string;

  @Prop()
  flaggedBy?: string;

  @Prop()
  flaggedAt?: Date;
}

export const ScanLogSchema = SchemaFactory.createForClass(ScanLog);

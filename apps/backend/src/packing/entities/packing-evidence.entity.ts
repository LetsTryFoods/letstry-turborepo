import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PackingEvidence extends Document {
  @Prop({ required: true })
  packingOrderId: string;

  @Prop({ required: true })
  packerId: string;

  @Prop({ type: [String] })
  prePackImages: string[];

  @Prop({ type: [String] })
  postPackImages: string[];

  @Prop({ type: Object })
  recommendedBox: {
    code: string;
    dimensions: { l: number; w: number; h: number };
  };

  @Prop({ type: Object })
  actualBox: {
    code: string;
    dimensions: { l: number; w: number; h: number };
  };

  @Prop({ default: false })
  boxMismatch: boolean;

  @Prop({ type: Object })
  detectedBoxDimensions?: { l: number; w: number; h: number };

  @Prop()
  dimensionConfidence?: number;

  @Prop()
  uploadedAt: Date;
}

export const PackingEvidenceSchema =
  SchemaFactory.createForClass(PackingEvidence);

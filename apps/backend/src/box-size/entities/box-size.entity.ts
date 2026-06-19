import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BoxSize extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Object, required: false })
  internalDimensions?: { l: number; w: number; h: number };

  @Prop({ required: false })
  maxWeight?: number;

  @Prop({ required: false })
  cost?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lengthInches: number;

  @Prop()
  breadthInches: number;

  @Prop()
  heightInches: number;

  @Prop()
  lengthCm: number;

  @Prop()
  breadthCm: number;

  @Prop()
  heightCm: number;

  @Prop({ type: [String], default: [] })
  photos: string[];
}

export const BoxSizeSchema = SchemaFactory.createForClass(BoxSize);

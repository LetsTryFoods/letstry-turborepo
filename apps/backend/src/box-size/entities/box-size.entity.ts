import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BoxSize extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Object, required: true })
  internalDimensions: { l: number; w: number; h: number };

  @Prop({ required: true })
  maxWeight: number;

  @Prop({ required: true })
  cost: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const BoxSizeSchema = SchemaFactory.createForClass(BoxSize);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Redirect extends Document {
  @Prop({ required: true, unique: true, index: true })
  fromPath: string;

  @Prop({ required: true })
  toPath: string;

  @Prop({ default: 301 })
  statusCode: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;

  @Prop({ default: 'shopify' })
  source: string;
}

export const RedirectSchema = SchemaFactory.createForClass(Redirect);

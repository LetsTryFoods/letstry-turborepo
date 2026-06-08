import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PickupLocation extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  addressLine1: string;

  @Prop()
  addressLine2?: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  pincode: string;

  @Prop({ default: 'India' })
  country: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ default: 'SHIPROCKET', enum: ['DTDC', 'SHIPROCKET'] })
  provider: string;
}

export const PickupLocationSchema =
  SchemaFactory.createForClass(PickupLocation);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PackerStatus {
  IDLE = 'idle',
  PACKING = 'packing',
  OFFLINE = 'offline',
  ON_BREAK = 'on_break',
}

@Schema({ timestamps: true })
export class Packer extends Document {
  @Prop({ required: true, unique: true })
  employeeId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, enum: PackerStatus, default: PackerStatus.OFFLINE })
  status: PackerStatus;

  @Prop({ default: 0 })
  totalOrdersPacked: number;

  @Prop({ default: 100 })
  accuracyRate: number;

  @Prop({ default: 0 })
  averagePackTime: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastActiveAt: Date;

  @Prop()
  currentOrderId: string;

  @Prop({ type: Object })
  shiftInfo: {
    shiftStart?: Date;
    shiftEnd?: Date;
  };
}

export const PackerSchema = SchemaFactory.createForClass(Packer);

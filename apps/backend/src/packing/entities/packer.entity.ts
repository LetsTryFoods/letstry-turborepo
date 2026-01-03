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

  @Prop({ default: 0 })
  accuracyRate: number;

  @Prop({ default: 0 })
  averagePackTime: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastActiveAt: Date;

  @Prop({ type: Object })
  shiftInfo: {
    shiftStart?: Date;
    shiftEnd?: Date;
  };
}

export const PackerSchema = SchemaFactory.createForClass(Packer);

PackerSchema.virtual('id').get(function (this: any) {
  return this._id.toHexString();
});

PackerSchema.set('toJSON', { virtuals: true });
PackerSchema.set('toObject', { virtuals: true });

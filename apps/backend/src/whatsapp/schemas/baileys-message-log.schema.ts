import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type BaileysMessageLogDocument = BaileysMessageLog & Document;

export type MessageChannel = 'NUREN' | 'BAILEYS' | 'NONE';
export type MessageStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'SKIPPED_LIMIT'
  | 'NO_FALLBACK';

@Schema({ timestamps: true, collection: 'baileysmessagelogs' })
export class BaileysMessageLog {
  @Prop({ required: true })
  phoneNumber: string;

  @Prop()
  recipientName?: string;

  @Prop()
  orderId?: string;

  @Prop({ required: true })
  templateName: string;

  @Prop({ type: mongoose.Schema.Types.String, required: true, enum: ['NUREN', 'BAILEYS', 'NONE'] })
  channel: MessageChannel;

  @Prop({
    type: mongoose.Schema.Types.String,
    required: true,
    enum: ['SUCCESS', 'FAILED', 'SKIPPED_LIMIT', 'NO_FALLBACK'],
  })
  status: MessageStatus;

  @Prop({ default: false })
  primaryAttempted: boolean;

  @Prop({ default: false })
  primarySuccess: boolean;

  @Prop({ default: false })
  fallbackAttempted: boolean;

  @Prop({ default: false })
  fallbackSuccess: boolean;

  @Prop()
  errorMessage?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  payload: Record<string, any>;

  @Prop({ required: true })
  sentAt: Date;

  @Prop()
  deliveredAt?: Date;
}

export const BaileysMessageLogSchema =
  SchemaFactory.createForClass(BaileysMessageLog);

BaileysMessageLogSchema.index({ sentAt: -1 });
BaileysMessageLogSchema.index({ orderId: 1 });
BaileysMessageLogSchema.index({ status: 1 });
BaileysMessageLogSchema.index({ channel: 1 });

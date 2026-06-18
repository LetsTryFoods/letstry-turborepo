import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WhatsAppMessageDocument = WhatsAppMessage & Document;

export enum WhatsAppMessageDirection {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export enum WhatsAppMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true })
export class WhatsAppMessage extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'WhatsAppChat', index: true })
  chatId: Types.ObjectId;

  @Prop({ required: false, index: true })
  messageId?: string; // Original WhatsApp Message ID

  @Prop({
    required: true,
    enum: Object.values(WhatsAppMessageDirection),
  })
  direction: WhatsAppMessageDirection;

  @Prop({
    required: true,
    enum: Object.values(WhatsAppMessageType),
    default: WhatsAppMessageType.TEXT,
  })
  type: WhatsAppMessageType;

  @Prop({ required: false })
  content?: string; // Text message or media caption

  @Prop({ required: false })
  mediaUrl?: string; // Cloudflare R2 URL if media

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const WhatsAppMessageSchema = SchemaFactory.createForClass(WhatsAppMessage);

WhatsAppMessageSchema.index({ chatId: 1, timestamp: 1 });

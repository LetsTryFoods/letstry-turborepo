import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WhatsAppChatDocument = WhatsAppChat & Document;

export enum WhatsAppChatStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Schema({ timestamps: true })
export class WhatsAppChat extends Document {
  @Prop({ required: true, index: true })
  phoneNumber: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Contact' })
  contactId?: Types.ObjectId;

  /** Links this chat session to a specific ContactQuery */
  @Prop({ required: false, type: Types.ObjectId, ref: 'Contact', index: true })
  contactQueryId?: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(WhatsAppChatStatus),
    default: WhatsAppChatStatus.OPEN,
  })
  status: WhatsAppChatStatus;

  @Prop({ required: false })
  lastMessageAt?: Date;

  /** 24-hour session window — updated on every inbound customer message */
  @Prop({ required: false })
  windowExpiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const WhatsAppChatSchema = SchemaFactory.createForClass(WhatsAppChat);

WhatsAppChatSchema.index({ phoneNumber: 1, status: 1 });
WhatsAppChatSchema.index({ createdAt: -1 });
WhatsAppChatSchema.index({ contactQueryId: 1 });

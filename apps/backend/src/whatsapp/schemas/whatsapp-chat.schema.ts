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

  @Prop({
    required: true,
    enum: Object.values(WhatsAppChatStatus),
    default: WhatsAppChatStatus.OPEN,
  })
  status: WhatsAppChatStatus;

  @Prop({ required: false })
  lastMessageAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const WhatsAppChatSchema = SchemaFactory.createForClass(WhatsAppChat);

WhatsAppChatSchema.index({ phoneNumber: 1, status: 1 });
WhatsAppChatSchema.index({ createdAt: -1 });

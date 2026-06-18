import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type BaileysSessionDocument = BaileysSession & Document;

@Schema({ timestamps: true, collection: 'baileyssessions' })
export class BaileysSession {
  @Prop({ required: true, unique: true })
  sessionId: string; // always 'default'

  @Prop({ type: String })
  creds?: string; // JSON stringified auth credentials

  @Prop({ type: mongoose.Schema.Types.String })
  keys?: string; // session keys map (JSON stringified)

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  phoneConnected?: string; // e.g. "918xxxxxxxxx"

  @Prop()
  connectedAt?: Date;

  @Prop()
  lastMessageAt?: Date;

  // Daily limit tracking
  @Prop({ default: 0 })
  dailyCount: number;

  @Prop({ default: '' })
  dailyCountDate: string; // 'YYYY-MM-DD' — reset when date changes

  // Re-scan detection
  @Prop({ default: false })
  needsRescan: boolean;

  @Prop()
  disconnectReason?: string;

  @Prop()
  lastRescanPromptAt?: Date;
}

export const BaileysSessionSchema =
  SchemaFactory.createForClass(BaileysSession);

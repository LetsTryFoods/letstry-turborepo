import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhatsAppSettingsDocument = WhatsAppSettings & Document;

@Schema({ collection: 'whatsappsettings' })
export class WhatsAppSettings {
  @Prop({ required: true, unique: true })
  key: string; // always 'global'

  @Prop({ default: 10 })
  baileysDailyLimit: number; // configurable from admin

  @Prop({ default: true })
  baileysEnabled: boolean; // fallback on/off toggle

  @Prop({ default: true })
  nurenEnabled: boolean; // primary on/off toggle
}

export const WhatsAppSettingsSchema =
  SchemaFactory.createForClass(WhatsAppSettings);

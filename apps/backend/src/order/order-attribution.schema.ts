import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Tracks where each order originated from:
 * UTM link, Google organic, Meta Ads, Direct, etc.
 * Kept separate from Order to avoid bloating the core schema.
 */
@Schema({ timestamps: true })
export class OrderAttribution extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true })
  orderId: Types.ObjectId;

  @Prop({ type: String, required: true })
  orderRef: string; // human-readable orderId like ORD_xxx

  // UTM parameters
  @Prop({ type: String })
  utmSource?: string; // e.g. "Affiliate", "facebook", "google"

  @Prop({ type: String })
  utmMedium?: string; // e.g. "Paisatrail", "cpc", "organic"

  @Prop({ type: String })
  utmCampaign?: string; // e.g. "Promotion"

  @Prop({ type: String })
  utmTerm?: string; // e.g. "subaffiliate"

  @Prop({ type: String })
  utmContent?: string;

  // Human-readable source label shown in Admin Dashboard
  // e.g. "Affiliate / Paisatrail", "Google / Organic", "Meta / Paid", "Direct"
  @Prop({ type: String, required: true, default: 'Direct' })
  sourceLabel: string;

  // Browser referrer at time of checkout (for debugging)
  @Prop({ type: String })
  referrer?: string;
}

export const OrderAttributionSchema =
  SchemaFactory.createForClass(OrderAttribution);

// Index for fast lookups by orderId
OrderAttributionSchema.index({ orderId: 1 });
OrderAttributionSchema.index({ orderRef: 1 });
OrderAttributionSchema.index({ utmSource: 1 });
OrderAttributionSchema.index({ sourceLabel: 1 });

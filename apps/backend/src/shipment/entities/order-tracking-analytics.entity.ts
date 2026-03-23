import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'order_tracking_analytics' })
export class OrderTrackingAnalytics extends Document {
  @Prop({ required: true })
  searchQuery: string;

  @Prop({ required: true, enum: ['orderId', 'phone', 'awb'] })
  searchType: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ default: null })
  userId?: string;

  @Prop({ default: false })
  foundResult: boolean;

  @Prop({ default: null })
  awbNumber?: string;
}

export const OrderTrackingAnalyticsSchema = SchemaFactory.createForClass(OrderTrackingAnalytics);
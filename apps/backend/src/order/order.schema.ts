import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  SHIPMENT_FAILED = 'SHIPMENT_FAILED',
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'Identity' })
  identityId: Types.ObjectId;

  @Prop({ type: Object })
  placerContact: {
    phone?: string;
    email?: string;
  };

  @Prop({ type: Object, required: true })
  recipientContact: {
    phone: string;
    email?: string;
  };

  @Prop({ required: true, type: String })
  paymentOrderId: string;

  @Prop({ type: Types.ObjectId, ref: 'PaymentOrder' })
  paymentOrder: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Cart' })
  cartId: Types.ObjectId;

  @Prop({ required: true })
  totalAmount: string;

  @Prop({ required: true })
  currency: string;

  @Prop({
    required: true,
    type: String,
    enum: OrderStatus,
    default: OrderStatus.CONFIRMED,
  })
  orderStatus: OrderStatus;

  @Prop({ type: Types.ObjectId, ref: 'Address' })
  shippingAddressId: Types.ObjectId;

  @Prop({ type: Array })
  items: Array<{
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    quantity: number;
    price: string;
    totalPrice: string;
    name: string;
    sku: string;
    variant?: string;
    image?: string;
  }>;

  @Prop()
  subtotal: string;

  @Prop({ default: '0' })
  discount: string;

  @Prop({ default: '0' })
  deliveryCharge: string;

  @Prop({ type: Date })
  deliveredAt: Date;

  @Prop({ type: Date })
  cancelledAt: Date;

  @Prop()
  trackingNumber: string;

  @Prop()
  cancellationReason: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderId: 1 }, { unique: true });
OrderSchema.index({ identityId: 1 });
OrderSchema.index({ paymentOrderId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

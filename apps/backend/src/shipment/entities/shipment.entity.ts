import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ShipmentStatusCode {
  BKD = 'BKD',
  PUP = 'PUP',
  ITM = 'ITM',
  OFD = 'OFD',
  DLV = 'DLV',
  NONDLV = 'NONDLV',
  RTO = 'RTO',
  CAN = 'CAN',
  HLD = 'HLD',
}

export enum ServiceType {
  STANDARD = 'STANDARD',
  LITE = 'LITE',
  B2C_PRIORITY = 'B2C PRIORITY',
  B2C_SMART = 'B2C SMART',
  B2C_SMART_EXPRESS = 'B2C SMART EXPRESS',
  EXPRESS = 'EXPRESS',
  GROUND_EXPRESS = 'GROUND EXPRESS',
}

export enum LoadType {
  DOCUMENT = 'DOCUMENT',
  NON_DOCUMENT = 'NON-DOCUMENT',
}

@Schema({ timestamps: true, collection: 'shipments' })
export class Shipment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', default: null })
  orderId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  dtdcAwbNumber: string;

  @Prop({ default: null })
  dtdcReferenceNumber: string;

  @Prop({ required: true, index: true })
  customerCode: string;

  @Prop({ required: true, enum: Object.values(ServiceType) })
  serviceType: string;

  @Prop({ required: true, default: LoadType.NON_DOCUMENT, enum: Object.values(LoadType) })
  loadType: string;

  @Prop({ required: true })
  originCity: string;

  @Prop({ default: null })
  destinationCity: string;

  @Prop({ required: true, type: Number })
  weight: number;

  @Prop({ default: null, type: Number })
  declaredValue: number;

  @Prop({ required: true, type: Date })
  bookedOn: Date;

  @Prop({ default: null, type: Date })
  expectedDeliveryDate: Date;

  @Prop({ default: null, type: Date })
  revisedExpectedDeliveryDate: Date;

  @Prop({ default: null })
  rtoNumber: string;

  @Prop({ default: null, enum: Object.values(ShipmentStatusCode), index: true })
  currentStatusCode: string;

  @Prop({ default: null })
  currentStatusDescription: string;

  @Prop({ default: null })
  currentLocation: string;

  @Prop({ default: false, index: true })
  isDelivered: boolean;

  @Prop({ default: null, type: Date })
  deliveredAt: Date;

  @Prop({ default: false })
  isRto: boolean;

  @Prop({ default: false })
  isCancelled: boolean;

  @Prop({ default: null, type: Date })
  cancelledAt: Date;

  @Prop({ default: null })
  labelUrl: string;

  @Prop({ default: null, type: Number })
  codAmount: number;

  @Prop({ default: null })
  codCollectionMode: string;

  @Prop({ type: Object, default: null })
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @Prop({ type: Object, default: null })
  originDetails: {
    name: string;
    phone: string;
    alternatePhone?: string;
    addressLine1: string;
    addressLine2?: string;
    pincode: string;
    city: string;
    state: string;
    latitude?: string;
    longitude?: string;
  };

  @Prop({ type: Object, default: null })
  destinationDetails: {
    name: string;
    phone: string;
    alternatePhone?: string;
    addressLine1: string;
    addressLine2?: string;
    pincode: string;
    city: string;
    state: string;
    latitude?: string;
    longitude?: string;
  };

  @Prop({ default: null })
  invoiceNumber: string;

  @Prop({ default: null, type: Date })
  invoiceDate: Date;

  @Prop({ default: null })
  ewayBill: string;

  @Prop({ default: null })
  commodityId: string;

  @Prop({ default: 1 })
  numPieces: number;

  @Prop({ type: [Object], default: null })
  piecesDetail: {
    description: string;
    declaredValue: number;
    weight: number;
    height: number;
    length: number;
    width: number;
  }[];

  @Prop({ default: null, type: Date })
  webhookLastReceivedAt: Date;

  @Prop({ default: true })
  webhookEnabled: boolean;

  @Prop({ default: null, type: Date, index: true })
  trackingDisabledAfter: Date;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);

ShipmentSchema.index({ dtdcAwbNumber: 1 }, { unique: true });
ShipmentSchema.index({ orderId: 1 });
ShipmentSchema.index({ customerCode: 1 });
ShipmentSchema.index({ currentStatusCode: 1 });
ShipmentSchema.index({ bookedOn: 1 });
ShipmentSchema.index({ isDelivered: 1, deliveredAt: 1 });
ShipmentSchema.index({ webhookLastReceivedAt: 1, isDelivered: 1 });

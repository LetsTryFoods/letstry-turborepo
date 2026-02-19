import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class ShipmentResponse {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  orderId?: string;

  @Field()
  dtdcAwbNumber: string;

  @Field({ nullable: true })
  dtdcReferenceNumber?: string;

  @Field()
  customerCode: string;

  @Field()
  serviceType: string;

  @Field()
  loadType: string;

  @Field()
  originCity: string;

  @Field({ nullable: true })
  destinationCity?: string;

  @Field(() => Float)
  weight: number;

  @Field(() => Float, { nullable: true })
  declaredValue?: number;

  @Field()
  bookedOn: Date;

  @Field({ nullable: true })
  expectedDeliveryDate?: Date;

  @Field({ nullable: true })
  revisedExpectedDeliveryDate?: Date;

  @Field({ nullable: true })
  rtoNumber?: string;

  @Field({ nullable: true })
  currentStatusCode?: string;

  @Field({ nullable: true })
  currentStatusDescription?: string;

  @Field({ nullable: true })
  currentLocation?: string;

  @Field()
  isDelivered: boolean;

  @Field({ nullable: true })
  deliveredAt?: Date;

  @Field()
  isRto: boolean;

  @Field()
  isCancelled: boolean;

  @Field({ nullable: true })
  cancelledAt?: Date;

  @Field({ nullable: true })
  labelUrl?: string;

  @Field(() => Float, { nullable: true })
  codAmount?: number;

  @Field({ nullable: true })
  codCollectionMode?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  dimensions?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  originDetails?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  destinationDetails?: Record<string, any>;

  @Field({ nullable: true })
  invoiceNumber?: string;

  @Field({ nullable: true })
  invoiceDate?: Date;

  @Field({ nullable: true })
  ewayBill?: string;

  @Field({ nullable: true })
  commodityId?: string;

  @Field(() => Int)
  numPieces: number;

  @Field(() => GraphQLJSON, { nullable: true })
  piecesDetail?: Record<string, any>[];

  @Field({ nullable: true })
  webhookLastReceivedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  trackingLink?: string;
}

@ObjectType()
export class TrackingHistoryResponse {
  @Field(() => ID)
  id: string;

  @Field()
  shipmentId: string;

  @Field()
  statusCode: string;

  @Field()
  statusDescription: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  manifestNumber?: string;

  @Field()
  actionDate: Date;

  @Field()
  actionTime: string;

  @Field()
  actionDatetime: Date;

  @Field({ nullable: true })
  remarks?: string;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  scdOtp?: boolean;

  @Field({ nullable: true })
  ndcOtp?: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ShipmentWithTrackingResponse extends ShipmentResponse {
  @Field(() => [TrackingHistoryResponse])
  trackingHistory: TrackingHistoryResponse[];
}

@ObjectType()
export class CreateShipmentResponse {
  @Field()
  success: boolean;

  @Field(() => ShipmentResponse)
  shipment: ShipmentResponse;

  @Field()
  awbNumber: string;

  @Field({ nullable: true })
  labelUrl?: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  trackingLink?: string;
}

@ObjectType()
export class ShipmentListResponse {
  @Field()
  success: boolean;

  @Field(() => [ShipmentResponse])
  shipments: ShipmentResponse[];

  @Field(() => Int)
  total: number;
}

import { CreateShipmentData } from '../../interfaces/shipment.interface';

export interface BookShipmentResult {
  awbNumber: string;
  providerOrderId: string;
  labelUrl: string;
  pickupScheduledDate?: Date;
  courierName?: string;
}

export interface TrackShipmentResult {
  statusCode: string;
  statusDescription: string;
  location?: string;
  timestamp?: Date;
  rawActivities: any[];
}

export interface IDeliveryPartnerAdapter {
  bookShipment(data: CreateShipmentData): Promise<BookShipmentResult>;
  trackShipment(awbNumber: string): Promise<TrackShipmentResult | null>;
  cancelShipment(awbNumber: string, providerOrderId?: string): Promise<boolean>;
}

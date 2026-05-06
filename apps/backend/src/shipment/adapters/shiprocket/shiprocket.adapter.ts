import { Injectable, Logger } from '@nestjs/common';
import { IDeliveryPartnerAdapter, BookShipmentResult, TrackShipmentResult } from '../interface/delivery-partner.adapter.interface';
import { CreateShipmentData } from '../../interfaces/shipment.interface';
import { ShiprocketApiService } from '../../providers/shiprocket/shiprocket-api.service';
import { ShiprocketMapper } from './shiprocket.mapper';

@Injectable()
export class ShiprocketAdapter implements IDeliveryPartnerAdapter {
  private readonly logger = new Logger(ShiprocketAdapter.name);

  constructor(
    private readonly apiService: ShiprocketApiService,
    private readonly mapper: ShiprocketMapper,
  ) {}

  async bookShipment(data: CreateShipmentData): Promise<BookShipmentResult> {
    this.logger.log(`Booking shipment on Shiprocket for order ${data.orderId || data.orderNumber}`);
    const payload = this.mapper.mapBookingPayload(data);
    const response = await this.apiService.createForwardShipment(payload);

    if (response.status_code === 1 || response.payload) {
      const respPayload = response.payload;
      return {
        awbNumber: respPayload.awb_code,
        providerOrderId: String(respPayload.order_id),
        labelUrl: respPayload.label_url,
        pickupScheduledDate: respPayload.pickup_scheduled_date ? new Date(respPayload.pickup_scheduled_date) : undefined,
        courierName: respPayload.courier_name,
      };
    }
    
    throw new Error(`Failed to book shipment on Shiprocket: ${JSON.stringify(response)}`);
  }

  async trackShipment(awbNumber: string): Promise<TrackShipmentResult | null> {
    this.logger.log(`Tracking AWB on Shiprocket: ${awbNumber}`);
    const response = await this.apiService.trackByAwb(awbNumber);
    return this.mapper.mapTrackingResponse(response);
  }

  async cancelShipment(awbNumber: string, providerOrderId?: string): Promise<boolean> {
    if (!providerOrderId) {
      throw new Error(`Provider Order ID is required to cancel a Shiprocket shipment (${awbNumber})`);
    }
    this.logger.log(`Cancelling Shiprocket order: ${providerOrderId}`);
    return this.apiService.cancelOrder(providerOrderId);
  }
}

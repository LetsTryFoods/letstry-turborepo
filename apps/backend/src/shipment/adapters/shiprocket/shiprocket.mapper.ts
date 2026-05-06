import { Injectable } from '@nestjs/common';
import { CreateShipmentData } from '../../interfaces/shipment.interface';
import { TrackShipmentResult } from '../interface/delivery-partner.adapter.interface';
import { SHIPROCKET_STATUS_MAP } from '../../constants/shiprocket-status-codes';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShiprocketMapper {
  constructor(private readonly configService: ConfigService) {}

  mapBookingPayload(data: CreateShipmentData): any {
    const originNameParts = (data.originDetails.name || '').split(' ');
    const originFirstName = originNameParts[0] || '';
    const originLastName = originNameParts.slice(1).join(' ') || originFirstName;

    const destNameParts = (data.destinationDetails.name || '').split(' ');
    const destFirstName = destNameParts[0] || '';
    const destLastName = destNameParts.slice(1).join(' ') || destFirstName;

    return {
      order_id: data.orderId || data.orderNumber || Date.now().toString().substring(0, 50),
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: (data as any).pickupLocationName || this.configService.get<string>('shiprocket.defaultPickupLocation'),
      
      billing_customer_name: destFirstName,
      billing_last_name: destLastName,
      billing_address: data.destinationDetails.addressLine1,
      billing_address_2: data.destinationDetails.addressLine2 || '',
      billing_city: data.destinationDetails.city,
      billing_pincode: Number(data.destinationDetails.pincode),
      billing_state: data.destinationDetails.state,
      billing_country: 'India',
      billing_email: '', // Not strictly required
      billing_phone: data.destinationDetails.phone,
      billing_alternate_phone: data.destinationDetails.alternatePhone || '',

      shipping_is_billing: false,
      shipping_customer_name: originFirstName,
      shipping_last_name: originLastName,
      shipping_address: data.originDetails.addressLine1,
      shipping_address_2: data.originDetails.addressLine2 || '',
      shipping_city: data.originDetails.city,
      shipping_pincode: Number(data.originDetails.pincode),
      shipping_country: 'India',
      shipping_state: data.originDetails.state,
      shipping_email: '',
      shipping_phone: data.originDetails.phone,

      order_items: [
        {
          name: data.description || 'Shipment',
          sku: 'SKU-001',
          units: data.numPieces || 1,
          selling_price: data.declaredValue || 0,
        },
      ],

      payment_method: (data.codAmount && data.codAmount > 0) ? 'COD' : 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: data.declaredValue,

      length: Number(data.dimensions?.length) || 10,
      breadth: Number(data.dimensions?.width) || 10,
      height: Number(data.dimensions?.height) || 10,
      weight: Number(data.weight) || 1,
    };
  }

  mapTrackingResponse(srResponse: any): TrackShipmentResult | null {
    const trackingData = srResponse?.tracking_data;
    if (!trackingData) return null;

    const statusId = trackingData.shipment_status;
    const activities = trackingData.shipment_track_activities || [];
    const latestActivity = activities.length > 0 ? activities[0] : null;

    let timestamp: Date | undefined;
    if (latestActivity?.date) {
      timestamp = new Date(latestActivity.date);
    }

    return {
      statusCode: SHIPROCKET_STATUS_MAP[statusId] || 'ITM',
      statusDescription: latestActivity?.['sr-status-label'] || trackingData.shipment_status_label || 'In Transit',
      location: latestActivity?.location || '',
      timestamp,
      rawActivities: activities,
    };
  }
}

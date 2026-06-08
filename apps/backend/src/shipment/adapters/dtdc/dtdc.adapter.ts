import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IDeliveryPartnerAdapter,
  BookShipmentResult,
  TrackShipmentResult,
} from '../interface/delivery-partner.adapter.interface';
import { CreateShipmentData } from '../../interfaces/shipment.interface';
import { DtdcApiService } from '../../services/dtdc-api.service';
import { DtdcBookingPayload } from '../../interfaces/dtdc-payload.interface';

@Injectable()
export class DtdcAdapter implements IDeliveryPartnerAdapter {
  constructor(
    private readonly dtdcApiService: DtdcApiService,
    private readonly configService: ConfigService,
  ) {}

  async bookShipment(data: CreateShipmentData): Promise<BookShipmentResult> {
    const bookingPayload: DtdcBookingPayload = {
      consignments: [
        {
          customer_code:
            this.configService.get<string>('dtdc.customerCode') || '',
          service_type_id: data.serviceType,
          load_type: data.loadType,
          consignment_type: 'Forward',
          dimension_unit:
            this.configService.get<string>('dtdc.defaults.dimensionUnit') ||
            'cm',
          length: data.dimensions.length.toString(),
          width: data.dimensions.width.toString(),
          height: data.dimensions.height.toString(),
          weight_unit:
            this.configService.get<string>('dtdc.defaults.weightUnit') || 'kg',
          weight: data.weight.toString(),
          declared_value: data.declaredValue.toString(),
          num_pieces: (data.numPieces || 1).toString(),
          origin_details: {
            name: data.originDetails.name,
            phone: data.originDetails.phone,
            alternate_phone: data.originDetails.alternatePhone,
            address_line_1: data.originDetails.addressLine1,
            address_line_2: data.originDetails.addressLine2,
            pincode: data.originDetails.pincode,
            city: data.originDetails.city,
            state: data.originDetails.state,
            latitude: data.originDetails.latitude,
            longitude: data.originDetails.longitude,
          },
          destination_details: {
            name: data.destinationDetails.name,
            phone: data.destinationDetails.phone,
            alternate_phone: data.destinationDetails.alternatePhone,
            address_line_1: data.destinationDetails.addressLine1,
            address_line_2: data.destinationDetails.addressLine2,
            pincode: data.destinationDetails.pincode,
            city: data.destinationDetails.city,
            state: data.destinationDetails.state,
            latitude: data.destinationDetails.latitude,
            longitude: data.destinationDetails.longitude,
          },
          customer_reference_number:
            data.orderNumber || data.orderId || `REF-${Date.now()}`,
          cod_collection_mode: data.codCollectionMode || '',
          cod_amount: data.codAmount?.toString() || '',
          commodity_id: data.commodityId,
          is_risk_surcharge_applicable: data.isRiskSurchargeApplicable || false,
          description: data.description,
          invoice_number: data.invoiceNumber,
          invoice_date: data.invoiceDate
            ? data.invoiceDate.toISOString().split('T')[0]
            : undefined,
          eway_bill: data.ewayBill,
          pieces_detail: data.piecesDetail?.map((piece) => ({
            description: piece.description,
            declared_value: piece.declaredValue.toString(),
            weight: piece.weight.toString(),
            height: piece.height.toString(),
            length: piece.length.toString(),
            width: piece.width.toString(),
          })),
        },
      ],
    };

    const bookingResponse =
      await this.dtdcApiService.bookShipment(bookingPayload);

    if (
      bookingResponse.status !== 'OK' ||
      !bookingResponse.data?.[0]?.success
    ) {
      const errorMsg =
        bookingResponse.data?.[0]?.message ||
        bookingResponse.data?.[0]?.remarks ||
        'Booking failed';
      throw new BadRequestException(errorMsg);
    }

    const awbNumber = bookingResponse.data[0].reference_number;
    const providerOrderId =
      bookingPayload.consignments[0].customer_reference_number;

    let labelUrl = '';
    try {
      labelUrl = await this.dtdcApiService.getLabel(awbNumber, '');
    } catch (err) {
      // Intentionally swallow label fetch failures
    }

    return {
      awbNumber,
      providerOrderId,
      labelUrl,
    };
  }

  async trackShipment(awbNumber: string): Promise<TrackShipmentResult | null> {
    const trackResponse = await this.dtdcApiService.trackShipment(awbNumber);
    if (
      !trackResponse ||
      !trackResponse.statusFlag ||
      !trackResponse.trackDetails
    ) {
      return null;
    }

    const trackDetails = trackResponse.trackDetails;
    const latestEvent =
      trackDetails.length > 0 ? trackDetails[trackDetails.length - 1] : null;

    if (!latestEvent) return null;

    let timestamp: Date | undefined;
    if (latestEvent.strActionDate && latestEvent.strActionTime) {
      const [dd, mm, yyyy] = String(latestEvent.strActionDate).split('-');
      if (dd && mm && yyyy) {
        timestamp = new Date(
          `${yyyy}-${mm}-${dd}T${latestEvent.strActionTime}:00Z`,
        );
      }
    }

    return {
      statusCode: latestEvent.strAction || 'ITM',
      statusDescription: latestEvent.strAction || 'In Transit',
      location: latestEvent.strOrigin || '',
      timestamp,
      rawActivities: trackDetails,
    };
  }

  async cancelShipment(awbNumber: string): Promise<boolean> {
    const response = await this.dtdcApiService.cancelShipment([awbNumber]);
    if (response.status === 'OK' && response.data?.[0]?.success) {
      return true;
    }
    return false;
  }
}

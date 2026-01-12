import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shipment } from '../entities/shipment.entity';
import { DtdcApiService } from './dtdc-api.service';
import { TrackingService } from './tracking.service';
import { ShipmentStatusMapperService } from './shipment-status-mapper.service';
import { CreateShipmentData, ShipmentFilters } from '../interfaces/shipment.interface';
import { DtdcBookingPayload } from '../interfaces/dtdc-payload.interface';
import { ConfigService } from '@nestjs/config';
import { ShipmentLoggerService } from './shipment-logger.service';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectModel(Shipment.name)
    private readonly shipmentModel: Model<Shipment>,
    private readonly dtdcApiService: DtdcApiService,
    private readonly trackingService: TrackingService,
    private readonly statusMapper: ShipmentStatusMapperService,
    private readonly configService: ConfigService,
    private readonly shipmentLogger: ShipmentLoggerService,
  ) {}

  async createShipment(data: CreateShipmentData): Promise<{ shipment: Shipment; awbNumber: string; labelUrl: string }> {
    const serviceable = await this.dtdcApiService.checkPincode(
      data.originDetails.pincode,
      data.destinationDetails.pincode,
    );

    if (!serviceable) {
      throw new BadRequestException('Destination pincode not serviceable');
    }

    const bookingPayload: DtdcBookingPayload = {
      consignments: [
        {
          customer_code: this.configService.get<string>('dtdc.customerCode') || '',
          service_type_id: data.serviceType,
          load_type: data.loadType,
          consignment_type: 'Forward',
          dimension_unit: this.configService.get<string>('dtdc.defaults.dimensionUnit') || 'cm',
          length: data.dimensions.length.toString(),
          width: data.dimensions.width.toString(),
          height: data.dimensions.height.toString(),
          weight_unit: this.configService.get<string>('dtdc.defaults.weightUnit') || 'kg',
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
          customer_reference_number: data.orderId || `REF-${Date.now()}`,
          cod_collection_mode: data.codCollectionMode || '',
          cod_amount: data.codAmount?.toString() || '',
          commodity_id: data.commodityId,
          description: data.description,
          invoice_number: data.invoiceNumber,
          invoice_date: data.invoiceDate ? data.invoiceDate.toISOString().split('T')[0] : undefined,
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

    const bookingResponse = await this.dtdcApiService.bookShipment(bookingPayload);

    if (!bookingResponse.success || !bookingResponse.consignments[0].success) {
      throw new BadRequestException(bookingResponse.consignments[0].remarks || 'Booking failed');
    }

    const awbNumber = bookingResponse.consignments[0].reference_number;
    const trackingDisabledAfter = new Date();
    const trackingValidityDays = this.configService.get<number>('dtdc.defaults.trackingValidityDays') || 90;
    trackingDisabledAfter.setDate(trackingDisabledAfter.getDate() + trackingValidityDays);

    const shipment = await this.shipmentModel.create({
      orderId: data.orderId ? new Types.ObjectId(data.orderId) : undefined,
      dtdcAwbNumber: awbNumber,
      dtdcReferenceNumber: bookingPayload.consignments[0].customer_reference_number,
      customerCode: this.configService.get<string>('dtdc.customerCode'),
      serviceType: data.serviceType,
      loadType: data.loadType,
      originCity: data.originDetails.city,
      destinationCity: data.destinationDetails.city,
      weight: data.weight,
      declaredValue: data.declaredValue,
      bookedOn: new Date(),
      dimensions: data.dimensions,
      originDetails: data.originDetails,
      destinationDetails: data.destinationDetails,
      codAmount: data.codAmount,
      codCollectionMode: data.codCollectionMode,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      ewayBill: data.ewayBill,
      commodityId: data.commodityId,
      numPieces: data.numPieces || 1,
      piecesDetail: data.piecesDetail,
      trackingDisabledAfter,
      currentStatusCode: 'BKD',
      currentStatusDescription: 'Booked',
    });

    let labelUrl = '';
    try {
      labelUrl = await this.dtdcApiService.getLabel(awbNumber, shipment._id.toString());
      shipment.labelUrl = labelUrl;
      await shipment.save();
      this.shipmentLogger.logLabelFetched(awbNumber, shipment._id.toString());
    } catch (error: any) {
      this.shipmentLogger.logLabelFetchFailed(awbNumber, error.message);
    }

    this.shipmentLogger.logShipmentBooked(awbNumber, data.orderId || '', shipment._id.toString());

    return { shipment, awbNumber, labelUrl };
  }

  async findByAwbNumber(awbNumber: string): Promise<Shipment | null> {
    return this.shipmentModel.findOne({ dtdcAwbNumber: awbNumber }).exec();
  }

  async findById(id: string): Promise<Shipment | null> {
    return this.shipmentModel.findById(id).exec();
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    return this.shipmentModel.find({ orderId: new Types.ObjectId(orderId) }).exec();
  }

  async listShipments(filters: ShipmentFilters): Promise<Shipment[]> {
    const query: any = {};

    if (filters.orderId) {
      query.orderId = new Types.ObjectId(filters.orderId);
    }

    if (filters.customerCode) {
      query.customerCode = filters.customerCode;
    }

    if (filters.statusCode) {
      query.currentStatusCode = filters.statusCode;
    }

    if (filters.isDelivered !== undefined) {
      query.isDelivered = filters.isDelivered;
    }

    if (filters.isCancelled !== undefined) {
      query.isCancelled = filters.isCancelled;
    }

    if (filters.awbNumber) {
      query.dtdcAwbNumber = filters.awbNumber;
    }

    if (filters.referenceNumber) {
      query.dtdcReferenceNumber = filters.referenceNumber;
    }

    if (filters.bookedFrom || filters.bookedTo) {
      query.bookedOn = {};
      if (filters.bookedFrom) {
        query.bookedOn.$gte = filters.bookedFrom;
      }
      if (filters.bookedTo) {
        query.bookedOn.$lte = filters.bookedTo;
      }
    }

    return this.shipmentModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async updateStatus(awbNumber: string, statusCode: string, statusDescription: string, location?: string): Promise<Shipment> {
    const shipment = await this.findByAwbNumber(awbNumber);

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    shipment.currentStatusCode = statusCode;
    shipment.currentStatusDescription = statusDescription;
    shipment.currentLocation = location || shipment.currentLocation;
    shipment.webhookLastReceivedAt = new Date();

    if (this.statusMapper.isDelivered(statusCode)) {
      shipment.isDelivered = true;
      shipment.deliveredAt = new Date();
    }

    if (this.statusMapper.isRto(statusCode)) {
      shipment.isRto = true;
    }

    await shipment.save();

    return shipment;
  }

  async cancelShipment(awbNumber: string): Promise<Shipment> {
    const shipment = await this.findByAwbNumber(awbNumber);

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    if (shipment.isDelivered) {
      throw new BadRequestException('Cannot cancel delivered shipment');
    }

    await this.dtdcApiService.cancelShipment([awbNumber], shipment._id.toString());

    shipment.isCancelled = true;
    shipment.cancelledAt = new Date();
    shipment.currentStatusCode = 'CAN';
    shipment.currentStatusDescription = 'Cancelled';

    await shipment.save();

    return shipment;
  }

  async getShipmentWithTracking(awbNumber: string): Promise<{ shipment: Shipment; tracking: any[] }> {
    const shipment = await this.findByAwbNumber(awbNumber);

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    const tracking = await this.trackingService.getShipmentTimeline(shipment._id.toString());

    return { shipment, tracking };
  }
}

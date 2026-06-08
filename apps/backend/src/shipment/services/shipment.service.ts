import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shipment } from '../entities/shipment.entity';
import { OrderTrackingAnalytics } from '../entities/order-tracking-analytics.entity';
import { DtdcApiService } from './dtdc-api.service';
import { TrackingService } from './tracking.service';
import { ShipmentStatusMapperService } from './shipment-status-mapper.service';
import {
  CreateShipmentData,
  ShipmentFilters,
} from '../interfaces/shipment.interface';
import { DtdcBookingPayload } from '../interfaces/dtdc-payload.interface';
import { ConfigService } from '@nestjs/config';
import { ShipmentLoggerService } from './shipment-logger.service';
import { OrderRepository } from '../../order/services/order.repository';
import { DeliveryPartnerFactory } from '../core/factories/delivery-partner.factory';
import * as fs from 'fs';
import * as path from 'path';
import { PaginationMeta } from '../../common/pagination';

function writeTrackingLog(msg: string) {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    const logPath = path.join(process.cwd(), 'logs', 'order-lookup-debug.log');
    if (!fs.existsSync(path.dirname(logPath))) {
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
    }
    fs.appendFileSync(logPath, logMsg);
    console.log(`[TRACKING_DEBUG] ${msg}`);
  } catch (e) {}
}

@Injectable()
export class ShipmentService {
  constructor(
    @InjectModel(Shipment.name)
    private readonly shipmentModel: Model<Shipment>,
    @InjectModel(OrderTrackingAnalytics.name)
    private readonly analyticsModel: Model<OrderTrackingAnalytics>,
    private readonly dtdcApiService: DtdcApiService,
    private readonly trackingService: TrackingService,
    private readonly statusMapper: ShipmentStatusMapperService,
    private readonly configService: ConfigService,
    private readonly shipmentLogger: ShipmentLoggerService,
    private readonly orderRepository: OrderRepository,
    private readonly deliveryPartnerFactory: DeliveryPartnerFactory,
  ) {}

  async createShipment(
    data: CreateShipmentData,
  ): Promise<{ shipment: Shipment; awbNumber: string; labelUrl: string }> {
    const providerStr = (data as any).provider || 'DTDC';
    const provider = providerStr === 'Shiprocket' ? 'SHIPROCKET' : providerStr;
    const adapter = this.deliveryPartnerFactory.getAdapter(
      provider as 'DTDC' | 'SHIPROCKET',
    );

    if (provider === 'DTDC') {
      const serviceable = await this.dtdcApiService.checkPincode(
        data.originDetails.pincode,
        data.destinationDetails.pincode,
      );

      if (!serviceable) {
        throw new BadRequestException(
          'Destination pincode not serviceable by DTDC',
        );
      }
    }

    const bookingResult = await adapter.bookShipment(data);
    const awbNumber = bookingResult.awbNumber;

    const trackingDisabledAfter = new Date();
    const trackingValidityDays =
      this.configService.get<number>('dtdc.defaults.trackingValidityDays') ||
      90;
    trackingDisabledAfter.setDate(
      trackingDisabledAfter.getDate() + trackingValidityDays,
    );

    const shipment = await this.shipmentModel.create({
      orderId: data.orderId ? new Types.ObjectId(data.orderId) : undefined,
      provider,
      pickupLocationName: (data as any).pickupLocationName,
      awbNumber: bookingResult.awbNumber,
      dtdcAwbNumber: bookingResult.awbNumber,
      dtdcReferenceNumber:
        bookingResult.providerOrderId ||
        data.orderNumber ||
        data.orderId ||
        `REF-${Date.now()}`,
      providerOrderId: bookingResult.providerOrderId,
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
      labelUrl: bookingResult.labelUrl,
    });

    this.shipmentLogger.logShipmentBooked(
      awbNumber,
      data.orderId || '',
      shipment._id.toString(),
      provider,
    );

    return { shipment, awbNumber, labelUrl: bookingResult.labelUrl };
  }

  async findByAwbNumber(awbNumber: string): Promise<Shipment | null> {
    return this.shipmentModel
      .findOne({
        $or: [{ awbNumber: awbNumber }, { dtdcAwbNumber: awbNumber }],
      })
      .exec();
  }

  async findById(id: string): Promise<Shipment | null> {
    return this.shipmentModel.findById(id).exec();
  }

  async findActiveShipmentsForTracking(provider?: string): Promise<Shipment[]> {
    const query: any = {
      isDelivered: false,
      isCancelled: false,
      isRto: false,
      dtdcAwbNumber: { $ne: null },
    };
    if (provider) query.provider = provider;
    return this.shipmentModel.find(query).exec();
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    return this.shipmentModel
      .find({ orderId: new Types.ObjectId(orderId) })
      .exec();
  }

  async listShipments(filters: ShipmentFilters): Promise<{
    shipments: Shipment[];
    total: number;
    meta: PaginationMeta;
    summary: {
      totalShipments: number;
      inTransit: number;
      deliveredToday: number;
      pending: number;
      rtoCount: number;
      cancelled: number;
    };
  }> {
    const baseFilter = this.buildBaseFilter(filters);
    const query: any = { ...baseFilter };

    if (filters.statusCode) {
      query.currentStatusCode = filters.statusCode;
    }

    if (filters.isDelivered !== undefined) {
      query.isDelivered = filters.isDelivered;
    }

    if (filters.isCancelled !== undefined) {
      query.isCancelled = filters.isCancelled;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [shipments, total, summary] = await Promise.all([
      this.shipmentModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.shipmentModel.countDocuments(query).exec(),
      this.getShipmentsSummary(baseFilter),
    ]);

    return {
      shipments,
      total,
      meta: this.buildPaginationMeta(total, page, limit),
      summary,
    };
  }

  async updateStatus(
    awbNumber: string,
    statusCode: string,
    statusDescription: string,
    location?: string,
  ): Promise<Shipment> {
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

    const provider = shipment.provider || 'DTDC';
    const adapter = this.deliveryPartnerFactory.getAdapter(
      provider as 'DTDC' | 'SHIPROCKET',
    );
    await adapter.cancelShipment(awbNumber, shipment.providerOrderId);

    shipment.isCancelled = true;
    shipment.cancelledAt = new Date();
    shipment.currentStatusCode = 'CAN';
    shipment.currentStatusDescription = 'Cancelled';
    await shipment.save();

    return shipment;
  }

  async getShipmentWithTracking(
    awbNumber: string,
  ): Promise<{ shipment: Shipment; tracking: any[] }> {
    const shipment = await this.findByAwbNumber(awbNumber);

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    const tracking = await this.trackingService.getShipmentTimeline(
      shipment._id.toString(),
    );

    return { shipment, tracking };
  }

  async getShipmentWithFreshTracking(
    awbNumber: string,
  ): Promise<{ shipment: Shipment; tracking: any[]; order: any | null }> {
    const shipment = await this.findByAwbNumber(awbNumber);

    if (!shipment) {
      throw new NotFoundException(`Shipment with AWB ${awbNumber} not found`);
    }

    const shipmentId = shipment._id.toString();

    try {
      const trackResponse = await this.dtdcApiService.trackShipment(awbNumber);

      if (trackResponse?.statusFlag && trackResponse.trackDetails?.length) {
        const newEvents = await this.trackingService.syncTrackingData(
          shipmentId,
          trackResponse.trackDetails,
        );

        if (newEvents && newEvents.length > 0) {
          const latestEvent = newEvents[newEvents.length - 1];
          const statusDescription = this.statusMapper.getStatusDescription(
            latestEvent.statusCode,
          );
          await this.updateStatus(
            awbNumber,
            latestEvent.statusCode,
            statusDescription,
            latestEvent.location,
          );
        }
      }
    } catch {}

    const updatedShipment = await this.findByAwbNumber(awbNumber);
    const tracking = await this.trackingService.getShipmentTimeline(shipmentId);

    let order: any | null = null;
    if (updatedShipment!.orderId) {
      order = await this.orderRepository.findByInternalId(
        updatedShipment!.orderId.toString(),
      );
    }

    return { shipment: updatedShipment!, tracking, order };
  }

  async findAwbByLookup(
    query: string,
    analyticsData?: {
      searchType: 'orderId' | 'phone' | 'awb';
      userAgent: string;
      ipAddress: string;
      userId?: string;
    },
  ): Promise<{
    awbNumber: string | null;
    orderId: string | null;
    order: any | null;
  }> {
    writeTrackingLog(
      `Start search for query: ${query}, analytics: ${JSON.stringify(analyticsData)}`,
    );
    let foundResult = false;
    let awbNumber: string | null = null;
    let foundOrder: any | null = null;

    writeTrackingLog(`Checking byAwb...`);
    const byAwb = await this.shipmentModel
      .findOne({ dtdcAwbNumber: query })
      .exec();
    if (byAwb) {
      writeTrackingLog(`Found byAwb: ${byAwb.dtdcAwbNumber}`);
      foundResult = true;
      awbNumber = byAwb.dtdcAwbNumber;
      if (byAwb.orderId) {
        foundOrder = await this.orderRepository.findByInternalId(
          byAwb.orderId.toString(),
        );
      }
    }

    if (!awbNumber) {
      writeTrackingLog(`Checking byOrderId...`);
      const byOrderId = await this.orderRepository.findById(query);
      if (byOrderId) {
        writeTrackingLog(`Found byOrderId: ${byOrderId.orderId}`);
        foundOrder = byOrderId;
        const shipments = await this.findByOrderId(byOrderId._id.toString());
        if (shipments.length > 0 && shipments[0].dtdcAwbNumber) {
          foundResult = true;
          awbNumber = shipments[0].dtdcAwbNumber;
        } else {
          // Order found but no AWB yet
          foundResult = true;
        }
      }
    }

    if (!foundOrder) {
      writeTrackingLog(`Checking byPhone...`);
      const byPhone = await this.orderRepository.findByPhone(query);
      if (byPhone) {
        writeTrackingLog(`Found byPhone: ${byPhone.orderId}`);
        foundOrder = byPhone;
        const shipments = await this.findByOrderId(byPhone._id.toString());
        if (shipments.length > 0 && shipments[0].dtdcAwbNumber) {
          foundResult = true;
          awbNumber = shipments[0].dtdcAwbNumber;
        } else {
          // Order found but no AWB yet
          foundResult = true;
        }
      }
    }

    // Save analytics data
    if (analyticsData) {
      try {
        const analyticsCreate: any = {
          searchQuery: query,
          searchType: analyticsData.searchType,
          userAgent: analyticsData.userAgent,
          ipAddress: analyticsData.ipAddress,
          foundResult,
        };
        if (analyticsData.userId) {
          analyticsCreate.userId = analyticsData.userId;
        }
        if (awbNumber) {
          analyticsCreate.awbNumber = awbNumber;
        }
        await this.analyticsModel.create(analyticsCreate);
      } catch (error) {
        Logger.error('Failed to save tracking analytics', error);
      }
    }

    return {
      awbNumber,
      orderId: foundOrder ? (foundOrder.orderId ?? null) : null,
      order: foundOrder
        ? foundOrder.toObject
          ? foundOrder.toObject()
          : foundOrder
        : null,
    };
  }

  async getTrackingAnalytics(filters: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const query: any = {};

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const analytics = await this.analyticsModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100)
      .exec();

    // Calculate summary statistics
    const totalSearches = await this.analyticsModel
      .countDocuments(query)
      .exec();
    const successfulSearches = await this.analyticsModel
      .countDocuments({ ...query, foundResult: true })
      .exec();
    const searchTypeBreakdown = await this.analyticsModel
      .aggregate([
        { $match: query },
        { $group: { _id: '$searchType', count: { $sum: 1 } } },
      ])
      .exec();

    return {
      totalSearches,
      successfulSearches,
      successRate:
        totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0,
      searchTypeBreakdown,
      recentSearches: analytics.map((item) => ({
        id: item._id.toString(),
        searchQuery: item.searchQuery,
        searchType: item.searchType,
        foundResult: item.foundResult,
        createdAt: item.createdAt!.toISOString(),
        userAgent: item.userAgent,
        ipAddress: item.ipAddress,
      })),
    };
  }

  private buildPaginationMeta(
    total: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      totalCount: total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private buildBaseFilter(filters: ShipmentFilters): any {
    const query: any = {};

    if (filters.orderId) {
      query.orderId = new Types.ObjectId(filters.orderId);
    }

    if (filters.customerCode) {
      query.customerCode = filters.customerCode;
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

    return query;
  }

  private async getShipmentsSummary(baseFilter: any): Promise<{
    totalShipments: number;
    inTransit: number;
    deliveredToday: number;
    pending: number;
    rtoCount: number;
    cancelled: number;
  }> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalShipments,
      inTransit,
      deliveredToday,
      pending,
      rtoCount,
      cancelled,
    ] = await Promise.all([
      this.shipmentModel.countDocuments(baseFilter).exec(),
      this.shipmentModel
        .countDocuments({
          ...baseFilter,
          currentStatusCode: { $in: ['ITM', 'OFD'] },
        })
        .exec(),
      this.shipmentModel
        .countDocuments({
          ...baseFilter,
          isDelivered: true,
          deliveredAt: { $gte: startOfToday, $lte: endOfToday },
        })
        .exec(),
      this.shipmentModel
        .countDocuments({
          ...baseFilter,
          currentStatusCode: { $in: ['BKD', 'PUP'] },
        })
        .exec(),
      this.shipmentModel
        .countDocuments({
          ...baseFilter,
          isRto: true,
        })
        .exec(),
      this.shipmentModel
        .countDocuments({
          ...baseFilter,
          isCancelled: true,
        })
        .exec(),
    ]);

    return {
      totalShipments,
      inTransit,
      deliveredToday,
      pending,
      rtoCount,
      cancelled,
    };
  }
}

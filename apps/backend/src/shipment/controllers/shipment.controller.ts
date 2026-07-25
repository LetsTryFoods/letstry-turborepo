import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Req,
  Res,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Request, Response } from 'express';
import { TrackingCronService } from '../services/tracking-cron.service';
import { ShipmentService } from '../services/shipment.service';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';
import { MetaWhatsappService } from '../../whatsapp/services/meta-whatsapp.service';
import { OrderRepository } from '../../order/services/order.repository';
import { LabelScanLog } from '../entities/label-scan-log.entity';
import { Public } from '../../common/decorators/public.decorator';
import { Admin } from '../../common/decorators/admin.decorator';

@Controller('shipments')
export class ShipmentController {
  constructor(
    private readonly trackingCronService: TrackingCronService,
    private readonly shipmentService: ShipmentService,
    private readonly whatsappService: WhatsAppService,
    private readonly metaWhatsappService: MetaWhatsappService,
    private readonly orderRepository: OrderRepository,
    @InjectModel(LabelScanLog.name)
    private readonly labelScanLogModel: Model<LabelScanLog>,
  ) {}

  @Public()
  @Get('label/:awb/download')
  async downloadShippingLabel(
    @Param('awb') awb: string,
    @Res() res: Response,
  ) {
    const shipment = await this.shipmentService.findByAwbNumber(awb);
    if (!shipment || !shipment.labelUrl) {
      throw new NotFoundException('Shipping label not found');
    }

    let base64Data = shipment.labelUrl;
    if (base64Data.startsWith('data:application/pdf;base64,')) {
      base64Data = base64Data.replace('data:application/pdf;base64,', '');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=shipping-label-${awb}.pdf`,
      'Content-Length': buffer.length,
    });
    
    res.end(buffer);
  }

  @Public()
  @Post('trigger-tracking-sync')
  @HttpCode(HttpStatus.OK)
  async triggerTrackingSync(): Promise<{ message: string }> {
    await this.trackingCronService.triggerTrackingSync();
    return { message: 'Tracking sync job enqueued' };
  }

  @Public()
  @Get('track/:awb')
  async getPublicTracking(@Param('awb') awb: string) {
    const result = await this.shipmentService.getShipmentWithFreshTracking(awb);
    const shipmentObj = result.shipment.toObject() as any;
    const orderObj = result.order
      ? result.order.toObject
        ? result.order.toObject()
        : result.order
      : null;

    return {
      awbNumber: shipmentObj.dtdcAwbNumber,
      statusCode: shipmentObj.currentStatusCode,
      statusDescription: shipmentObj.currentStatusDescription,
      origin: shipmentObj.originCity,
      destination: shipmentObj.destinationCity,
      bookedAt: shipmentObj.createdAt,
      isDelivered: shipmentObj.isDelivered,
      isCancelled: shipmentObj.isCancelled,
      estimatedDelivery: shipmentObj.estimatedDelivery ?? null,
      deliveryAddress: shipmentObj.destinationDetails ?? null,
      order: orderObj
        ? {
            orderId: orderObj.orderId,
            totalAmount: orderObj.totalAmount,
            currency: orderObj.currency,
            items: (orderObj.items ?? []).map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.totalPrice,
              variant: item.variant ?? null,
              image: item.image ?? null,
            })),
          }
        : null,
      trackingHistory: result.tracking.map((t: any) => {
        const obj = t.toObject ? t.toObject() : t;
        return {
          statusCode: obj.statusCode,
          statusDescription: obj.statusDescription,
          location: obj.location,
          actionDatetime: obj.actionDatetime,
          remarks: obj.remarks,
        };
      }),
    };
  }
  @Public()
  @Get('lookup')
  async lookupShipment(@Query('q') q: string, @Req() request: Request) {
    if (!q || !q.trim()) {
      throw new BadRequestException('Search query is required');
    }

    // Determine search type
    let searchType: 'orderId' | 'phone' | 'awb' = 'awb';
    const query = q.trim();

    // Simple heuristics to determine search type
    if (/^\d{10}$/.test(query)) {
      searchType = 'phone';
    } else if (/^ORD-/.test(query) || /^ORD_/.test(query)) {
      searchType = 'orderId';
    } else if (/^\d+$/.test(query) && query.length > 5) {
      searchType = 'awb';
    }

    const analyticsData = {
      searchType,
      userAgent: request.headers['user-agent'] || '',
      ipAddress: request.ip || request.connection.remoteAddress || '',
      userId: undefined, // Could be extracted from JWT if authenticated
    };

    const result = await this.shipmentService.findAwbByLookup(
      query,
      analyticsData,
    );

    if (!result.awbNumber && !result.orderId) {
      throw new NotFoundException('No order found for the provided details.');
    }

    return {
      awbNumber: result.awbNumber,
      orderId: result.orderId,
      hasAwb: !!result.awbNumber,
      order: result.order
        ? {
            orderId: result.order.orderId,
            orderStatus: result.order.orderStatus,
            totalAmount: result.order.totalAmount,
            currency: result.order.currency,
            items: (result.order.items ?? []).map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.totalPrice,
              variant: item.variant ?? null,
              image: item.image ?? null,
            })),
            recipientContact: {
              phone: (() => {
                const phone =
                  result.order.recipientContact?.phone &&
                  result.order.recipientContact.phone !== 'N/A'
                    ? result.order.recipientContact.phone
                    : result.order.shippingAddressId?.recipientPhone;
                if (!phone || phone === 'N/A') return 'N/A';
                const clean = phone.replace(/\D/g, '');
                if (clean.length < 10) return phone;
                return clean.slice(0, 2) + 'XXXXXX' + clean.slice(-2);
              })(),
              email: result.order.recipientContact?.email ?? null,
            },
            createdAt: result.order.createdAt,
            shippingAddressId: result.order.shippingAddressId ?? null,
          }
        : null,
    };
  }

  @Admin()
  @Get('analytics/tracking')
  async getTrackingAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shipmentService.getTrackingAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  /**
   * POST /shipments/manual-awb-notify
   * Admin scans a label photo → extracts AWB → links to order → sends WhatsApp.
   * Body: { awbNumber, orderId, phoneNumber?, orderDate? }
   */
  @Admin()
  @Post('manual-awb-notify')
  @HttpCode(HttpStatus.OK)
  async manualAwbNotify(
    @Body()
    body: {
      awbNumber: string;
      orderId: string;
      phoneNumber?: string;
      orderDate?: string;
      scanType?: string;
      allowDuplicate?: boolean;
    },
  ): Promise<{ success: boolean; message: string; phone?: string; logId?: string }> {
    const { awbNumber, orderId, allowDuplicate } = body;

    if (!awbNumber || !orderId) {
      throw new BadRequestException('awbNumber and orderId are required');
    }

    // Protection: Prevent duplicate AWB or duplicate Order notifications
    if (!allowDuplicate) {
      const cleanAwb = awbNumber.trim();
      const cleanOrderId = orderId.trim();
      const existingLog = await this.labelScanLogModel.findOne({
        $or: [{ awbNumber: cleanAwb }, { orderDisplayId: cleanOrderId }],
        whatsappSent: true,
      });

      if (existingLog) {
        if (existingLog.awbNumber === cleanAwb) {
          throw new BadRequestException(
            `Duplicate AWB: AWB ${cleanAwb} has already been processed for order ${existingLog.orderDisplayId}.`,
          );
        } else {
          throw new BadRequestException(
            `Duplicate Order: Order ${cleanOrderId} has already been processed with AWB ${existingLog.awbNumber}.`,
          );
        }
      }
    }

    // Find order
    let order: any = await this.orderRepository.findById(orderId);
    if (!order) {
      order = await this.orderRepository.findByInternalId(orderId);
    }

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    let phone = body.phoneNumber;
    let orderCreatedAt: string | null = null;

    // Extract phone — shippingAddress.phone is most reliable on label
    const shippingAddr = order.shippingAddressId;
    phone =
      phone ||
      shippingAddr?.phone ||
      order.recipientContact?.phone ||
      null;

    if (order.createdAt) {
      const d = new Date(order.createdAt);
      orderCreatedAt = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }

    if (!phone) {
      throw new BadRequestException(
        'Could not determine customer phone number. Please provide phoneNumber in the request.',
      );
    }

    // Clean phone — remove +91 prefix if present, keep 10 digits
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const orderDate = body.orderDate || orderCreatedAt || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const sent = await this.metaWhatsappService.sendDeliveryNotification(
      cleanPhone,
      orderDate,
      awbNumber,
    );

    if (!sent) {
      throw new InternalServerErrorException('Failed to send WhatsApp notification');
    }

    // Save audit log entry in database
    const scanLog = await this.labelScanLogModel.create({
      orderId: order._id,
      orderDisplayId: order.orderId || orderId,
      awbNumber,
      scanType: body.scanType || 'AUTO_BARCODE',
      whatsappSent: true,
      whatsappSentAt: new Date(),
      recipientPhone: cleanPhone,
      orderDate,
    });

    return {
      success: true,
      message: `WhatsApp sent to ${cleanPhone}`,
      phone: cleanPhone,
      logId: (scanLog as any)._id?.toString(),
    };
  }

  /**
   * GET /shipments/label-scan-logs
   * Retrieve historical audit logs of scanned AWB links and WhatsApp notifications.
   */
  @Admin()
  @Get('label-scan-logs')
  async getLabelScanLogs(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const page = Math.max(1, parseInt(pageStr || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitStr || '25', 10)));
    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      this.labelScanLogModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.labelScanLogModel.countDocuments(),
    ]);

    return { logs, totalCount, page, limit };
  }
}


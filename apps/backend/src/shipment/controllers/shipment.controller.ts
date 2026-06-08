import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { TrackingCronService } from '../services/tracking-cron.service';
import { ShipmentService } from '../services/shipment.service';
import { Public } from '../../common/decorators/public.decorator';
import { Admin } from '../../common/decorators/admin.decorator';

@Controller('shipments')
export class ShipmentController {
  constructor(
    private readonly trackingCronService: TrackingCronService,
    private readonly shipmentService: ShipmentService,
  ) {}

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
}

import { Controller, Get, Post, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TrackingCronService } from '../services/tracking-cron.service';
import { ShipmentService } from '../services/shipment.service';
import { Public } from '../../common/decorators/public.decorator';

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
        const orderObj = result.order ? (result.order.toObject ? result.order.toObject() : result.order) : null;

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
            order: orderObj ? {
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
            } : null,
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
}

import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Request } from 'express';
import { ShiprocketWebhookAuthGuard } from '../guards/shiprocket-webhook-auth.guard';
import { ShipmentLoggerService } from '../services/shipment-logger.service';

@Controller('shipment/webhooks')
export class ShiprocketWebhookController {
  private readonly logger = new Logger(ShiprocketWebhookController.name);

  constructor(
    @InjectQueue('tracking-queue') private trackingQueue: Queue,
    private readonly shipmentLogger: ShipmentLoggerService,
  ) {}

  @Post('partner-update')
  @UseGuards(ShiprocketWebhookAuthGuard)
  async handleWebhook(@Body() body: any, @Req() req: Request) {
    this.shipmentLogger.logShiprocketWebhookRaw(body);
    this.logger.log(
      `Received webhook from Shiprocket: ${JSON.stringify(body)}`,
    );

    try {
      const { awb, sr_order_id, current_status_id, scans } = body;

      if (awb && current_status_id) {
        await this.trackingQueue.add(
          'shiprocket-webhook-update',
          {
            awb,
            srOrderId: sr_order_id,
            statusId: current_status_id,
            scans,
            receivedAt: new Date(),
          },
          {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );
      }
    } catch (error) {
      this.logger.error(`Error queuing webhook payload: ${error.message}`);
    }

    return { statusCode: 200, message: 'Webhook received' };
  }
}

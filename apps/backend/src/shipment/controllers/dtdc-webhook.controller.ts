import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { DtdcWebhookService } from '../services/dtdc-webhook.service';
import type { DtdcWebhookPayload } from '../interfaces/dtdc-payload.interface';
import { DtdcWebhookAuthGuard } from '../guards/dtdc-webhook-auth.guard';
import { ShipmentLoggerService } from '../services/shipment-logger.service';

@Controller('webhooks/dtdc')
export class DtdcWebhookController {
  constructor(
    private readonly dtdcWebhookService: DtdcWebhookService,
    private readonly shipmentLogger: ShipmentLoggerService,
  ) {}

  @Post('status')
  @UseGuards(DtdcWebhookAuthGuard)
  @HttpCode(HttpStatus.OK)
  async handleStatusUpdate(@Body() payload: DtdcWebhookPayload): Promise<{ success: boolean }> {
    const startTime = Date.now();

    try {
      await this.dtdcWebhookService.processWebhook(payload);

      const duration = Date.now() - startTime;
      const awbNumber = payload.shipment?.strShipmentNo || 'unknown';
      this.shipmentLogger.logWebhookProcessed(awbNumber, duration);

      return { success: true };
    } catch (error) {
      const duration = Date.now() - startTime;
      const awbNumber = payload.shipment?.strShipmentNo || 'unknown';
      this.shipmentLogger.logWebhookFailed(awbNumber, error.message, duration);
      return { success: false };
    }
  }
}

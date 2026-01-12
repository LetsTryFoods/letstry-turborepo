import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ShipmentService } from '../services/shipment.service';
import { TrackingService } from '../services/tracking.service';
import { DtdcWebhookService } from '../services/dtdc-webhook.service';
import { ShipmentStatusMapperService } from '../services/shipment-status-mapper.service';
import { DtdcWebhookPayload } from '../interfaces/dtdc-payload.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentLoggerService } from '../services/shipment-logger.service';

@Processor('shipment-webhook')
export class ShipmentWebhookProcessor extends WorkerHost {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly trackingService: TrackingService,
    private readonly webhookService: DtdcWebhookService,
    private readonly statusMapper: ShipmentStatusMapperService,
    private readonly eventEmitter: EventEmitter2,
    private readonly shipmentLogger: ShipmentLoggerService,
  ) {
    super();
  }

  async process(job: Job<{ webhookLogId: string; payload: DtdcWebhookPayload }>): Promise<void> {
    const { webhookLogId, payload } = job.data;

    try {
      const awbNumber = payload.shipment.strShipmentNo;
      const latestStatus = payload.shipmentStatus[0];
      
      const shipment = await this.shipmentService.findByAwbNumber(awbNumber);

      if (!shipment) {
        this.shipmentLogger.logError('Shipment not found for webhook', new Error('Not found'), { awbNumber });
        await this.webhookService.markWebhookProcessed(webhookLogId, false, 'Shipment not found');
        return;
      }

      const statusDescription = this.statusMapper.getStatusDescription(latestStatus.strAction);

      await this.shipmentService.updateStatus(
        awbNumber,
        latestStatus.strAction,
        statusDescription,
        latestStatus.strOrigin,
      );

      const trackingEvent = await this.trackingService.addTrackingEvent(shipment._id.toString(), latestStatus);

      await this.webhookService.markWebhookProcessed(webhookLogId, true);

      this.eventEmitter.emit('shipment.status.updated', {
        shipmentId: shipment._id.toString(),
        trackingEvent,
      });

      this.eventEmitter.emit('tracking.event.added', {
        awbNumber,
        trackingEvent,
      });

      this.shipmentLogger.logWebhookReceived(awbNumber, latestStatus.strAction);
    } catch (error) {
      this.shipmentLogger.logError('Failed to process webhook', error, { awbNumber: payload.shipment?.strShipmentNo, webhookLogId });
      await this.webhookService.markWebhookProcessed(webhookLogId, false, error.message);
      throw error;
    }
  }
}

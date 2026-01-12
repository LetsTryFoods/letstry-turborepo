import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DtdcWebhookLog } from '../entities/dtdc-webhook-log.entity';
import { DtdcWebhookPayload } from '../interfaces/dtdc-payload.interface';
import { ShipmentLoggerService } from './shipment-logger.service';

@Injectable()
export class DtdcWebhookService {
  constructor(
    @InjectModel(DtdcWebhookLog.name)
    private readonly webhookLogModel: Model<DtdcWebhookLog>,
    @InjectQueue('shipment-webhook')
    private readonly webhookQueue: Queue,
    private readonly shipmentLogger: ShipmentLoggerService,
  ) {}

  async processWebhook(payload: DtdcWebhookPayload): Promise<void> {
    const awbNumber = payload.shipment.strShipmentNo;
    const latestStatus = payload.shipmentStatus[0];
    
    const webhookLog = await this.webhookLogModel.create({
      awbNumber,
      statusCode: latestStatus.strAction,
      payload: payload as any,
      processed: false,
      receivedAt: new Date(),
    });

    await this.webhookQueue.add(
      'process-status-update',
      {
        webhookLogId: webhookLog._id.toString(),
        payload,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.shipmentLogger.logWebhookReceived(awbNumber, latestStatus.strAction);
  }

  async markWebhookProcessed(webhookLogId: string, success: boolean, error?: string): Promise<void> {
    await this.webhookLogModel.findByIdAndUpdate(webhookLogId, {
      processed: success,
      processedAt: new Date(),
      error: error || undefined,
    });
  }
}

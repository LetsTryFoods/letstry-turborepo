import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { WhatsAppOrchestratorService } from '../services/whatsapp-orchestrator.service';
import { WinstonLoggerService } from '../../logger/logger.service';

export interface PaymentConfirmationJobData {
  type: 'payment-confirmation';
  phoneNumber: string;
  orderId: string;
  amountPaid: string;
  paymentMode: string;
  transactionId: string;
  orderDate: string;
}

export interface OrderPackedJobData {
  type: 'order-packed';
  phoneNumber: string;
  orderId: string;
  orderDate: string;
  trackingUrl: string;
  recipientName?: string;
}

export type WhatsAppNotificationJobData =
  | PaymentConfirmationJobData
  | OrderPackedJobData;

@Processor('whatsapp-notification-queue')
@Injectable()
export class WhatsAppNotificationProcessor extends WorkerHost {
  constructor(
    private readonly orchestrator: WhatsAppOrchestratorService,
    private readonly logger: WinstonLoggerService,
  ) {
    super();
  }

  async process(job: Job<WhatsAppNotificationJobData>): Promise<void> {
    this.logger.log(
      `Processing WhatsApp notification [${job.name}] - ${JSON.stringify({ jobId: job.id, attempt: job.attemptsMade + 1, payload: job.data })}`,
      'WhatsAppNotificationProcessor',
    );

    try {
      let result: { success: boolean; channel: string; error?: string };

      if (job.name === 'payment-confirmation') {
        const data = job.data as PaymentConfirmationJobData;
        result = await this.orchestrator.sendPaymentConfirmation(
          data.phoneNumber,
          data.orderId,
          data.amountPaid,
          data.paymentMode,
          data.transactionId,
          data.orderDate,
        );
      } else if (job.name === 'order-packed') {
        const data = job.data as OrderPackedJobData;
        result = await this.orchestrator.sendOrderPackedNotification(
          data.phoneNumber,
          data.orderId,
          data.orderDate,
          data.trackingUrl,
          data.recipientName,
        );
      } else {
        this.logger.warn(
          `Unknown job name: ${job.name}`,
          'WhatsAppNotificationProcessor',
        );
        return;
      }

      if (result.success) {
        this.logger.log(
          `WhatsApp [${job.name}] delivered via ${result.channel}`,
          'WhatsAppNotificationProcessor',
        );
      } else {
        this.logger.warn(
          `WhatsApp [${job.name}] failed on all channels: ${result.error}`,
          'WhatsAppNotificationProcessor',
        );
        // Don't throw — orchestrator already logged it; avoid infinite retries for permanent failures
      }
    } catch (error) {
      this.logger.error(
        `Error processing WhatsApp notification [${job.name}] - ${error.message}`,
        'WhatsAppNotificationProcessor',
      );
      throw error;
    }
  }
}


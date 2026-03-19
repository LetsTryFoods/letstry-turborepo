import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';
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
}

export type WhatsAppNotificationJobData = PaymentConfirmationJobData | OrderPackedJobData;


@Processor('whatsapp-notification-queue')
@Injectable()
export class WhatsAppNotificationProcessor extends WorkerHost {
  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly logger: WinstonLoggerService,
  ) {
    super();
  }

  async process(job: Job<WhatsAppNotificationJobData>): Promise<void> {
    const { type } = job.data;

    this.logger.log(
      `Processing WhatsApp notification [${job.name}] - ${JSON.stringify({ jobId: job.id, attempt: job.attemptsMade + 1, payload: job.data })}`,
      'WhatsAppNotificationProcessor',
    );

    try {
      let success = false;

      if (job.name === 'payment-confirmation') {
        const data = job.data as PaymentConfirmationJobData;
        success = await this.whatsAppService.sendPaymentConfirmation(
          data.phoneNumber,
          data.orderId,
          data.amountPaid,
          data.paymentMode,
          data.transactionId,
          data.orderDate,
        );
      } else if (job.name === 'order-packed') {
        const data = job.data as OrderPackedJobData;
        success = await this.whatsAppService.sendOrderPackedNotification(
          data.phoneNumber,
          data.orderId,
          data.orderDate,
          data.trackingUrl,
        );
      } else {
         this.logger.warn(`Unknown job name: ${job.name}`, 'WhatsAppNotificationProcessor');
         return;
      }

      if (success) {
        this.logger.log(
          `WhatsApp notification [${job.name}] sent successfully.`,
          'WhatsAppNotificationProcessor',
        );
      } else {
        this.logger.warn(
          `Failed to send WhatsApp notification [${job.name}].`,
          'WhatsAppNotificationProcessor',
        );
        throw new Error('WhatsApp API returned failure');
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

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';
import { WinstonLoggerService } from '../../logger/logger.service';

export interface PaymentConfirmationJobData {
  phoneNumber: string;
  orderId: string;
  amountPaid: string;
  paymentMode: string;
  transactionId: string;
  orderDate: string;
}

@Processor('whatsapp-notification-queue')
@Injectable()
export class WhatsAppNotificationProcessor extends WorkerHost {
  constructor(
    private readonly whatsAppService: WhatsAppService,
    private readonly logger: WinstonLoggerService,
  ) {
    super();
  }

  async process(job: Job<PaymentConfirmationJobData>): Promise<void> {
    const { phoneNumber, orderId, amountPaid, paymentMode, transactionId, orderDate } = job.data;

    this.logger.log(
      `Processing WhatsApp payment confirmation for Order: ${orderId}`,
      'WhatsAppNotificationProcessor',
    );

    try {
      const success = await this.whatsAppService.sendPaymentConfirmation(
        phoneNumber,
        orderId,
        amountPaid,
        paymentMode,
        transactionId,
        orderDate,
      );

      if (success) {
        this.logger.log(
          `WhatsApp payment confirmation sent successfully for Order: ${orderId}`,
          'WhatsAppNotificationProcessor',
        );
      } else {
        this.logger.warn(
          `Failed to send WhatsApp payment confirmation for Order: ${orderId}`,
          'WhatsAppNotificationProcessor',
        );
        throw new Error('WhatsApp API returned failure');
      }
    } catch (error) {
      this.logger.error(
        `Error sending WhatsApp payment confirmation for Order: ${orderId} - ${error.message}`,
        'WhatsAppNotificationProcessor',
      );
      throw error;
    }
  }
}

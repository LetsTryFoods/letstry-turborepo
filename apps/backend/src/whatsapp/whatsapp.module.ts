import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WhatsAppService } from './whatsapp.service';
import { LoggerModule } from '../logger/logger.module';
import { WhatsAppNotificationProcessor } from './processors/whatsapp-notification.processor';

@Module({
  imports: [
    LoggerModule,
    BullModule.registerQueue({
      name: 'whatsapp-notification-queue',
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
        attempts: Number.MAX_SAFE_INTEGER,
        backoff: {
          type: 'exponential',
          delay: 30000,
        },
      },
    }),
  ],
  providers: [WhatsAppService, WhatsAppNotificationProcessor],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

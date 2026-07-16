import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsAppService } from './whatsapp.service';
import { LoggerModule } from '../logger/logger.module';
import { WhatsAppNotificationProcessor } from './processors/whatsapp-notification.processor';
import { WhatsAppInboundProcessor } from './processors/whatsapp-inbound.processor';
import { BaileysService } from './services/baileys.service';
import { BaileysMessageLogService } from './services/baileys-message-log.service';
import { WhatsAppOrchestratorService } from './services/whatsapp-orchestrator.service';
import { WhatsAppSettingsService } from './services/whatsapp-settings.service';
import { WhatsAppChatService } from './services/whatsapp-chat.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppChatController } from './whatsapp-chat.controller';
import { MetaWhatsappService } from './services/meta-whatsapp.service';
import { WhatsAppSupportGateway } from './whatsapp-support.gateway';
import {
  BaileysMessageLog,
  BaileysMessageLogSchema,
} from './schemas/baileys-message-log.schema';
import {
  BaileysSession,
  BaileysSessionSchema,
} from './schemas/baileys-session.schema';
import {
  WhatsAppSettings,
  WhatsAppSettingsSchema,
} from './schemas/whatsapp-settings.schema';
import {
  WhatsAppChat,
  WhatsAppChatSchema,
} from './schemas/whatsapp-chat.schema';
import {
  WhatsAppMessage,
  WhatsAppMessageSchema,
} from './schemas/whatsapp-message.schema';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forFeature([
      { name: BaileysMessageLog.name, schema: BaileysMessageLogSchema },
      { name: BaileysSession.name, schema: BaileysSessionSchema },
      { name: WhatsAppSettings.name, schema: WhatsAppSettingsSchema },
      { name: WhatsAppChat.name, schema: WhatsAppChatSchema },
      { name: WhatsAppMessage.name, schema: WhatsAppMessageSchema },
    ]),
    UploadModule,
    BullModule.registerQueue(
      {
        name: 'whatsapp-notification-queue',
        defaultJobOptions: {
          removeOnComplete: false,
          removeOnFail: false,
          attempts: Number.MAX_SAFE_INTEGER,
          backoff: { type: 'exponential', delay: 30000 },
        },
      },
      {
        name: 'whatsapp-inbound-queue',
        defaultJobOptions: {
          removeOnComplete: 500,  // Keep last 500 completed for debugging
          removeOnFail: 100,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      },
    ),
  ],
  controllers: [WhatsAppController, WhatsAppChatController],
  providers: [
    WhatsAppService,
    WhatsAppNotificationProcessor,
    WhatsAppInboundProcessor,
    BaileysService,
    BaileysMessageLogService,
    WhatsAppOrchestratorService,
    WhatsAppSettingsService,
    WhatsAppChatService,
    MetaWhatsappService,
    WhatsAppSupportGateway,
  ],
  exports: [
    WhatsAppService,
    WhatsAppOrchestratorService,
    BaileysService,
    BaileysMessageLogService,
    WhatsAppSettingsService,
    WhatsAppChatService,
    MetaWhatsappService,
    WhatsAppSupportGateway,
  ],
})
export class WhatsAppModule { }

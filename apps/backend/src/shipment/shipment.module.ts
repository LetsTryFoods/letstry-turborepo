import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { Shipment, ShipmentSchema } from './entities/shipment.entity';
import {
  ShipmentTrackingHistory,
  ShipmentTrackingHistorySchema,
} from './entities/shipment-tracking-history.entity';
import {
  DtdcWebhookLog,
  DtdcWebhookLogSchema,
} from './entities/dtdc-webhook-log.entity';
import { DtdcApiLog, DtdcApiLogSchema } from './entities/dtdc-api-log.entity';
import { ShipmentService } from './services/shipment.service';
import { DtdcApiService } from './services/dtdc-api.service';
import { TrackingService } from './services/tracking.service';
import { ShipmentStatusMapperService } from './services/shipment-status-mapper.service';
import { DtdcWebhookService } from './services/dtdc-webhook.service';
import { ShipmentResolver } from './resolvers/shipment.resolver';
import { ShipmentSubscriptionResolver } from './resolvers/shipment-subscription.resolver';
import { DtdcWebhookController } from './controllers/dtdc-webhook.controller';
import { ShipmentWebhookProcessor } from './processors/shipment-webhook.processor';
import { DtdcWebhookAuthGuard } from './guards/dtdc-webhook-auth.guard';
import { ShipmentLoggerService } from './services/shipment-logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shipment.name, schema: ShipmentSchema },
      { name: ShipmentTrackingHistory.name, schema: ShipmentTrackingHistorySchema },
      { name: DtdcWebhookLog.name, schema: DtdcWebhookLogSchema },
      { name: DtdcApiLog.name, schema: DtdcApiLogSchema },
    ]),
    BullModule.registerQueue({
      name: 'shipment-webhook',
    }),
    ConfigModule,
  ],
  controllers: [DtdcWebhookController],
  providers: [
    ShipmentService,
    DtdcApiService,
    TrackingService,
    ShipmentStatusMapperService,
    DtdcWebhookService,
    ShipmentResolver,
    ShipmentSubscriptionResolver,
    ShipmentWebhookProcessor,
    DtdcWebhookAuthGuard,
    ShipmentLoggerService,
  ],
  exports: [ShipmentService, DtdcApiService, TrackingService],
})
export class ShipmentModule {}

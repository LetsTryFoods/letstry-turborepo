
import { PickupLocation, PickupLocationSchema } from './entities/pickup-location.entity';
import { DeliveryPartnerFactory } from './core/factories/delivery-partner.factory';
import { DtdcAdapter } from './adapters/dtdc/dtdc.adapter';
import { ShiprocketAdapter } from './adapters/shiprocket/shiprocket.adapter';
import { ShiprocketApiService } from './providers/shiprocket/shiprocket-api.service';
import { ShiprocketAuthService } from './providers/shiprocket/shiprocket-auth.service';
import { ShiprocketMapper } from './adapters/shiprocket/shiprocket.mapper';
import { ShiprocketWebhookController } from './controllers/shiprocket-webhook.controller';
import { ShiprocketWebhookAuthGuard } from './guards/shiprocket-webhook-auth.guard';
import { AppCacheModule } from '../cache/app-cache.module';

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModule } from '../order/order.module';
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
import { OrderTrackingAnalytics, OrderTrackingAnalyticsSchema } from './entities/order-tracking-analytics.entity';
import { ShipmentService } from './services/shipment.service';
import { DtdcApiService } from './services/dtdc-api.service';
import { TrackingService } from './services/tracking.service';
import { ShipmentStatusMapperService } from './services/shipment-status-mapper.service';
import { DtdcWebhookService } from './services/dtdc-webhook.service';
import { ShipmentResolver } from './resolvers/shipment.resolver';
import { ShipmentSubscriptionResolver } from './resolvers/shipment-subscription.resolver';
import { DtdcWebhookController } from './controllers/dtdc-webhook.controller';
import { ShipmentController } from './controllers/shipment.controller';
import { ShipmentWebhookProcessor } from './processors/shipment-webhook.processor';
import { DtdcWebhookAuthGuard } from './guards/dtdc-webhook-auth.guard';
import { ShipmentLoggerService } from './services/shipment-logger.service';
import { TrackingCronService } from './services/tracking-cron.service';
import { TrackingProcessor } from './processors/tracking.processor';
import { TrackingLoggerService } from './services/tracking-logger.service';

import { PickupLocationService } from './services/pickup-location.service';
import { PickupLocationResolver } from './resolvers/pickup-location.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shipment.name, schema: ShipmentSchema },
      { name: ShipmentTrackingHistory.name, schema: ShipmentTrackingHistorySchema },
      { name: DtdcWebhookLog.name, schema: DtdcWebhookLogSchema },
      { name: DtdcApiLog.name, schema: DtdcApiLogSchema },
      { name: OrderTrackingAnalytics.name, schema: OrderTrackingAnalyticsSchema },
      { name: PickupLocation.name, schema: PickupLocationSchema },
    ]),
    BullModule.registerQueue({
      name: 'shipment-webhook',
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
      },
    }),
    BullModule.registerQueue({
      name: 'tracking-queue',
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
      },
    }),
    ConfigModule,
    forwardRef(() => OrderModule),
    AppCacheModule,
  ],
  controllers: [DtdcWebhookController, ShipmentController, ShiprocketWebhookController],
  providers: [
    DeliveryPartnerFactory,
    DtdcAdapter,
    ShiprocketAdapter,
    ShiprocketApiService,
    ShiprocketAuthService,
    ShiprocketMapper,
    ShiprocketWebhookAuthGuard,
    ShipmentService,
    DtdcApiService,
    TrackingService,
    ShipmentStatusMapperService,
    DtdcWebhookService,
    ShipmentResolver,
    PickupLocationService,
    PickupLocationResolver,
    ShipmentSubscriptionResolver,
    ShipmentWebhookProcessor,
    DtdcWebhookAuthGuard,
    ShipmentLoggerService,
    TrackingCronService,
    TrackingProcessor,
    TrackingLoggerService,
  ],
  exports: [ShipmentService, DtdcApiService, TrackingService, ShipmentLoggerService, PickupLocationService],
})
export class ShipmentModule { }

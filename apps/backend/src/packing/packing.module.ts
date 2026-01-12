import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { Packer, PackerSchema } from './entities/packer.entity';
import {
  PackingOrder,
  PackingOrderSchema,
} from './entities/packing-order.entity';
import { ScanLog, ScanLogSchema } from './entities/scan-log.entity';
import {
  PackingEvidence,
  PackingEvidenceSchema,
} from './entities/packing-evidence.entity';
import { Address, AddressSchema } from '../address/address.schema';

import { PackerCrudService } from './services/core/packer-crud.service';
import { PackingOrderCrudService } from './services/core/packing-order-crud.service';
import { ScanLogCrudService } from './services/core/scan-log-crud.service';
import { EvidenceCrudService } from './services/core/evidence-crud.service';

import { PackerStatsService } from './services/domain/packer-stats.service';
import { PackerAuthService } from './services/domain/packer-auth.service';
import { OrderAssignmentService } from './services/domain/order-assignment.service';
import { PackingLifecycleService } from './services/domain/packing-lifecycle.service';
import { ScanValidationService } from './services/domain/scan-validation.service';
import { PackingQueueService } from './services/domain/packing-queue.service';
import { PriorityCalculatorService } from './services/domain/priority-calculator.service';
import { RetrospectiveErrorService } from './services/domain/retrospective-error.service';
import { PackingLoggerService } from './services/domain/packing-logger.service';
import { PackingOrderCreatorService } from './services/domain/packing-order-creator.service';
import { ReassignmentService } from './services/domain/reassignment.service';
import { PackingSchedulerService } from './services/domain/packing-scheduler.service';
import { UnassignedOrderProcessorService } from './services/domain/unassigned-order-processor.service';

import { PackingService } from './services/packing.service';
import { PackerService } from './services/packer.service';

import { PackingResolver } from './packing.resolver';
import { PackerResolver } from './packer.resolver';

import { PackerAuthGuard } from './guards/packer-auth.guard';
import { PackingAssignmentProcessor } from './processors/packing-assignment.processor';
import { CommonModule } from '../common/common.module';
import { BoxSizeModule } from '../box-size/box-size.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { ProductModule } from '../product/product.module';
import { forwardRef } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { ShipmentModule } from '../shipment/shipment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Packer.name, schema: PackerSchema },
      { name: PackingOrder.name, schema: PackingOrderSchema },
      { name: ScanLog.name, schema: ScanLogSchema },
      { name: PackingEvidence.name, schema: PackingEvidenceSchema },
      { name: Address.name, schema: AddressSchema },
    ]),
    BullModule.registerQueue({
      name: 'packing-queue',
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '7d' },
    }),
    ConfigModule,
    CommonModule,
    BoxSizeModule,
    WhatsAppModule,
    ProductModule,
    forwardRef(() => OrderModule),
    forwardRef(() => ShipmentModule),
  ],
  providers: [
    PackerCrudService,
    PackingOrderCrudService,
    ScanLogCrudService,
    EvidenceCrudService,
    PackerStatsService,
    PackerAuthService,
    OrderAssignmentService,
    PackingLifecycleService,
    ScanValidationService,
    PackingQueueService,
    PriorityCalculatorService,
    RetrospectiveErrorService,
    PackingLoggerService,
    PackingOrderCreatorService,
    ReassignmentService,
    PackingSchedulerService,
    UnassignedOrderProcessorService,
    PackingService,
    PackerService,
    PackingResolver,
    PackerResolver,
    PackerAuthGuard,
    PackingAssignmentProcessor,
  ],
  exports: [PackingService, PackerService],
})
export class PackingModule { }

import { Module } from '@nestjs/common';
import { BullBoardModule as BaseBullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Module({
  imports: [
    BaseBullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BaseBullBoardModule.forFeature({
      name: 'packing-queue',
      adapter: BullMQAdapter,
    }),
    BaseBullBoardModule.forFeature({
      name: 'whatsapp-notification-queue',
      adapter: BullMQAdapter,
    }),
    BaseBullBoardModule.forFeature({
      name: 'shipment-webhook',
      adapter: BullMQAdapter,
    }),
    BaseBullBoardModule.forFeature({
      name: 'tracking-queue',
      adapter: BullMQAdapter,
    }),
  ],
})
export class BullBoardModule {}

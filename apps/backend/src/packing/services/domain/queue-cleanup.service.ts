import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { PackingLoggerService } from './packing-logger.service';

@Injectable()
export class QueueCleanupService {
    constructor(
        @InjectQueue('packing-queue') private queue: Queue,
        private packingOrderCrud: PackingOrderCrudService,
        private packingLogger: PackingLoggerService,
    ) { }

    async cleanupOrphanedJobs(): Promise<{ removed: number; checked: number }> {
        const jobs = await this.queue.getJobs([
            'waiting',
            'active',
            'delayed',
            'failed',
        ]);

        let removedCount = 0;
        const checkedCount = jobs.length;

        for (const job of jobs) {
            const orderId = job.data.orderId;

            if (!orderId) {
                await job.remove();
                removedCount++;
                continue;
            }

            const packingOrder = await this.packingOrderCrud.findOne({ orderId });

            if (!packingOrder) {
                this.packingLogger.logError(
                    'Removing orphaned job for deleted order',
                    new Error(),
                    {
                        orderId,
                        jobId: job.id,
                    },
                );

                await job.remove();
                removedCount++;
            }
        }

        this.packingLogger.logError(
            'Queue cleanup completed',
            new Error(),
            {
                checked: checkedCount,
                removed: removedCount,
            },
        );

        return { removed: removedCount, checked: checkedCount };
    }
}

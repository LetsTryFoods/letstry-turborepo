import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { TrackingLoggerService } from './tracking-logger.service';

@Injectable()
export class TrackingCronService implements OnModuleInit {
    private readonly logger = new Logger(TrackingCronService.name);

    constructor(
        @InjectQueue('tracking-queue') private readonly trackingQueue: Queue,
        private readonly configService: ConfigService,
        private readonly trackingLogger: TrackingLoggerService,
    ) { }

    async onModuleInit() {
        const pollIntervalHours = this.configService.get<number>('dtdc.tracking.pollIntervalHours') || 1;

        const repeatableJobs = await this.trackingQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            if (job.name === 'sync-all-tracking') {
                await this.trackingQueue.removeRepeatableByKey(job.key);
            }
        }

        await this.trackingQueue.add(
            'sync-all-tracking',
            {},
            {
                repeat: {
                    every: pollIntervalHours * 60 * 60 * 1000,
                },
            },
        );

        this.trackingLogger.logCronRun(pollIntervalHours);
    }

    async triggerTrackingSync(): Promise<void> {
        await this.trackingQueue.add('sync-all-tracking', {});
        this.trackingLogger.logInfo('Manual tracking sync triggered via API', { event: 'MANUAL_SYNC_TRIGGERED' });
    }
}

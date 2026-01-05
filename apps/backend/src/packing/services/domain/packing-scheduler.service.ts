import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PackingSchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue('packing-queue') private queue: Queue,
    private configService: ConfigService,
  ) { }

  async onModuleInit() {
    const packingConfig = this.configService.get('packing');
    const intervalMinutes = packingConfig.reassignmentCheckInterval;

    const repeatableJobs = await this.queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.name === 'check-reassignment') {
        await this.queue.removeRepeatableByKey(job.key);
      }
    }

    await this.queue.add(
      'check-reassignment',
      {},
      {
        repeat: {
          every: intervalMinutes * 60 * 1000,
        },
      },
    );
  }
}

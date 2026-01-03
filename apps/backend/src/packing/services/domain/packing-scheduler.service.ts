import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PackingSchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue('packing-queue') private queue: Queue,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const packingConfig = this.configService.get('packing');
    const intervalMinutes = packingConfig.reassignmentCheckInterval;

    await this.queue.add(
      'check-reassignment',
      {},
      {
        repeat: {
          pattern: `*/${intervalMinutes} * * * *`,
        },
        jobId: 'reassignment-scheduler',
      },
    );
  }
}

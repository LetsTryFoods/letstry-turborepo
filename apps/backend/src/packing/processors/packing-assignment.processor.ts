import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PackingQueueService } from '../services/domain/packing-queue.service';

@Injectable()
@Processor('packing-queue')
export class PackingAssignmentProcessor extends WorkerHost {
  private readonly logger = new Logger(PackingAssignmentProcessor.name);

  constructor(private readonly packingQueueService: PackingQueueService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'assign-order':
        return this.handleOrderAssignment(job.data);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleOrderAssignment(data: {
    orderId: string;
  }): Promise<void> {
    await this.packingQueueService.processOrderAssignment(data.orderId);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any>, err: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
  }
}

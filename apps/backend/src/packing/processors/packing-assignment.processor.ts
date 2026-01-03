import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PackingQueueService } from '../services/domain/packing-queue.service';
import { PackingLoggerService } from '../services/domain/packing-logger.service';

@Injectable()
@Processor('packing-queue')
export class PackingAssignmentProcessor extends WorkerHost {
  private readonly logger = new Logger(PackingAssignmentProcessor.name);

  constructor(
    private readonly packingQueueService: PackingQueueService,
    private readonly packingLogger: PackingLoggerService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'assign-order':
        return this.handleOrderAssignment(job);
      case 'check-reassignment':
        return this.handleReassignmentCheck();
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleOrderAssignment(job: Job): Promise<void> {
    this.packingLogger.logAssignmentStarted(
      job.data.orderId,
      job.id?.toString() || 'unknown',
    );
    await this.packingQueueService.processOrderAssignment(job.data.orderId);
  }

  private async handleReassignmentCheck(): Promise<void> {
    await this.packingQueueService.processReassignment();
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any>, err: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
    this.packingLogger.logError('Job failed', err, {
      jobId: job.id,
      jobName: job.name,
      jobData: job.data,
    });
  }
}

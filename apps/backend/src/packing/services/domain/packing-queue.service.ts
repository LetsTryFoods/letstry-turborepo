import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PriorityCalculatorService } from './priority-calculator.service';

@Injectable()
export class PackingQueueService {
  constructor(
    @InjectQueue('packing-queue') private queue: Queue,
    private readonly priorityCalculator: PriorityCalculatorService,
  ) {}

  async addToQueue(orderId: string, priority?: number): Promise<void> {
    const calculatedPriority =
      priority || (await this.priorityCalculator.calculatePriority(orderId));
    await this.queue.add(
      'assign-order',
      { orderId },
      { priority: calculatedPriority },
    );
  }

  async getNextOrder(): Promise<any> {
    const jobs = await this.queue.getJobs(['waiting'], 0, 1);
    const job = jobs[0];
    return job?.data;
  }

  async removeFromQueue(orderId: string): Promise<void> {
    const jobs = await this.queue.getJobs(['waiting', 'active']);
    const job = jobs.find((j) => j.data.orderId === orderId);
    if (job) await job.remove();
  }

  async processOrderAssignment(orderId: string): Promise<void> {
    // Implementation for processing assignment
  }
}

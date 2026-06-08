import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PackerCrudService } from '../core/packer-crud.service';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { OrderAssignmentService } from './order-assignment.service';
import { ReassignmentService } from './reassignment.service';
import { PackingLoggerService } from './packing-logger.service';
import { UnassignedOrderProcessorService } from './unassigned-order-processor.service';
import { PackingStatus } from '../../../common/enums/packing-status.enum';
import Redis from 'ioredis';

@Injectable()
export class PackingQueueService {
  private redis: Redis;

  constructor(
    @InjectQueue('packing-queue') private queue: Queue,
    @InjectConnection() private connection: Connection,
    private packerCrud: PackerCrudService,
    private packingOrderCrud: PackingOrderCrudService,
    private orderAssignment: OrderAssignmentService,
    private reassignmentService: ReassignmentService,
    private configService: ConfigService,
    private packingLogger: PackingLoggerService,
    private unassignedOrderProcessor: UnassignedOrderProcessorService,
  ) {
    const redisConfig = this.configService.get('redis');
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
    });
  }

  async addToQueue(orderId: string, priority?: number): Promise<void> {
    const calculatedPriority = priority || 1;
    await this.queue.add(
      'assign-order',
      { orderId },
      { priority: calculatedPriority },
    );

    this.packingLogger.logOrderEnqueued(orderId, calculatedPriority);
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
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const packingOrder = await this.packingOrderCrud.findOne({ orderId });

        if (!packingOrder) {
          this.packingLogger.logError(
            'Packing order not found - likely deleted',
            new Error(),
            {
              orderId,
            },
          );
          return;
        }

        if (packingOrder.assignedTo) {
          this.packingLogger.logError('Order already assigned', new Error(), {
            orderId,
            currentPackerId: packingOrder.assignedTo,
          });
          return;
        }

        const packer = await this.getNextPacker();

        if (!packer) {
          this.packingLogger.logNoActivePackers(orderId);
          throw new Error('No active packers available');
        }

        this.packingLogger.logPackerSelected(
          orderId,
          packer._id.toString(),
          'round-robin',
        );

        await this.orderAssignment.assignOrder(
          packingOrder._id.toString(),
          packer._id.toString(),
        );

        this.packingLogger.logAssignmentCompleted(
          orderId,
          packer._id.toString(),
        );
      });
    } catch (error) {
      this.packingLogger.logError('Assignment failed', error, { orderId });
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async processReassignment(): Promise<void> {
    try {
      await this.processUnassignedOrders();
      await this.processOrphanedPackerOrders();

      const staleOrders = await this.reassignmentService.findStaleOrders();

      for (const order of staleOrders) {
        await this.reassignOrder(order);
      }
    } catch (error) {
      this.packingLogger.logError('Reassignment check failed', error, {});
    }
  }

  /**
   * Finds orders assigned to packers that no longer exist (deleted).
   * Resets them to PENDING so they can be re-queued and reassigned.
   */
  private async processOrphanedPackerOrders(): Promise<void> {
    try {
      const activePackers = await this.packerCrud.findAll({ isActive: true });
      const activePackerIds = new Set(
        activePackers.map((p: any) => p._id.toString()),
      );

      const assignedOrders = await this.packingOrderCrud.findAll({
        assignedTo: { $exists: true, $ne: null },
        status: { $in: ['assigned', 'pending'] },
      });

      let orphanCount = 0;
      for (const order of assignedOrders) {
        const packerId = order.assignedTo?.toString();
        if (packerId && !activePackerIds.has(packerId)) {
          // Packer was deleted — use $unset to properly clear assignedTo in MongoDB
          await this.packingOrderCrud.resetForReassignment(
            order._id.toString(),
            PackingStatus.PENDING,
          );

          const alreadyInQueue = await this.isOrderInQueue(order.orderId);
          if (!alreadyInQueue) {
            await this.addToQueue(order.orderId);
          }

          orphanCount++;
          this.packingLogger.logError(
            `Orphaned order reset: packer ${packerId} no longer exists`,
            new Error(),
            { orderId: order.orderId, packingOrderId: order._id.toString() },
          );
        }
      }

      if (orphanCount > 0) {
        this.packingLogger.logError(
          `Reset ${orphanCount} orphaned orders to pending`,
          new Error(),
          {},
        );
      }
    } catch (error) {
      this.packingLogger.logError(
        'Failed to process orphaned packer orders',
        error,
        {},
      );
    }
  }

  async isOrderInQueue(orderId: string): Promise<boolean> {
    const jobs = await this.queue.getJobs(['waiting', 'active', 'delayed']);
    return jobs.some((job) => job.data.orderId === orderId);
  }

  private async processUnassignedOrders(): Promise<void> {
    await this.unassignedOrderProcessor.processUnassignedOrders(
      this.isOrderInQueue.bind(this),
      this.addToQueue.bind(this),
    );
  }

  private async reassignOrder(order: any): Promise<void> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const oldPackerId = order.assignedTo;
        const reason = this.reassignmentService.getReassignmentReason(order);

        if (order.status === 'packing') {
          await this.reassignmentService.resetPackingOrder(
            order._id.toString(),
          );
        }

        const packer = await this.getNextPacker();

        if (!packer) {
          this.packingLogger.logNoActivePackers(order.orderId);
          return;
        }

        await this.orderAssignment.assignOrder(
          order._id.toString(),
          packer._id.toString(),
        );

        this.packingLogger.logReassignment(
          order._id.toString(),
          oldPackerId,
          packer._id.toString(),
          reason,
        );
      });
    } catch (error) {
      this.packingLogger.logError('Reassignment failed', error, {
        packingOrderId: order._id.toString(),
      });
    } finally {
      await session.endSession();
    }
  }

  private async getNextPacker(): Promise<any> {
    const activePackers = await this.packerCrud.findAll({ isActive: true });

    if (activePackers.length === 0) {
      return null;
    }

    const currentIndex = await this.getCurrentPackerIndex();
    const nextIndex = (currentIndex + 1) % activePackers.length;

    await this.setCurrentPackerIndex(nextIndex);

    this.packingLogger.logRoundRobinState(nextIndex, activePackers.length);

    return activePackers[nextIndex];
  }

  private async getCurrentPackerIndex(): Promise<number> {
    const index = await this.redis.get('packing:last-assigned-packer-index');
    return index ? parseInt(index, 10) : -1;
  }

  private async setCurrentPackerIndex(index: number): Promise<void> {
    await this.redis.set('packing:last-assigned-packer-index', index);
  }
}

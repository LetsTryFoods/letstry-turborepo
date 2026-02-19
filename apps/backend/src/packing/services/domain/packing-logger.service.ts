import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class PackingLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logConfig = this.configService.get('logger');

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          filename: path.resolve(logConfig.packingFile),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  logInfo(message: string, context?: any) {
    this.logger.info(message, { ...context });
  }

  logOrderCreated(orderId: string, packingOrderId: string) {
    this.logger.info('Packing order created', {
      event: 'PACKING_ORDER_CREATED',
      orderId,
      packingOrderId,
    });
  }

  logOrderEnqueued(orderId: string, priority: number) {
    this.logger.info('Order enqueued for assignment', {
      event: 'ORDER_ENQUEUED',
      orderId,
      priority,
    });
  }

  logAssignmentStarted(orderId: string, jobId: string) {
    this.logger.info('Assignment process started', {
      event: 'ASSIGNMENT_STARTED',
      orderId,
      jobId,
    });
  }

  logPackerSelected(orderId: string, packerId: string, method: string) {
    this.logger.info('Packer selected for assignment', {
      event: 'PACKER_SELECTED',
      orderId,
      packerId,
      method,
    });
  }

  logAssignmentCompleted(orderId: string, packerId: string) {
    this.logger.info('Order assigned to packer', {
      event: 'ASSIGNMENT_COMPLETED',
      orderId,
      packerId,
    });
  }

  logPackingStarted(packingOrderId: string, packerId: string) {
    this.logger.info('Packing started', {
      event: 'PACKING_STARTED',
      packingOrderId,
      packerId,
    });
  }

  logPackingCompleted(packingOrderId: string, packerId: string, duration: number) {
    this.logger.info('Packing completed', {
      event: 'PACKING_COMPLETED',
      packingOrderId,
      packerId,
      durationMinutes: duration,
    });
  }

  logReassignmentCheck(staleCount: number) {
    this.logger.info('Reassignment check executed', {
      event: 'REASSIGNMENT_CHECK',
      staleOrdersFound: staleCount,
    });
  }

  logReassignment(packingOrderId: string, oldPackerId: string, newPackerId: string, reason: string) {
    this.logger.info('Order reassigned', {
      event: 'ORDER_REASSIGNED',
      packingOrderId,
      oldPackerId,
      newPackerId,
      reason,
    });
  }

  logNoActivePackers(orderId: string) {
    this.logger.warn('No active packers available', {
      event: 'NO_ACTIVE_PACKERS',
      orderId,
    });
  }

  logScanError(packingOrderId: string, ean: string, errorType: string) {
    this.logger.warn('Scan error detected', {
      event: 'SCAN_ERROR',
      packingOrderId,
      ean,
      errorType,
    });
  }

  logEvidenceUploaded(packingOrderId: string, imageCount: number) {
    this.logger.info('Packing evidence uploaded', {
      event: 'EVIDENCE_UPLOADED',
      packingOrderId,
      imageCount,
    });
  }

  logRoundRobinState(currentIndex: number, totalPackers: number) {
    this.logger.debug('Round-robin state', {
      event: 'ROUND_ROBIN_STATE',
      currentIndex,
      totalPackers,
    });
  }

  logUnassignedOrdersCheck(count: number) {
    this.logger.info('Processing unassigned orders', {
      event: 'UNASSIGNED_ORDERS_CHECK',
      count,
    });
  }

  logError(message: string, error: any, context: any) {
    this.logger.error(message, {
      event: 'PACKING_ERROR',
      error: error.message,
      stack: error.stack,
      ...context,
    });
  }
}

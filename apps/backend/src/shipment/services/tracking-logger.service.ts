import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class TrackingLoggerService {
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
                    filename: path.resolve(logConfig.trackingFile),
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json(),
                    ),
                }),
            ],
        });
    }

    logCronRun(intervalHours: number) {
        this.logger.info(`Scheduled tracking sync to run every ${intervalHours} hour(s)`, {
            event: 'CRON_SCHEDULED',
            intervalHours,
        });
    }

    logSyncStarted(activeShipmentsCount: number) {
        this.logger.info(`Starting sync for all active shipments... Found ${activeShipmentsCount} active shipments for tracking sync.`, {
            event: 'SYNC_ALL_STARTED',
            activeShipmentsCount,
        });
    }

    logJobEnqueued(awbNumber: string, shipmentId: string) {
        this.logger.info('Tracking sync job enqueued for shipment', {
            event: 'SYNC_JOB_ENQUEUED',
            awbNumber,
            shipmentId,
        });
    }

    logSyncShipment(awbNumber: string, shipmentId: string) {
        this.logger.info(`Processing tracking sync for shipment`, {
            event: 'SYNC_SHIPMENT_STARTED',
            awbNumber,
            shipmentId,
        });
    }

    logNoValidTrackingDetails(awbNumber: string) {
        this.logger.warn(`No valid tracking details found for AWB`, {
            event: 'NO_TRACKING_DETAILS',
            awbNumber,
        });
    }

    logShipmentSyncSuccess(awbNumber: string, shipmentId: string, newEventsCount: number) {
        this.logger.info(`Successfully synced tracking for shipment. Inserted ${newEventsCount} new events.`, {
            event: 'SYNC_SHIPMENT_SUCCESS',
            awbNumber,
            shipmentId,
            newEventsCount,
        });
    }

    logError(message: string, error: any, context?: Record<string, any>) {
        this.logger.error(message, {
            event: 'TRACKING_ERROR',
            error: error.message || error,
            stack: error.stack,
            ...context,
        });
    }

    logInfo(message: string, context?: Record<string, any>) {
        this.logger.info(message, context);
    }
}

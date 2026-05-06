import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { ShipmentService } from '../services/shipment.service';
import { TrackingService } from '../services/tracking.service';
import { DtdcApiService } from '../services/dtdc-api.service';
import { ShipmentStatusMapperService } from '../services/shipment-status-mapper.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrackingLoggerService } from '../services/tracking-logger.service';
import { ShiprocketApiService } from '../providers/shiprocket/shiprocket-api.service';
import { SHIPROCKET_STATUS_MAP } from '../constants/shiprocket-status-codes';
import { ShipmentLoggerService } from '../services/shipment-logger.service';

@Processor('tracking-queue')
export class TrackingProcessor extends WorkerHost {
    private readonly logger = new Logger(TrackingProcessor.name);
    constructor(
        @InjectQueue('tracking-queue') private readonly trackingQueue: Queue,
        private readonly shipmentService: ShipmentService,
        private readonly trackingService: TrackingService,
        private readonly dtdcApiService: DtdcApiService,
        private readonly statusMapper: ShipmentStatusMapperService,
        private readonly eventEmitter: EventEmitter2,
        private readonly trackingLogger: TrackingLoggerService,
        private readonly shiprocketApiService: ShiprocketApiService,
        private readonly shipmentLogger: ShipmentLoggerService,
    ) {
        super();
    }

    async process(job: Job<any>): Promise<void> {
        if (job.name === 'sync-all-tracking') {
            await this.handleSyncAllTracking();
        } else if (job.name === 'sync-shipment') {
            await this.handleSyncShipment(job.data.awbNumber, job.data.shipmentId);
        } else if (job.name === 'shiprocket-webhook-update') {
            const { awb, statusId, scans, receivedAt } = job.data;
            const internalStatus = SHIPROCKET_STATUS_MAP[statusId] || 'ITM';
            const latestScan = scans?.[0] || scans?.[scans.length - 1]; // SR sends 0 as latest usually
            const location = latestScan?.location || '';
            const description = latestScan?.['sr-status-label'] || '';
            
            try {
                // Only update DB status directly for webhooks as it sets webhookLastReceivedAt
                await this.shipmentService.updateStatus(awb, internalStatus, description, location);
                this.shipmentLogger.logShiprocketWebhookResult(awb, true, internalStatus);
            } catch (error) {
                this.shipmentLogger.logShiprocketWebhookResult(awb, false, internalStatus, error.message);
                throw error;
            }
        }
    }

    private async handleSyncAllTracking(): Promise<void> {
        // DTDC tracking (existing)
        const activeShipments = await this.shipmentService.findActiveShipmentsForTracking('DTDC');
        this.trackingLogger.logSyncStarted(activeShipments.length);

        for (const shipment of activeShipments) {
            if (!shipment.dtdcAwbNumber) continue;
            await this.trackingQueue.add('sync-shipment', {
                awbNumber: shipment.dtdcAwbNumber,
                shipmentId: shipment._id.toString(),
            });
            this.trackingLogger.logJobEnqueued(shipment.dtdcAwbNumber, shipment._id.toString());
        }

        // Shiprocket bulk tracking
        const srShipments = await this.shipmentService.findActiveShipmentsForTracking('SHIPROCKET');
        const srAwbs = srShipments
          .filter(s => s.dtdcAwbNumber && !s.isDelivered)
          .map(s => s.dtdcAwbNumber);

        for (let i = 0; i < srAwbs.length; i += 50) {
            const batch = srAwbs.slice(i, i + 50);
            if (batch.length === 0) continue;
            try {
                const results = await this.shiprocketApiService.trackBulkAwbs(batch);
                for (const [awb, data] of Object.entries(results)) {
                    const statusId = data?.tracking_data?.shipment_status;
                    if (statusId) {
                        const internalStatus = SHIPROCKET_STATUS_MAP[statusId] || 'ITM';
                        const activities = data?.tracking_data?.shipment_track_activities || [];
                        const latest = activities.length > 0 ? activities[0] : null;
                        await this.shipmentService.updateStatus(
                            awb,
                            internalStatus,
                            latest?.['sr-status-label'] || '',
                            latest?.location || ''
                        );
                    }
                }
            } catch (err) {
                this.logger.error('Shiprocket bulk tracking batch failed: ' + err.message);
            }
        }
    }

    private async handleSyncShipment(awbNumber: string, shipmentId: string): Promise<void> {
        try {
            this.trackingLogger.logSyncShipment(awbNumber, shipmentId);

            const trackResponse = await this.dtdcApiService.trackShipment(awbNumber);

            this.trackingLogger.logDtdcApiResponse(awbNumber, trackResponse);

            if (!trackResponse || !trackResponse.statusFlag || !trackResponse.trackDetails) {
                this.trackingLogger.logNoValidTrackingDetails(awbNumber);
                return;
            }

            const newEvents = await this.trackingService.syncTrackingData(shipmentId, trackResponse.trackDetails);

            if (newEvents && newEvents.length > 0) {
                const latestEvent = newEvents[newEvents.length - 1];

                const statusDescription = this.statusMapper.getStatusDescription(latestEvent.statusCode);

                await this.shipmentService.updateStatus(
                    awbNumber,
                    latestEvent.statusCode,
                    statusDescription,
                    latestEvent.location,
                );

                this.eventEmitter.emit('shipment.status.updated', {
                    shipmentId: shipmentId,
                    trackingEvents: newEvents,
                });

                this.trackingLogger.logShipmentSyncSuccess(awbNumber, shipmentId, newEvents.length);
            }
        } catch (error) {
            this.trackingLogger.logError(`Failed to sync tracking for shipment ${awbNumber}`, error);
            throw error;
        }
    }
}

import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { ShipmentService } from '../services/shipment.service';
import { TrackingService } from '../services/tracking.service';
import { DtdcApiService } from '../services/dtdc-api.service';
import { ShipmentStatusMapperService } from '../services/shipment-status-mapper.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrackingLoggerService } from '../services/tracking-logger.service';

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
    ) {
        super();
    }

    async process(job: Job<any>): Promise<void> {
        if (job.name === 'sync-all-tracking') {
            await this.handleSyncAllTracking();
        } else if (job.name === 'sync-shipment') {
            await this.handleSyncShipment(job.data.awbNumber, job.data.shipmentId);
        }
    }

    private async handleSyncAllTracking(): Promise<void> {
        // We want shipments that are NOT delivered, RTO, or cancelled
        const activeShipments = await this.shipmentService.findActiveShipmentsForTracking();

        this.trackingLogger.logSyncStarted(activeShipments.length);

        // Enqueue a job for each shipment so we process them individually without timeouts
        for (const shipment of activeShipments) {
            if (!shipment.dtdcAwbNumber) continue;

            await this.trackingQueue.add('sync-shipment', {
                awbNumber: shipment.dtdcAwbNumber,
                shipmentId: shipment._id.toString(),
            });

            this.trackingLogger.logJobEnqueued(shipment.dtdcAwbNumber, shipment._id.toString());
        }
    }

    private async handleSyncShipment(awbNumber: string, shipmentId: string): Promise<void> {
        try {
            this.trackingLogger.logSyncShipment(awbNumber, shipmentId);

            const trackResponse = await this.dtdcApiService.trackShipment(awbNumber);

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

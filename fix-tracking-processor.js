const fs = require('fs');

const filePath = '/Users/apple/letstry-turborepo/apps/backend/src/shipment/processors/tracking.processor.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const regexProcess = /async process\(job: Job<any>\): Promise<void> {([\s\S]*?)        } else if \(job\.name === 'sync-shipment'\) {\n            await this\.handleSyncShipment\(job\.data\.awbNumber, job\.data\.shipmentId\);\n        }\n    }/;

const newProcessImplementation = `async process(job: Job<any>): Promise<void> {
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
            // Only update DB status directly for webhooks as it sets webhookLastReceivedAt
            await this.shipmentService.updateStatus(awb, internalStatus, description, location);
        }
    }`;

code = code.replace(regexProcess, newProcessImplementation);

const regexSyncAll = /private async handleSyncAllTracking\(\): Promise<void> {\n        \/\/ We want shipments that are NOT delivered, RTO, or cancelled\n        const activeShipments = await this\.shipmentService\.findActiveShipmentsForTracking\(\);\n\n        this\.trackingLogger\.logSyncStarted\(activeShipments\.length\);\n\n        \/\/ Enqueue a job for each shipment so we process them individually without timeouts\n        for \(const shipment of activeShipments\) {\n            if \(!shipment\.dtdcAwbNumber\) continue;\n\n            await this\.trackingQueue\.add\('sync-shipment', {\n                awbNumber: shipment\.dtdcAwbNumber,\n                shipmentId: shipment\._id\.toString\(\),\n            }\);\n\n            this\.trackingLogger\.logJobEnqueued\(shipment\.dtdcAwbNumber, shipment\._id\.toString\(\)\);\n        }\n    }/;

const newSyncAllImplementation = `private async handleSyncAllTracking(): Promise<void> {
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
    }`;

code = code.replace(regexSyncAll, newSyncAllImplementation);

fs.writeFileSync(filePath, code, 'utf-8');
console.log('tracking processor modified successfully');

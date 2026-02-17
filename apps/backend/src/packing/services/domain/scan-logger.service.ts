import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class ScanLoggerService {
    private logger: winston.Logger;

    constructor(private configService: ConfigService) {
        const logConfig = this.configService.get('logger');

        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.File({
                    filename: path.resolve(logConfig.scanFile),
                }),
            ],
        });
    }

    logScanRequest(mutation: string, payload: { packingOrderId: string; ean: string; packerId: string }) {
        this.logger.info('Scan request received', {
            event: 'SCAN_REQUEST',
            mutation,
            ...payload,
        });
    }

    logScanValidation(packingOrderId: string, ean: string, validation: { isValid: boolean; errorType?: string; item?: any }) {
        this.logger.info('Scan validation result', {
            event: 'SCAN_VALIDATION',
            packingOrderId,
            ean,
            isValid: validation.isValid,
            errorType: validation.errorType || null,
            matchedProductId: validation.item?.productId || null,
            matchedSku: validation.item?.sku || null,
            expectedQuantity: validation.item?.quantity || null,
            itemName: validation.item?.name || null,
        });
    }

    logScanResponse(mutation: string, packingOrderId: string, response: any) {
        this.logger.info('Scan response sent', {
            event: 'SCAN_RESPONSE',
            mutation,
            packingOrderId,
            isValid: response.isValid,
            ean: response.ean,
            errorType: response.errorType || null,
            itemName: response.itemName || null,
        });
    }

    logBatchScanRequest(payload: { packingOrderId: string; items: { productId: string; eans: string[] }[]; packerId: string }) {
        this.logger.info('Batch scan request received', {
            event: 'BATCH_SCAN_REQUEST',
            mutation: 'batchScanItems',
            packingOrderId: payload.packingOrderId,
            packerId: payload.packerId,
            itemCount: payload.items.length,
            products: payload.items.map((i) => ({ productId: i.productId, scanCount: i.eans.length })),
        });
    }

    logBatchScanResponse(packingOrderId: string, response: any) {
        this.logger.info('Batch scan response sent', {
            event: 'BATCH_SCAN_RESPONSE',
            mutation: 'batchScanItems',
            packingOrderId,
            success: response.success,
            totalProcessed: response.totalProcessed,
            successCount: response.successCount,
            failureCount: response.failureCount,
            totalScans: response.totalScans,
        });
    }

    logValidationStep(step: string, data: Record<string, any>) {
        this.logger.info('Validation step', {
            event: 'SCAN_VALIDATION_STEP',
            step,
            ...data,
        });
    }

    logEvidenceRequest(payload: { packingOrderId: string; imageCount: number; boxCode: string }) {
        this.logger.info('Evidence upload request received', {
            event: 'EVIDENCE_REQUEST',
            mutation: 'uploadEvidence',
            ...payload,
        });
    }

    logEvidenceResponse(packingOrderId: string, evidenceId: string) {
        this.logger.info('Evidence upload response sent', {
            event: 'EVIDENCE_RESPONSE',
            mutation: 'uploadEvidence',
            packingOrderId,
            evidenceId,
        });
    }

    logCompletePackingRequest(packingOrderId: string) {
        this.logger.info('Complete packing request received', {
            event: 'COMPLETE_PACKING_REQUEST',
            mutation: 'completePacking',
            packingOrderId,
        });
    }

    logCompletePackingStep(step: string, data: Record<string, any>) {
        this.logger.info('Complete packing step', {
            event: 'COMPLETE_PACKING_STEP',
            step,
            ...data,
        });
    }

    logCompletePackingResponse(packingOrderId: string, data: Record<string, any>) {
        this.logger.info('Complete packing response sent', {
            event: 'COMPLETE_PACKING_RESPONSE',
            mutation: 'completePacking',
            packingOrderId,
            ...data,
        });
    }

    logScanError(mutation: string, packingOrderId: string, error: any) {
        this.logger.error('Scan error occurred', {
            event: 'SCAN_ERROR',
            mutation,
            packingOrderId,
            error: error.message,
            stack: error.stack,
        });
    }
}

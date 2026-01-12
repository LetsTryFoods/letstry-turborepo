import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class ShipmentLoggerService {
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
          filename: path.resolve(logConfig.shipmentFile),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  logShipmentBooked(awbNumber: string, orderId: string, shipmentId: string) {
    this.logger.info('Shipment booked successfully', {
      event: 'SHIPMENT_BOOKED',
      awbNumber,
      orderId,
      shipmentId,
    });
  }

  logShipmentBookingFailed(orderId: string, error: string) {
    this.logger.error('Shipment booking failed', {
      event: 'SHIPMENT_BOOKING_FAILED',
      orderId,
      error,
    });
  }

  logLabelFetched(awbNumber: string, shipmentId: string) {
    this.logger.info('Shipping label fetched', {
      event: 'LABEL_FETCHED',
      awbNumber,
      shipmentId,
    });
  }

  logLabelFetchFailed(awbNumber: string, error: string) {
    this.logger.error('Failed to fetch shipping label', {
      event: 'LABEL_FETCH_FAILED',
      awbNumber,
      error,
    });
  }

  logShipmentCancelled(awbNumber: string, shipmentId: string) {
    this.logger.info('Shipment cancelled', {
      event: 'SHIPMENT_CANCELLED',
      awbNumber,
      shipmentId,
    });
  }

  logShipmentStatusUpdated(awbNumber: string, statusCode: string, statusDescription: string) {
    this.logger.info('Shipment status updated', {
      event: 'STATUS_UPDATED',
      awbNumber,
      statusCode,
      statusDescription,
    });
  }

  logWebhookReceived(awbNumber: string, statusCode: string) {
    this.logger.info('Webhook received', {
      event: 'WEBHOOK_RECEIVED',
      awbNumber,
      statusCode,
    });
  }

  logWebhookQueued(awbNumber: string, jobId?: string) {
    this.logger.info('Webhook queued for processing', {
      event: 'WEBHOOK_QUEUED',
      awbNumber,
      jobId,
    });
  }

  logWebhookProcessed(awbNumber: string, duration: number) {
    this.logger.info('Webhook processed successfully', {
      event: 'WEBHOOK_PROCESSED',
      awbNumber,
      durationMs: duration,
    });
  }

  logWebhookFailed(awbNumber: string, error: string, duration: number) {
    this.logger.error('Webhook processing failed', {
      event: 'WEBHOOK_FAILED',
      awbNumber,
      error,
      durationMs: duration,
    });
  }

  logApiCall(endpoint: string, method: string, statusCode: number, duration: number) {
    this.logger.info('DTDC API call', {
      event: 'API_CALL',
      endpoint,
      method,
      statusCode,
      durationMs: duration,
    });
  }

  logApiError(endpoint: string, method: string, error: string, duration: number) {
    this.logger.error('DTDC API call failed', {
      event: 'API_ERROR',
      endpoint,
      method,
      error,
      durationMs: duration,
    });
  }

  logPincodeCheck(origin: string, destination: string, serviceable: boolean) {
    this.logger.info('Pincode serviceability checked', {
      event: 'PINCODE_CHECK',
      origin,
      destination,
      serviceable,
    });
  }

  logTrackingDisabled(awbNumber: string, reason: string) {
    this.logger.warn('Tracking disabled', {
      event: 'TRACKING_DISABLED',
      awbNumber,
      reason,
    });
  }

  logError(message: string, error: any, context?: Record<string, any>) {
    this.logger.error(message, {
      error: error.message || error,
      stack: error.stack,
      ...context,
    });
  }
}

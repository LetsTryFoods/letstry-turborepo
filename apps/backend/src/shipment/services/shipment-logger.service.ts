import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class ShipmentLoggerService {
  private generalLogger: winston.Logger;
  private dtdcLogger: winston.Logger;
  private shiprocketLogger: winston.Logger;
  private shiprocketWebhookLogger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logConfig = this.configService.get('logger');
    
    const createWinstonLogger = (filename: string) => winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          filename: path.resolve(filename),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });

    this.generalLogger = createWinstonLogger(logConfig.shipmentFile || 'logs/shipment.log');
    this.dtdcLogger = createWinstonLogger(logConfig.dtdcFile || 'logs/dtdc.log');
    this.shiprocketLogger = createWinstonLogger(logConfig.shiprocketFile || 'logs/shiprocket.log');
    this.shiprocketWebhookLogger = createWinstonLogger('logs/shiprocket-webhook-concilation.log');
  }

  private getLogger(provider?: string): winston.Logger {
    if (!provider) return this.generalLogger;
    const p = provider.toUpperCase();
    if (p === 'SHIPROCKET') return this.shiprocketLogger;
    if (p === 'DTDC') return this.dtdcLogger;
    return this.generalLogger;
  }

  logShipmentBooked(awbNumber: string, orderId: string, shipmentId: string, provider?: string) {
    this.getLogger(provider).info('Shipment booked successfully', {
      event: 'SHIPMENT_BOOKED',
      awbNumber,
      orderId,
      shipmentId,
    });
  }

  logShipmentBookingFailed(orderId: string, error: string, provider?: string) {
    this.getLogger(provider).error('Shipment booking failed', {
      event: 'SHIPMENT_BOOKING_FAILED',
      orderId,
      error,
    });
  }

  logLabelFetched(awbNumber: string, shipmentId: string, provider?: string) {
    this.getLogger(provider).info('Shipping label fetched', {
      event: 'LABEL_FETCHED',
      awbNumber,
      shipmentId,
    });
  }

  logLabelFetchFailed(awbNumber: string, error: string, provider?: string) {
    this.getLogger(provider).error('Failed to fetch shipping label', {
      event: 'LABEL_FETCH_FAILED',
      awbNumber,
      error,
    });
  }

  logShipmentCancelled(awbNumber: string, shipmentId: string, provider?: string) {
    this.getLogger(provider).info('Shipment cancelled', {
      event: 'SHIPMENT_CANCELLED',
      awbNumber,
      shipmentId,
    });
  }

  logShipmentStatusUpdated(awbNumber: string, statusCode: string, statusDescription: string, provider?: string) {
    this.getLogger(provider).info('Shipment status updated', {
      event: 'STATUS_UPDATED',
      awbNumber,
      statusCode,
      statusDescription,
    });
  }

  logWebhookReceived(awbNumber: string, statusCode: string, provider?: string) {
    this.getLogger(provider).info('Webhook received', {
      event: 'WEBHOOK_RECEIVED',
      awbNumber,
      statusCode,
    });
    
    if (provider?.toUpperCase() === 'SHIPROCKET') {
      this.shiprocketWebhookLogger.info('Shiprocket webhook raw payload', {
        event: 'WEBHOOK_RAW',
        awbNumber,
        statusCode,
      });
    }
  }

  logShiprocketWebhookRaw(payload: any) {
    this.shiprocketWebhookLogger.info('Received Shiprocket Webhook', {
      event: 'RAW_PAYLOAD',
      payload,
      receivedAt: new Date().toISOString()
    });
  }

  logShiprocketWebhookResult(awbNumber: string, success: boolean, internalStatus: string, error?: string) {
    this.shiprocketWebhookLogger.info('Processed Shiprocket Webhook', {
      event: 'PROCESS_RESULT',
      awbNumber,
      success,
      internalStatus,
      error,
      processedAt: new Date().toISOString()
    });
  }

  logWebhookQueued(awbNumber: string, jobId?: string, provider?: string) {
    this.getLogger(provider).info('Webhook queued for processing', {
      event: 'WEBHOOK_QUEUED',
      awbNumber,
      jobId,
    });
  }

  logWebhookProcessed(awbNumber: string, duration: number, provider?: string) {
    this.getLogger(provider).info('Webhook processed successfully', {
      event: 'WEBHOOK_PROCESSED',
      awbNumber,
      durationMs: duration,
    });
  }

  logWebhookFailed(awbNumber: string, error: string, duration: number, provider?: string) {
    this.getLogger(provider).error('Webhook processing failed', {
      event: 'WEBHOOK_FAILED',
      awbNumber,
      error,
      durationMs: duration,
    });
  }

  logApiCall(endpoint: string, method: string, statusCode: number, duration: number, provider?: string, response?: any) {
    this.getLogger(provider).info(`${provider || 'API'} call`, {
      event: 'API_CALL',
      endpoint,
      method,
      statusCode,
      durationMs: duration,
      response: response,
    });
  }

  logApiError(endpoint: string, method: string, error: string, duration: number, provider?: string, response?: any) {
    this.getLogger(provider).error(`${provider || 'API'} call failed`, {
      event: 'API_ERROR',
      endpoint,
      method,
      error,
      durationMs: duration,
      response: response,
    });
  }

  logPincodeCheck(origin: string, destination: string, serviceable: boolean, provider?: string) {
    this.getLogger(provider).info('Pincode serviceability checked', {
      event: 'PINCODE_CHECK',
      origin,
      destination,
      serviceable,
    });
  }

  logTrackingDisabled(awbNumber: string, reason: string, provider?: string) {
    this.getLogger(provider).warn('Tracking disabled', {
      event: 'TRACKING_DISABLED',
      awbNumber,
      reason,
    });
  }

  logError(message: string, error: any, context?: Record<string, any>, provider?: string) {
    this.getLogger(provider).error(message, {
      error: error.message || error,
      stack: error.stack,
      ...context,
    });
  }

  logInfo(message: string, context?: Record<string, any>, provider?: string) {
    this.getLogger(provider).info(message, context);
  }
}

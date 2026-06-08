import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShiprocketAuthService } from './shiprocket-auth.service';
import axios, { AxiosInstance } from 'axios';
import { ShipmentLoggerService } from '../../services/shipment-logger.service';

@Injectable()
export class ShiprocketApiService {
  private readonly logger = new Logger(ShiprocketApiService.name);
  private axiosInstance: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: ShiprocketAuthService,
    private readonly shipmentLogger: ShipmentLoggerService,
  ) {
    this.axiosInstance = axios.create({
      baseURL: this.configService.get<string>('shiprocket.apiUrl'),
    });
  }

  private async request(
    method: string,
    endpoint: string,
    data?: any,
    isRetry = false,
  ): Promise<any> {
    const startTime = Date.now();
    try {
      const token = await this.authService.getToken();
      const response = await this.axiosInstance({
        method,
        url: endpoint,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      const requestStr = data ? JSON.stringify(data) : 'N/A';
      const logMessage = `Shiprocket API call | URL: ${endpoint} | Request: ${requestStr} | Response: ${JSON.stringify(response.data)}`;
      this.shipmentLogger.logApiCall(
        logMessage,
        method,
        response.status,
        duration,
        'SHIPROCKET',
      );

      return response.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      if (error.response?.status === 401 && !isRetry) {
        this.logger.warn(
          'Shiprocket API 401 Unauthorized. Clearing token and retrying...',
        );
        await this.authService.clearToken();
        return this.request(method, endpoint, data, true);
      }

      const errMessage = error.response?.data?.message || error.message;
      const requestStr = data ? JSON.stringify(data) : 'N/A';
      const logMessage = `Shiprocket API call | URL: ${endpoint} | Request: ${requestStr} | Response: ${JSON.stringify(error.response?.data)}`;

      this.shipmentLogger.logApiError(
        logMessage,
        method,
        errMessage,
        duration,
        'SHIPROCKET',
      );
      this.logger.error(
        `Shiprocket API error on ${method} ${endpoint}: ${errMessage}`,
        error.response?.data,
      );

      throw new HttpException(
        errMessage,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createForwardShipment(payload: any): Promise<any> {
    this.logger.log(`Creating forward shipment for order ${payload.order_id}`);
    this.shipmentLogger.logInfo(
      `Creating forward shipment for order ${payload.order_id}`,
      undefined,
      'SHIPROCKET',
    );
    return this.request('POST', '/shipments/create/forward-shipment', payload);
  }

  async trackByAwb(awbNumber: string): Promise<any> {
    this.logger.log(`Tracking AWB: ${awbNumber}`);
    this.shipmentLogger.logInfo(
      `Tracking AWB: ${awbNumber}`,
      undefined,
      'SHIPROCKET',
    );
    return this.request('GET', `/courier/track/awb/${awbNumber}`);
  }

  async trackBulkAwbs(awbs: string[]): Promise<Record<string, any>> {
    if (!awbs || awbs.length === 0) return {};
    this.logger.log(`Bulk tracking AWBs: ${awbs.length} passed.`);
    this.shipmentLogger.logInfo(
      `Bulk tracking AWBs: ${awbs.length} passed.`,
      undefined,
      'SHIPROCKET',
    );
    return this.request('POST', '/courier/track/awbs', { awbs });
  }

  async cancelOrder(srOrderId: string): Promise<boolean> {
    this.logger.log(`Cancelling order: ${srOrderId}`);
    this.shipmentLogger.logInfo(
      `Cancelling order: ${srOrderId}`,
      undefined,
      'SHIPROCKET',
    );
    await this.request('POST', '/orders/cancel', { ids: [Number(srOrderId)] });
    return true; // SR returns 204 on success or explicit success json
  }

  async getPickupLocations(): Promise<any[]> {
    const response = await this.request('GET', '/settings/company/pickup');
    // Note: getPickupLocations uses request which logs the raw response, but we might also log the action
    this.shipmentLogger.logInfo(
      `Fetched pickup locations from Shiprocket`,
      undefined,
      'SHIPROCKET',
    );
    return response.data?.shipping_address || [];
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { DtdcApiLog } from '../entities/dtdc-api-log.entity';
import {
  DtdcBookingPayload,
  DtdcBookingResponse,
  DtdcCancelPayload,
  DtdcTrackingResponse,
} from '../interfaces/dtdc-payload.interface';
import { ShipmentLoggerService } from './shipment-logger.service';

@Injectable()
export class DtdcApiService {
  private readonly logger = new Logger(DtdcApiService.name);
  private readonly axiosInstance: AxiosInstance;
  private trackingTokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    @InjectModel(DtdcApiLog.name)
    private readonly apiLogModel: Model<DtdcApiLog>,
    private readonly configService: ConfigService,
    private readonly shipmentLogger: ShipmentLoggerService,
  ) {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getEnv(): string {
    return this.configService.get<string>('dtdc.environment') || 'staging';
  }

  private getApiKey(): string {
    return this.configService.get<string>('dtdc.apiKey') || '';
  }

  private getBaseUrl(): string {
    const env = this.getEnv();
    const baseUrls = this.configService.get<Record<string, string>>('dtdc.baseUrls') || {};
    return baseUrls[env] || baseUrls['staging'];
  }

  private getFullUrl(endpointKey: string): string {
    const endpoint = this.getEndpoint(endpointKey);
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return this.getBaseUrl() + endpoint;
  }

  private getEndpoint(endpoint: string): string {
    const endpoints = this.configService.get<Record<string, string>>('dtdc.endpoints') || {};
    return endpoints[endpoint] || '';
  }

  async bookShipment(payload: DtdcBookingPayload): Promise<DtdcBookingResponse> {
    const url = this.getFullUrl('bookingApi');
    const startTime = Date.now();

    try {
      const response = await this.axiosInstance.post<DtdcBookingResponse>(url, payload, {
        headers: {
          'api-key': this.getApiKey(),
        },
      });

      await this.logApiCall({
        apiType: 'BOOKING',
        request: payload,
        response: response.data,
        statusCode: response.status,
        duration: Date.now() - startTime,
        success: true,
        url,
      });

      return response.data;
    } catch (error: any) {
      await this.logApiCall({
        apiType: 'BOOKING',
        request: payload,
        response: error.response?.data,
        statusCode: error.response?.status,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        url,
      });

      throw error;
    }
  }

  async getLabel(awbNumber: string, shipmentId: string): Promise<string> {
    const url = `${this.getFullUrl('labelApi')}?reference_number=${awbNumber}&label_code=SHIP_LABEL_4X6&label_format=pdf`;
    const startTime = Date.now();

    try {
      const response = await this.axiosInstance.get(url, {
        headers: {
          'api-key': this.getApiKey(),
        },
        responseType: 'arraybuffer',
      });

      const base64Label = Buffer.from(response.data, 'binary').toString('base64');
      const labelUrl = `data:application/pdf;base64,${base64Label}`;

      await this.logApiCall({
        apiType: 'LABEL',
        request: { awbNumber },
        response: { message: 'Label fetched successfully' },
        statusCode: response.status,
        duration: Date.now() - startTime,
        success: true,
        shipmentId,
        url,
      });

      return labelUrl;
    } catch (error: any) {
      await this.logApiCall({
        apiType: 'LABEL',
        request: { awbNumber },
        response: error.response?.data,
        statusCode: error.response?.status,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        shipmentId,
        url,
      });

      throw error;
    }
  }

  async cancelShipment(awbNumbers: string[], shipmentId?: string): Promise<any> {
    const url = this.getFullUrl('cancelApi');
    const customerCode = this.configService.get<string>('DTDC_CUSTOMER_CODE') || '';
    const startTime = Date.now();

    const payload: DtdcCancelPayload = {
      AWBNo: awbNumbers,
      customerCode,
    };

    try {
      const response = await this.axiosInstance.post(url, payload, {
        headers: {
          'api-key': this.getApiKey(),
        },
      });

      await this.logApiCall({
        apiType: 'CANCEL',
        request: payload,
        response: response.data,
        statusCode: response.status,
        duration: Date.now() - startTime,
        success: true,
        shipmentId,
        url,
      });

      return response.data;
    } catch (error: any) {
      await this.logApiCall({
        apiType: 'CANCEL',
        request: payload,
        response: error.response?.data,
        statusCode: error.response?.status,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        shipmentId,
        url,
      });

      throw error;
    }
  }

  async checkPincode(originPincode: string, destinationPincode: string): Promise<boolean> {
    const url = this.getFullUrl('pincodeApi');
    const startTime = Date.now();

    const payload = {
      orgPincode: '131029',
      desPincode: destinationPincode,
    };

    try {
      const response = await this.axiosInstance.post(url, payload, {
        headers: {
          'api-key': this.getApiKey(),
        },
      });

      const isServiceable =
        response.data?.ZIPCODE_RESP?.[0]?.SERVFLAG === 'Y' ||
        response.data?.SERV_LIST?.[0]?.b2C_SERVICEABLE === 'YES';

      await this.logApiCall({
        apiType: 'PINCODE',
        request: payload,
        response: response.data,
        statusCode: response.status,
        duration: Date.now() - startTime,
        success: true,
        url: url + ' [POST Payload: ' + JSON.stringify(payload) + ']',
      });

      return isServiceable;
    } catch (error: any) {
      await this.logApiCall({
        apiType: 'PINCODE',
        request: payload,
        response: error.response?.data,
        statusCode: error.response?.status,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        url: url + ' [POST Payload: ' + JSON.stringify(payload) + ']',
      });

      return false;
    }
  }

  async trackShipment(awbNumber: string): Promise<DtdcTrackingResponse | null> {
    const token = await this.getTrackingToken();
    const trackingBase = this.configService.get<string>('dtdc.tracking.baseUrl') || 'https://blktracksvc.dtdc.com/dtdc-api';
    const trackPath = this.configService.get<string>('dtdc.tracking.trackPath') || '/rest/JSONCnTrk/getTrackDetails';
    const url = trackingBase + trackPath;
    const startTime = Date.now();
    const payload = { trkType: 'cnno', strcnno: awbNumber, addtnlDtl: 'Y' };

    try {
      const response = await this.axiosInstance.post<DtdcTrackingResponse>(url, payload, {
        headers: {
          'x-access-token': token,
        },
      });

      await this.logApiCall({
        apiType: 'TRACKING',
        request: payload,
        response: response.data,
        statusCode: response.status,
        duration: Date.now() - startTime,
        success: true,
        url,
      });

      return response.data;
    } catch (error: any) {
      await this.logApiCall({
        apiType: 'TRACKING',
        request: payload,
        response: error.response?.data,
        statusCode: error.response?.status,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
        url,
      });

      return null;
    }
  }

  private async getTrackingToken(): Promise<string> {
    if (this.trackingTokenCache && this.trackingTokenCache.expiresAt > Date.now()) {
      return this.trackingTokenCache.token;
    }

    const trackingBase = this.configService.get<string>('dtdc.tracking.baseUrl') || 'https://blktracksvc.dtdc.com/dtdc-api';
    const tokenPath = this.configService.get<string>('dtdc.tracking.tokenPath') || '/api/dtdc/authenticate';
    const username = this.configService.get<string>('DTDC_TRACKING_USERNAME') || '';
    const password = this.configService.get<string>('DTDC_TRACKING_PASSWORD') || '';
    const url = `${trackingBase}${tokenPath}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    try {
      const response = await this.axiosInstance.get(url);

      const token = response.data.token;
      this.trackingTokenCache = {
        token,
        expiresAt: Date.now() + 3600000,
      };

      return token;
    } catch (error) {
      this.logger.error('Failed to get tracking token', error);
      throw error;
    }
  }

  private async logApiCall(data: {
    apiType: string;
    request: any;
    response: any;
    statusCode?: number;
    duration: number;
    success: boolean;
    error?: string;
    shipmentId?: string;
    url?: string;
  }): Promise<void> {
    try {
      const requestStr = data.request ? JSON.stringify(data.request) : 'N/A';
      const logMessage = `DTDC API call | URL: ${data.url || 'N/A'} | Request: ${requestStr}`;

      if (!data.success) {
        this.shipmentLogger.logApiError(logMessage, 'POST', data.error || 'Unknown Error', data.duration);
      } else {
        this.shipmentLogger.logApiCall(logMessage, 'POST', data.statusCode || 200, data.duration);
      }

      await this.apiLogModel.create({
        shipmentId: data.shipmentId,
        apiType: data.apiType,
        requestPayload: data.request,
        responsePayload: data.response,
        statusCode: data.statusCode,
        durationMs: data.duration,
        success: data.success,
        errorMessage: data.error,
      });
    } catch (error) {
      this.logger.error('Failed to log API call', error);
    }
  }
}

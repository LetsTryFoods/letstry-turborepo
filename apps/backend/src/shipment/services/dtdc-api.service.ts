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

@Injectable()
export class DtdcApiService {
  private readonly logger = new Logger(DtdcApiService.name);
  private readonly axiosInstance: AxiosInstance;
  private trackingTokenCache: { token: string; expiresAt: number } | null = null;

  constructor(
    @InjectModel(DtdcApiLog.name)
    private readonly apiLogModel: Model<DtdcApiLog>,
    private readonly configService: ConfigService,
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

  private getEndpoint(endpoint: string): string {
    const endpoints = this.configService.get<Record<string, string>>('dtdc.endpoints') || {};
    return endpoints[endpoint] || '';
  }

  async bookShipment(payload: DtdcBookingPayload): Promise<DtdcBookingResponse> {
    const url = this.getBaseUrl() + this.getEndpoint('bookingApi');
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
      });

      throw error;
    }
  }

  async getLabel(awbNumber: string, shipmentId: string): Promise<string> {
    const url = `${this.getBaseUrl()}${this.getEndpoint('labelApi')}/${awbNumber}`;
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
      });

      throw error;
    }
  }

  async cancelShipment(awbNumbers: string[], shipmentId?: string): Promise<any> {
    const url = this.getBaseUrl() + this.getEndpoint('cancelApi');
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
      });

      throw error;
    }
  }

  async checkPincode(originPincode: string, destinationPincode: string): Promise<boolean> {
    const url = this.getBaseUrl() + this.getEndpoint('pincodeApi');
    const startTime = Date.now();

    const params = {
      origin_pincode: originPincode,
      destination_pincode: destinationPincode,
    };

    try {
      const response = await this.axiosInstance.get(url, {
        params,
        headers: {
          'api-key': this.getApiKey(),
        },
      });

      const isServiceable = response.data?.serviceable === true;

      await this.logApiCall({
        apiType: 'PINCODE',
        request: params,
        response: response.data,
        statusCode: response.status,
        duration: Date.now() - startTime,
        success: true,
      });

      return isServiceable;
    } catch (error: any) {
      await this.logApiCall({
        apiType: 'PINCODE',
        request: params,
        response: error.response?.data,
        statusCode: error.response?.status,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
      });

      return false;
    }
  }

  async trackShipment(awbNumber: string): Promise<DtdcTrackingResponse | null> {
    const token = await this.getTrackingToken();
    const url = this.getBaseUrl() + this.getEndpoint('trackApi');
    const startTime = Date.now();

    try {
      const response = await this.axiosInstance.get<DtdcTrackingResponse>(url, {
        params: { cnNo: awbNumber },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await this.logApiCall({
        apiType: 'TRACKING',
        request: { awbNumber },
        response: response.data,
        statusCode: response.status,
        duration: Date.now() - startTime,
        success: true,
      });

      return response.data;
    } catch (error: any) {
      await this.logApiCall({
        apiType: 'TRACKING',
        request: { awbNumber },
        response: error.response?.data,
        statusCode: error.response?.status,
        duration: Date.now() - startTime,
        success: false,
        error: error.message,
      });

      return null;
    }
  }

  private async getTrackingToken(): Promise<string> {
    if (this.trackingTokenCache && this.trackingTokenCache.expiresAt > Date.now()) {
      return this.trackingTokenCache.token;
    }

    const url = this.getBaseUrl() + '/dtdc-api/rest/JSONCustTokenGeneration/TokenGeneration';
    const username = this.configService.get<string>('DTDC_TRACKING_USERNAME') || '';
    const password = this.configService.get<string>('DTDC_TRACKING_PASSWORD') || '';

    try {
      const response = await this.axiosInstance.post(url, {
        username,
        password,
      });

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
  }): Promise<void> {
    try {
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

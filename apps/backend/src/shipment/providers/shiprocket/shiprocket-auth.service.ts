import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../../cache/cache.service';
import axios from 'axios';
import { ShipmentLoggerService } from '../../services/shipment-logger.service';

@Injectable()
export class ShiprocketAuthService {
  private readonly logger = new Logger(ShiprocketAuthService.name);
  private readonly TOKEN_KEY = 'shiprocket:auth:token';

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly shipmentLogger: ShipmentLoggerService,
  ) {}

  async getToken(): Promise<string> {
    const cachedToken = await this.cacheService.get<string>(this.TOKEN_KEY);
    if (cachedToken) {
      return cachedToken;
    }

    const email = this.configService.get<string>('shiprocket.email');
    const password = this.configService.get<string>('shiprocket.password');
    const apiUrl = this.configService.get<string>('shiprocket.apiUrl');

    if (!email || !password) {
      throw new Error(
        'Shiprocket credentials not configured in environment variables',
      );
    }

    const startTime = Date.now();
    const endpoint = `${apiUrl}/auth/login`;
    try {
      this.logger.log('Fetching new token from Shiprocket API...');

      const payload = { email, password };
      const response = await axios.post(endpoint, payload);

      const duration = Date.now() - startTime;

      const logMessage = `Shiprocket Auth call | URL: ${endpoint} | Request: {"email":"${email}","password":"***"} | Response: {"token":"***"}`;
      this.shipmentLogger.logApiCall(
        logMessage,
        'POST',
        response.status,
        duration,
        'SHIPROCKET',
      );

      const token = response.data.token;

      // TTL is 9 days = 777600000 milliseconds
      await this.cacheService.set(this.TOKEN_KEY, token, 777600000);

      this.logger.log('Shiprocket token fetched and cached successfully.');
      return token;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errMessage = error.response?.data?.message || error.message;

      const logMessage = `Shiprocket Auth call | URL: ${endpoint} | Request: {"email":"${email}","password":"***"} | Response: ${JSON.stringify(error.response?.data)}`;
      this.shipmentLogger.logApiError(
        logMessage,
        'POST',
        errMessage,
        duration,
        'SHIPROCKET',
      );

      this.logger.error('Failed to get Shiprocket token', errMessage);
      throw error;
    }
  }

  async clearToken(): Promise<void> {
    this.logger.log('Clearing Shiprocket token from cache...');
    this.shipmentLogger.logInfo(
      'Clearing Shiprocket token from cache...',
      undefined,
      'SHIPROCKET',
    );
    await this.cacheService.del(this.TOKEN_KEY);
  }
}

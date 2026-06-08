import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentLoggerService } from '../../../common/services/payment-logger.service';

@Injectable()
export class ZaakpayHttpService {
  private baseUrl: string;

  constructor(
    private configService: ConfigService,
    private paymentLogger: PaymentLoggerService,
  ) {
    this.baseUrl = this.configService.get<string>('zaakpay.baseUrl')!;
  }

  async makeRequest(
    endpoint: string,
    dataString: string,
    checksum: string,
  ): Promise<any> {
    return axios.post(
      `${this.baseUrl}${endpoint}`,
      new URLSearchParams({
        data: dataString,
        checksum: checksum,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  handleError(error: any, context: string, additionalInfo: any): never {
    this.paymentLogger.error(context, error.stack, {
      ...additionalInfo,
      error: error.message,
    });
    throw error;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentLoggerService } from '../../../common/services/payment-logger.service';
import { ZaakpayChecksumService } from './zaakpay-checksum.service';
import { ZaakpayHttpService } from './zaakpay-http.service';

@Injectable()
export class ZaakpaySettlementService {
  private merchantId: string;

  constructor(
    private configService: ConfigService,
    private paymentLogger: PaymentLoggerService,
    private checksumService: ZaakpayChecksumService,
    private httpService: ZaakpayHttpService,
  ) {
    this.merchantId = this.configService.get<string>(
      'zaakpay.merchantIdentifier',
    )!;
  }

  async getSettlementReport(date: string): Promise<any> {
    const data = this.buildSettlementData(date);
    const dataString = JSON.stringify(data);
    const checksum = this.checksumService.generateChecksum(dataString);

    this.logRequest(dataString, checksum);

    try {
      const response = await this.httpService.makeRequest(
        '/getSettlementReport',
        dataString,
        checksum,
      );
      this.logResponse(response);
      return response.data;
    } catch (error) {
      this.httpService.handleError(error, 'Get settlement report failed', {
        date,
      });
    }
  }

  private buildSettlementData(date: string): any {
    return {
      merchantIdentifier: this.merchantId,
      settlementDate: date,
    };
  }

  private logRequest(dataString: string, checksum: string): void {
    this.paymentLogger.logPSPRequest({
      endpoint: '/getSettlementReport',
      method: 'POST',
      payload: { data: dataString, checksum },
    });
  }

  private logResponse(response: any): void {
    this.paymentLogger.logPSPResponse({
      endpoint: '/getSettlementReport',
      status: response.status,
      response: response.data,
    });
  }
}

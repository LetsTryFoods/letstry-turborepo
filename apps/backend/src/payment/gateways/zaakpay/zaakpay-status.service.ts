import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentLoggerService } from '../../../common/services/payment-logger.service';
import { ZaakpayChecksumService } from './zaakpay-checksum.service';
import { ZaakpayHttpService } from './zaakpay-http.service';

@Injectable()
export class ZaakpayStatusService {
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

  async checkTransactionStatus(params: {
    orderId: string;
    merchantRefId?: string;
  }): Promise<any> {
    const data = this.buildStatusCheckData(params);
    const dataString = JSON.stringify(data);
    const checksum = this.checksumService.generateChecksum(dataString);

    this.logRequest(dataString, checksum);

    try {
      const response = await this.httpService.makeRequest(
        '/checkTxn?v=5',
        dataString,
        checksum,
      );
      this.logResponse(response);
      return response.data;
    } catch (error) {
      this.httpService.handleError(error, 'Check transaction status failed', {
        orderId: params.orderId,
      });
    }
  }

  private buildStatusCheckData(params: {
    orderId: string;
    merchantRefId?: string;
  }): any {
    return {
      merchantIdentifier: this.merchantId,
      orderDetail: {
        orderId: params.orderId,
      },
      ...(params.merchantRefId && {
        refundDetail: {
          merchantRefId: params.merchantRefId,
        },
      }),
    };
  }

  private logRequest(dataString: string, checksum: string): void {
    this.paymentLogger.logPSPRequest({
      endpoint: '/checkTxn?v=5',
      method: 'POST',
      payload: { data: dataString, checksum },
    });
  }

  private logResponse(response: any): void {
    this.paymentLogger.logPSPResponse({
      endpoint: '/checkTxn?v=5',
      status: response.status,
      response: response.data,
    });
  }
}

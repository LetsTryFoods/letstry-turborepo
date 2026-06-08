import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentLoggerService } from '../../../common/services/payment-logger.service';
import { ZaakpayChecksumService } from './zaakpay-checksum.service';
import { ZaakpayHttpService } from './zaakpay-http.service';

@Injectable()
export class ZaakpayRefundService {
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

  async initiateRefund(params: {
    orderId: string;
    amount?: string;
    updateReason: string;
    merchantRefId: string;
    isPartialRefund: boolean;
  }): Promise<any> {
    const data = this.buildRefundData(params);
    const dataString = JSON.stringify(data);
    const checksum = this.checksumService.generateChecksum(dataString);

    this.logRequest(dataString, checksum);

    try {
      const response = await this.httpService.makeRequest(
        '/updateTxn',
        dataString,
        checksum,
      );
      this.logResponse(response);
      return response.data;
    } catch (error) {
      this.httpService.handleError(error, 'Refund initiation failed', {
        orderId: params.orderId,
      });
    }
  }

  private buildRefundData(params: {
    orderId: string;
    amount?: string;
    updateReason: string;
    merchantRefId: string;
    isPartialRefund: boolean;
  }): any {
    const data: any = {
      merchantIdentifier: this.merchantId,
      orderDetail: {
        orderId: params.orderId,
      },
      updateDesired: params.isPartialRefund ? '22' : '14',
      updateReason: params.updateReason,
      merchantRefId: params.merchantRefId,
    };

    if (params.isPartialRefund && params.amount) {
      data.orderDetail.amount = params.amount;
    }

    return data;
  }

  private logRequest(dataString: string, checksum: string): void {
    this.paymentLogger.logPSPRequest({
      endpoint: '/updateTxn',
      method: 'POST',
      payload: { data: dataString, checksum },
    });
  }

  private logResponse(response: any): void {
    this.paymentLogger.logPSPResponse({
      endpoint: '/updateTxn',
      status: response.status,
      response: response.data,
    });
  }
}

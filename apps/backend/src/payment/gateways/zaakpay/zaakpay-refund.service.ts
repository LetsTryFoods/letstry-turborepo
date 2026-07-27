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
    // 1. Convert amount to paisa for Zaakpay v1 API
    const amountNum = parseFloat(params.amount || '0');
    const amountInPaisa = Math.round(amountNum * 100);

    const bodyObj: any = {
      merchantIdentifier: this.merchantId,
      orderId: params.orderId,
      refundType: params.isPartialRefund ? 'P' : 'F',
      merchantRefundId: params.merchantRefId,
    };
    if (amountInPaisa > 0) {
      bodyObj.refundAmount = amountInPaisa;
    }

    const dataString = JSON.stringify(bodyObj);
    const checksum = this.checksumService.generateChecksum(dataString);

    this.logRequest(dataString, checksum);

    try {
      // Primary: Official Zaakpay v1 Refund API
      const response = await this.httpService.makeJsonRequest(
        '/api/payments/v1/refund',
        bodyObj,
        checksum,
      );
      this.logResponse(response);
      return response.data;
    } catch (v1Error) {
      // Fallback: Legacy /updateTxn endpoint
      try {
        const legacyData = this.buildLegacyRefundData(params);
        const legacyDataString = JSON.stringify(legacyData);
        const legacyChecksum = this.checksumService.generateChecksum(legacyDataString);

        const response = await this.httpService.makeRequest(
          '/updateTxn',
          legacyDataString,
          legacyChecksum,
        );
        this.logResponse(response);
        return response.data;
      } catch {
        this.httpService.handleError(v1Error, 'Refund initiation failed', {
          orderId: params.orderId,
        });
      }
    }
  }

  private buildLegacyRefundData(params: {
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
      endpoint: '/api/payments/v1/refund',
      method: 'POST',
      payload: { data: dataString, checksum },
    });
  }

  private logResponse(response: any): void {
    this.paymentLogger.logPSPResponse({
      endpoint: '/api/payments/v1/refund',
      status: response.status,
      response: response.data,
    });
  }
}

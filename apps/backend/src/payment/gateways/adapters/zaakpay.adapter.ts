import { Injectable } from '@nestjs/common';
import { ZaakpayGatewayService } from '../zaakpay/zaakpay-gateway.service';
import {
  PaymentGatewayProvider,
  InitiatePaymentParams,
  InitiatePaymentResponse,
  CheckStatusParams,
  TransactionStatusResponse,
  InitiateRefundParams,
  RefundResponse,
  ParsedWebhookData,
  SettlementReportParams,
  SettlementReport,
} from '../interfaces/payment-gateway.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ZaakpayAdapter implements PaymentGatewayProvider {
  constructor(private readonly zaakpayGateway: ZaakpayGatewayService) { }

  async initiatePayment(
    params: InitiatePaymentParams,
  ): Promise<InitiatePaymentResponse> {
    const result = await this.zaakpayGateway.initiatePayment({
      orderId: params.orderId,
      amount: params.amount,
      buyerEmail: params.buyerEmail,
      buyerName: params.buyerName,
      buyerPhone: params.buyerPhone,
      productDescription: params.productDescription,
      returnUrl: params.returnUrl,
    });

    return {
      redirectUrl: result.redirectUrl,
      gatewayOrderId: params.orderId,
    };
  }

  async checkTransactionStatus(
    params: CheckStatusParams,
  ): Promise<TransactionStatusResponse> {
    const result = await this.zaakpayGateway.checkTransactionStatus({
      orderId: params.orderId,
    });

    let status: 'SUCCESS' | 'FAILED' | 'PENDING' = 'PENDING';
    if (result.responseCode === '100') {
      status = 'SUCCESS';
    } else if (result.responseCode === '0' || result.responseCode === '400') {
      status = 'FAILED';
    }

    return {
      status,
      transactionId: result.txnId,
      responseCode: result.responseCode,
      responseMessage: result.responseDescription,
      paymentMethod: result.paymentMethod,
      bankTransactionId: result.bankTransactionId,
      cardType: result.cardType,
      cardNumber: result.cardNumber,
      rawResponse: result,
    };
  }

  async initiateRefund(params: InitiateRefundParams): Promise<RefundResponse> {
    const merchantRefId = `MREF_${Date.now()}_${uuidv4().substring(0, 8)}`;

    const result = await this.zaakpayGateway.initiateRefund({
      orderId: params.orderId,
      amount: params.refundAmount,
      updateReason: params.reason || 'Customer refund request',
      merchantRefId,
      isPartialRefund: false,
    });

    const success =
      result.responseCode === '230' || result.responseCode === '245';

    return {
      success,
      refundId: params.refundId,
      gatewayRefundId: merchantRefId,
      responseCode: result.responseCode,
      responseMessage: result.responseDescription,
      rawResponse: result,
    };
  }

  verifyWebhookChecksum(data: string, checksum: string): boolean {
    return this.zaakpayGateway.verifyChecksum(data, checksum);
  }

  parseWebhookData(webhookBody: any): ParsedWebhookData {
    const txnData = this.parseTxnDataString(webhookBody.txnData);

    let status: 'SUCCESS' | 'FAILED' | 'PENDING' = 'PENDING';
    if (txnData.responseCode === '100') {
      status = 'SUCCESS';
    } else if (
      txnData.responseCode === '200' ||
      txnData.responseCode === '300'
    ) {
      status = 'PENDING';
    } else {
      status = 'FAILED';
    }

    return {
      orderId: txnData.orderId,
      transactionId: txnData.txnId,
      responseCode: txnData.responseCode,
      responseMessage: txnData.responseDescription,
      status,
      paymentMethod: this.mapPaymentMethod(txnData.paymentMethod),
      bankTransactionId: txnData.bankTransactionId,
      cardType: txnData.cardType,
      cardNumber: txnData.cardNumber,
      amount: txnData.amount,
    };
  }

  async getSettlementReport(
    params: SettlementReportParams,
  ): Promise<SettlementReport> {
    const result = await this.zaakpayGateway.getSettlementReport(params.date);

    return {
      date: params.date,
      transactions: result.transactions || [],
      totalAmount: result.totalAmount || '0',
      totalCount: result.totalCount || 0,
    };
  }

  private parseTxnDataString(txnDataString: string): any {
    const params: any = {};
    const pairs = txnDataString.split('&');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value || '');
    }

    return params;
  }

  private mapPaymentMethod(method: string): string {
    return method;
  }
}

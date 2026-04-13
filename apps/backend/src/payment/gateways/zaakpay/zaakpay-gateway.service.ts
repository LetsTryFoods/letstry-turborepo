import { Injectable } from '@nestjs/common';
import { ZaakpayPaymentService } from './zaakpay-payment.service';
import { ZaakpayRefundService } from './zaakpay-refund.service';
import { ZaakpayStatusService } from './zaakpay-status.service';
import { ZaakpaySettlementService } from './zaakpay-settlement.service';
import { ZaakpayChecksumService } from './zaakpay-checksum.service';

@Injectable()
export class ZaakpayGatewayService {
    constructor(
        private paymentService: ZaakpayPaymentService,
        private refundService: ZaakpayRefundService,
        private statusService: ZaakpayStatusService,
        private settlementService: ZaakpaySettlementService,
        private checksumService: ZaakpayChecksumService,
    ) { }

    async initiatePayment(params: {
        orderId: string;
        amount: string;
        buyerEmail: string;
        buyerName: string;
        buyerPhone: string;
        buyerAddress?: string;
        buyerCity?: string;
        buyerState?: string;
        buyerCountry?: string;
        buyerPincode?: string;
        productDescription: string;
        returnUrl: string;
    }): Promise<{ redirectUrl: string }> {
        return this.paymentService.initiatePayment(params);
    }

    async initiateRefund(params: {
        orderId: string;
        amount?: string;
        updateReason: string;
        merchantRefId: string;
        isPartialRefund: boolean;
    }): Promise<any> {
        return this.refundService.initiateRefund(params);
    }

    async checkTransactionStatus(params: {
        orderId: string;
        merchantRefId?: string;
    }): Promise<any> {
        return this.statusService.checkTransactionStatus(params);
    }

    async getSettlementReport(date: string): Promise<any> {
        return this.settlementService.getSettlementReport(date);
    }

    verifyChecksum(data: string, receivedChecksum: string): boolean {
        return this.checksumService.verifyChecksum(data, receivedChecksum);
    }
}

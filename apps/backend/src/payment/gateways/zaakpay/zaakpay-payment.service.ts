import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentLoggerService } from '../../../common/services/payment-logger.service';
import { ZaakpayChecksumService } from './zaakpay-checksum.service';

@Injectable()
export class ZaakpayPaymentService {
    private baseUrl: string;
    private merchantId: string;

    constructor(
        private configService: ConfigService,
        private paymentLogger: PaymentLoggerService,
        private checksumService: ZaakpayChecksumService,
    ) {
        this.baseUrl = this.configService.get<string>('zaakpay.baseUrl')!;
        this.merchantId = this.configService.get<string>('zaakpay.merchantIdentifier')!;
    }

    async initiatePayment(params: {
        orderId: string;
        amount: string;
        buyerEmail: string;
        buyerName: string;
        buyerPhone: string;
        productDescription: string;
        returnUrl: string;
    }): Promise<{ redirectUrl: string }> {
        const queryParams = this.buildQueryParams(params);
        const checksum = this.generateChecksum(queryParams);
        const expressCheckoutUrl = this.getExpressCheckoutUrl();

        this.logRequest(queryParams, checksum);

        try {
            const redirectUrl = await this.executePaymentRequest(
                expressCheckoutUrl,
                queryParams,
                checksum,
            );
            this.logResponse(redirectUrl);
            return { redirectUrl };
        } catch (error) {
            this.handleError(error, params.orderId);
        }
    }

    private buildQueryParams(params: {
        orderId: string;
        amount: string;
        buyerEmail: string;
        productDescription: string;
        returnUrl: string;
    }) {
        const amountInPaisa = Math.round(parseFloat(params.amount) * 100).toString();

        return {
            amount: amountInPaisa,
            buyerEmail: params.buyerEmail,
            currency: 'INR',
            merchantIdentifier: this.merchantId,
            orderId: params.orderId,
            productDescription: params.productDescription,
            txnType: '1',
            returnUrl: params.returnUrl,
        };
    }

    private generateChecksum(queryParams: any): string {
        const sortedKeys = Object.keys(queryParams).sort();
        const checksumString = sortedKeys
            .map((key) => `${key}=${queryParams[key]}&`)
            .join('');
        return this.checksumService.generateChecksum(checksumString);
    }

    private getExpressCheckoutUrl(): string {
        return (
            this.configService.get<string>('zaakpay.expressCheckoutUrl') ||
            `${this.baseUrl}/api/paymentTransact/V8`
        );
    }

    private logRequest(queryParams: any, checksum: string): void {
        this.paymentLogger.logPSPRequest({
            endpoint: '/api/paymentTransact/V8',
            method: 'GET',
            payload: { ...queryParams, checksum },
        });
    }

    private async executePaymentRequest(
        url: string,
        queryParams: any,
        checksum: string,
    ): Promise<string> {
        this.paymentLogger.logPSPRequest({
            endpoint: url,
            method: 'POST',
            payload: { ...queryParams, checksum }
        });

        const params = new URLSearchParams();
        Object.keys(queryParams).forEach(key => params.append(key, queryParams[key]));
        params.append('checksum', checksum);

        try {
            const response = await axios.post(url, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 400,
            });

            if (response.status === 302 || response.status === 301) {
                return this.extractRedirectUrl(response.headers.location);
            }

            if (response.status === 200) {
                this.paymentLogger.logPSPResponse({
                    endpoint: url,
                    status: 200,
                    response: response.data
                });

                const queryString = params.toString();
                return `${url}?${queryString}`;
            }

            throw new Error(`Unexpected status code: ${response.status}`);
        } catch (error: any) {
            if (error.response && (error.response.status === 302 || error.response.status === 301)) {
                return this.extractRedirectUrl(error.response.headers.location);
            }
            throw error;
        }
    }

    private extractRedirectUrl(redirectPath: string): string {
        const url = redirectPath.startsWith('http')
            ? redirectPath
            : `${this.baseUrl}${redirectPath}`;
        return url.replace(/^http:\/\//i, 'https://');
    }

    private logResponse(redirectUrl: string): void {
        this.paymentLogger.logPSPResponse({
            endpoint: '/api/paymentTransact/V8',
            status: 302,
            response: { redirectUrl },
        });
    }

    private handleError(error: any, orderId: string): never {
        this.paymentLogger.error('Express checkout initiation failed', error.stack, {
            orderId,
            error: error.message,
        });
        throw error;
    }
}

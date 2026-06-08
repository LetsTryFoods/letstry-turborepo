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
    this.merchantId = this.configService.get<string>(
      'zaakpay.merchantIdentifier',
    )!;
  }

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

  /**
   * Sanitizes buyerAddress for Zaakpay (official spec: max 100, alphanumeric).
   * - Strips everything except letters, digits, and spaces.
   * - Non-ASCII chars (em-dash, curly quotes) are removed to prevent checksum
   *   mismatch (error 180) caused by byte-level differences on Zaakpay's side.
   * - Truncated to maxLength (default 100 per Zaakpay docs).
   * Database values are never modified — runs only at the Zaakpay boundary.
   */
  private sanitizeAddressField(value?: string, maxLength = 100): string {
    if (!value) return '';
    return (
      value
        // eslint-disable-next-line no-control-regex
        .replace(/[^\x00-\x7F]/g, ' ') // replace non-ASCII with space
        .replace(/[^a-zA-Z0-9 ]/g, ' ') // keep only alphanumeric + space (per Zaakpay spec)
        .replace(/\s{2,}/g, ' ') // collapse multiple spaces
        .trim()
        .substring(0, maxLength)
    );
  }

  /**
   * Sanitizes buyerCity for Zaakpay (official spec: max 30, alphabet only, min 3).
   * Strips numbers and any non-alpha characters since the spec says "alphabet" only.
   */
  private sanitizeCityField(value?: string): string {
    if (!value) return '';
    const cleaned = value
      // eslint-disable-next-line no-control-regex
      .replace(/[^\x00-\x7F]/g, ' ') // replace non-ASCII
      .replace(/[^a-zA-Z ]/g, ' ') // alphabet + space only
      .replace(/\s{2,}/g, ' ')
      .trim()
      .substring(0, 30); // max 30 per Zaakpay spec
    // Zaakpay requires min length 3 for city — return empty if too short
    return cleaned.length >= 3 ? cleaned : '';
  }

  /**
   * Sanitizes buyerFirstName / buyerLastName for Zaakpay
   * (official spec: max 30, alphanumeric, no special characters or dashes).
   */
  private sanitizeNameField(value?: string, maxLength = 30): string {
    if (!value) return '';
    return (
      value
        // eslint-disable-next-line no-control-regex
        .replace(/[^\x00-\x7F]/g, ' ') // replace non-ASCII
        .replace(/[^a-zA-Z0-9 ]/g, ' ') // alphanumeric + space only
        .replace(/\s{2,}/g, ' ')
        .trim()
        .substring(0, maxLength)
    );
  }

  /**
   * Sanitizes buyerPhoneNumber for Zaakpay
   * (official spec: numeric only, no dashes, no spaces).
   */
  private sanitizePhoneField(value?: string): string {
    if (!value) return '';
    return value.replace(/[^0-9]/g, ''); // digits only
  }

  private buildQueryParams(params: {
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
  }) {
    const amountInPaisa = Math.round(
      parseFloat(params.amount) * 100,
    ).toString();

    const allParams: Record<string, string> = {
      amount: amountInPaisa,
      buyerAddress: this.sanitizeAddressField(params.buyerAddress, 100), // spec: max 100, alphanumeric
      buyerCity: this.sanitizeCityField(params.buyerCity), // spec: max 30, alphabet only, min 3
      buyerCountry: this.sanitizeAddressField(params.buyerCountry, 50),
      buyerEmail: params.buyerEmail,
      buyerFirstName: this.sanitizeNameField(params.buyerName, 30), // spec: max 30, alphanumeric
      buyerPhoneNumber: this.sanitizePhoneField(params.buyerPhone), // spec: numeric only
      buyerPincode: params.buyerPincode || '',
      buyerState: this.sanitizeAddressField(params.buyerState, 50),
      currency: 'INR',
      merchantIdentifier: this.merchantId,
      orderId: params.orderId,
      productDescription: params.productDescription,
      returnUrl: params.returnUrl,
      txnType: '1',
    };

    return Object.fromEntries(
      Object.entries(allParams).filter(
        ([_, v]) => v !== undefined && v !== null && v !== '',
      ),
    );
  }

  private generateChecksum(queryParams: Record<string, string>): string {
    // Zaakpay docs: sort alphabetically, format as key=value& for each param
    const sortedKeys = Object.keys(queryParams).sort();
    const checksumString = sortedKeys
      .map((key) => `${key}=${queryParams[key]}&`)
      .join('');
    this.paymentLogger.log('Checksum string generated', { checksumString });
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
      payload: { ...queryParams, checksum },
    });

    const params = new URLSearchParams();
    Object.keys(queryParams).forEach((key) =>
      params.append(key, queryParams[key]),
    );
    params.append('checksum', checksum);

    try {
      const response = await axios.post(url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
          response: response.data,
        });

        const queryString = params.toString();
        return `${url}?${queryString}`;
      }

      throw new Error(`Unexpected status code: ${response.status}`);
    } catch (error: any) {
      if (
        error.response &&
        (error.response.status === 302 || error.response.status === 301)
      ) {
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
    this.paymentLogger.error(
      'Express checkout initiation failed',
      error.stack,
      {
        orderId,
        error: error.message,
      },
    );
    throw error;
  }
}

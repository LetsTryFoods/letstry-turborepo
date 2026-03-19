import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from '../logger/logger.service';

interface WhatsAppRecipient {
  phone: string;
  variables: string[];
}

interface WhatsAppTemplatePayload {
  template: string;
  recipients: WhatsAppRecipient[];
}

@Injectable()
export class WhatsAppService {
  private readonly apiUrl: string;
  private readonly jwtToken: string;

  constructor(
    private configService: ConfigService,
    private logger: WinstonLoggerService,
  ) {
    this.apiUrl = this.configService.get<string>('whatsapp.apiUrl') || '';
    this.jwtToken = this.configService.get<string>('whatsapp.jwtToken') || '';
  }

  async sendOtpTemplate(phoneNumber: string, otp: string): Promise<boolean> {
    const payload: WhatsAppTemplatePayload = {
      template: 'letstryotp',
      recipients: [
        {
          phone: phoneNumber,
          variables: [otp],
        },
      ],
    };

    return this.sendTemplate(payload);
  }

  async sendOrderConfirmation(
    phoneNumber: string,
    customerName: string,
    awbNumber: string,
    trackingUrl: string,
  ): Promise<boolean> {
    const payload: WhatsAppTemplatePayload = {
      template: 'letstryorderconfirmation',
      recipients: [
        {
          phone: phoneNumber,
          variables: [customerName, awbNumber, trackingUrl],
        },
      ],
    };

    return this.sendTemplate(payload);
  }

  async sendOrderPackedNotification(
    phoneNumber: string,
    orderId: string,
    orderDate: string,
    trackingUrl: string,
  ): Promise<boolean> {
    const payload: WhatsAppTemplatePayload = {
      template: 'deliveryutilitymarchtwo',
      recipients: [
        {
          phone: phoneNumber,
          variables: [trackingUrl, orderDate],
        },
      ],
    };

    return this.sendTemplate(payload);
  }

  async sendPackerCredentials(
    phoneNumber: string,
    employeeId: string,
    password: string,
  ): Promise<boolean> {
    const payload: WhatsAppTemplatePayload = {
      template: 'letstrypackercredentials',
      recipients: [
        {
          phone: phoneNumber,
          variables: [employeeId, password],
        },
      ],
    };

    return this.sendTemplate(payload);
  }

  async sendPaymentConfirmation(
    phoneNumber: string,
    orderId: string,
    amountPaid: string,
    paymentMode: string,
    transactionId: string,
    orderDate: string,
  ): Promise<boolean> {
    const payload: WhatsAppTemplatePayload = {
      template: 'paymentconfirm',
      recipients: [
        {
          phone: phoneNumber,
          variables: [orderId, amountPaid, paymentMode, transactionId, orderDate],
        },
      ],
    };

    return this.sendTemplate(payload);
  }

  private async sendTemplate(
    payload: WhatsAppTemplatePayload,
  ): Promise<boolean> {
    try {
      this.logger.log(
        `WhatsApp API request: ${JSON.stringify({ url: this.apiUrl, template: payload.template, recipients: payload.recipients })}`,
        'WhatsAppService',
      );

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const responseHeaders = Object.fromEntries(response.headers.entries());
        this.logger.error(
          `WhatsApp API error: ${JSON.stringify({ status: response.status, statusText: response.statusText, body: errorText, headers: responseHeaders, requestPayload: payload })}`,
          'WhatsAppService',
        );
        return false;
      }

      const result = await response.json();
      this.logger.log(
        `WhatsApp template sent successfully: ${JSON.stringify({ template: payload.template, response: result })}`,
        'WhatsAppService',
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp template: ${JSON.stringify({ message: error.message, stack: error.stack, requestPayload: payload })}`,
        'WhatsAppService',
      );
      return false;
    }
  }
}

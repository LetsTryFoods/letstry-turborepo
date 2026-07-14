import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from '../../logger/logger.service';

@Injectable()
export class MetaWhatsappService {
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly baseUrl = 'https://graph.facebook.com/v21.0';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.phoneNumberId = this.configService.get<string>('metaWhatsapp.phoneNumberId') || '';
    this.accessToken = this.configService.get<string>('metaWhatsapp.accessToken') || '';
  }

  async sendOtpTemplate(phoneNumber: string, otpCode: string): Promise<boolean> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('Meta WhatsApp credentials missing. Skipping Meta send.', 'MetaWhatsappService');
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: `91${phoneNumber}`,
            type: 'template',
            template: {
              name: 'letstryotp',
              language: { code: 'en' },
              components: [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: otpCode,
                    },
                  ],
                },
                {
                  type: 'button',
                  sub_type: 'url',
                  index: '0',
                  parameters: [
                    {
                      type: 'text',
                      text: otpCode,
                    },
                  ],
                },
              ],
            },
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        this.logger.error(`WhatsApp API Error: ${data.error.message}`, 'MetaWhatsappService', { data });
        return false;
      }

      this.logger.log(`Meta WhatsApp OTP sent successfully to ${phoneNumber}`, 'MetaWhatsappService');
      return true;
    } catch (err) {
      this.logger.error(`Failed to send Meta WhatsApp: ${err.message}`, 'MetaWhatsappService');
      return false;
    }
  }

  async sendPaymentConfirmation(
    phoneNumber: string,
    orderId: string,
    amountPaid: string,
    paymentMode: string,
    transactionId: string,
    orderDate: string,
  ): Promise<boolean> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('Meta WhatsApp credentials missing. Skipping Meta send.', 'MetaWhatsappService');
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: `91${phoneNumber}`,
            type: 'template',
            template: {
              name: 'paymentconfirm',
              language: { code: 'en_US' },
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: orderId },
                    { type: 'text', text: amountPaid },
                    { type: 'text', text: paymentMode },
                    { type: 'text', text: transactionId },
                    { type: 'text', text: orderDate },
                  ],
                },
              ],
            },
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        this.logger.error(`WhatsApp API Error (paymentconfirm): ${data.error.message}`, 'MetaWhatsappService', { data });
        return false;
      }

      this.logger.log(`Meta WhatsApp payment confirmation sent successfully to ${phoneNumber}`, 'MetaWhatsappService');
      return true;
    } catch (err) {
      this.logger.error(`Failed to send Meta WhatsApp payment confirmation: ${err.message}`, 'MetaWhatsappService');
      return false;
    }
  }

  async sendOrderPackedNotification(
    phoneNumber: string,
    orderId: string,
    recipientName: string,
  ): Promise<boolean> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('Meta WhatsApp credentials missing. Skipping Meta send.', 'MetaWhatsappService');
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: `91${phoneNumber}`,
            type: 'template',
            template: {
              name: 'ordershipped',
              language: { code: 'en_US' },
              components: [
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: recipientName || 'Customer' },
                    { type: 'text', text: orderId },
                  ],
                },
              ],
            },
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        this.logger.error(`WhatsApp API Error (ordershipped): ${data.error.message}`, 'MetaWhatsappService', { data });
        return false;
      }

      this.logger.log(`Meta WhatsApp order packed sent successfully to ${phoneNumber}`, 'MetaWhatsappService');
      return true;
    } catch (err) {
      this.logger.error(`Failed to send Meta WhatsApp order packed: ${err.message}`, 'MetaWhatsappService');
      return false;
    }
  }
}

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
            to: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`,
            type: 'template',
            template: {
              name: 'letstryotp',
              language: { code: 'en' },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: otpCode }],
                },
                {
                  type: 'button',
                  sub_type: 'url',
                  index: '0',
                  parameters: [{ type: 'text', text: otpCode }],
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
            to: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`,
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

  async updateMessageStatus(
    phoneNumberId: string,
    messageId: string,
    status: 'read',
  ): Promise<boolean> {
    if (!this.accessToken) {
      this.logger.warn('Meta WhatsApp credentials missing. Skipping Meta send.', 'MetaWhatsappService');
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            message_id: messageId,
            status,
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        this.logger.error(`WhatsApp Status Update Error: ${data.error.message}`, 'MetaWhatsappService', { data });
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error(`Failed to update Meta WhatsApp status: ${err.message}`, 'MetaWhatsappService');
      return false;
    }
  }

  async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    if (!this.accessToken) {
      throw new Error('Meta WhatsApp access token missing');
    }

    try {
      // 1. Get media URL from Meta
      const mediaResponse = await fetch(`${this.baseUrl}/${mediaId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const mediaData = await mediaResponse.json();
      if (mediaData.error) {
        throw new Error(`Failed to get media url: ${mediaData.error.message}`);
      }

      const mediaUrl = mediaData.url;
      const mimeType = mediaData.mime_type;

      // 2. Download the actual file buffer from the URL using the Bearer token
      const downloadResponse = await fetch(mediaUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!downloadResponse.ok) {
        throw new Error(`Failed to download media file: ${downloadResponse.statusText}`);
      }

      const arrayBuffer = await downloadResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return { buffer, mimeType };
    } catch (err) {
      this.logger.error(`Failed to download WhatsApp media: ${err.message}`, 'MetaWhatsappService');
      throw err;
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
            to: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`,
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

  async sendGenericTemplate(
    phoneNumber: string,
    templateName: string,
    languageCode: string,
    components: any[],
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('Meta WhatsApp credentials missing. Skipping Meta send.', 'MetaWhatsappService');
      return { success: false, error: 'Meta credentials not configured' };
    }

    try {
      const to = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
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
            to,
            type: 'template',
            template: {
              name: templateName,
              language: { code: languageCode },
              components,
            },
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        const errMsg = `[${data.error.code}] ${data.error.message}`;
        this.logger.error(
          `WhatsApp API Error (generic template: ${templateName}): ${errMsg}`,
          'MetaWhatsappService',
          { data },
        );
        return { success: false, error: errMsg };
      }

      this.logger.log(
        `Meta WhatsApp generic template "${templateName}" sent to ${phoneNumber}`,
        'MetaWhatsappService',
      );
      return { success: true };
    } catch (err) {
      this.logger.error(
        `Failed to send Meta WhatsApp generic template "${templateName}": ${err.message}`,
        'MetaWhatsappService',
      );
      return { success: false, error: err.message };
    }
  }

  async sendPromotionalLeftCustomerTemplate(phoneNumber: string, imageUrl?: string): Promise<{ success: boolean; error?: string }> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('Meta WhatsApp credentials missing. Skipping Meta send.', 'MetaWhatsappService');
      return { success: false, error: 'Meta credentials not configured' };
    }

    try {
      const components: any[] = [];

      if (imageUrl) {
        components.push({
          type: 'header',
          parameters: [{ type: 'image', image: { link: imageUrl } }],
        });
      }

      const to = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
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
            to,
            type: 'template',
            template: {
              name: 'leftcustomer',
              language: { code: 'en' },
              components: components.length > 0 ? components : undefined,
            },
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        const errMsg = `[${data.error.code}] ${data.error.message}`;
        this.logger.error(`WhatsApp API Error (leftcustomer): ${errMsg}`, 'MetaWhatsappService', { data });
        return { success: false, error: errMsg };
      }
      this.logger.log(`Meta WhatsApp promotional message (leftcustomer) sent to ${phoneNumber}`, 'MetaWhatsappService');
      return { success: true };
    } catch (err) {
      this.logger.error(`Failed to send Meta WhatsApp leftcustomer template: ${err.message}`, 'MetaWhatsappService');
      return { success: false, error: err.message };
    }
  }

  /**
   * Sends a free-form text message within a 24-hour customer service session window.
   * Only works if the customer has messaged us in the last 24 hours.
   */
  async sendFreeText(
    phoneNumber: string,
    text: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.phoneNumberId || !this.accessToken) {
      this.logger.warn('Meta WhatsApp credentials missing. Skipping free text send.', 'MetaWhatsappService');
      return { success: false, error: 'Meta credentials not configured' };
    }

    try {
      const to = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
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
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { body: text },
          }),
        },
      );

      const data = await response.json();
      if (data.error) {
        const errMsg = `[${data.error.code}] ${data.error.message}`;
        this.logger.error(`WhatsApp free-text error to ${phoneNumber}: ${errMsg}`, 'MetaWhatsappService');
        return { success: false, error: errMsg };
      }

      const messageId = data?.messages?.[0]?.id;
      this.logger.log(`Free-text sent to ${phoneNumber} — messageId: ${messageId}`, 'MetaWhatsappService');
      return { success: true, messageId };
    } catch (err) {
      this.logger.error(`Failed to send free-text to ${phoneNumber}: ${err.message}`, 'MetaWhatsappService');
      return { success: false, error: err.message };
    }
  }
}

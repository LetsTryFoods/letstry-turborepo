export interface WhatsAppOtpResponse {
  success: boolean;
  message: string;
  provider: 'whatsapp' | 'unavailable';
}

export enum OtpProvider {
  WhatsApp = 'whatsapp',
  Firebase = 'firebase',
}

export interface OtpSendResult {
  provider: OtpProvider;
  confirmationResult?: any;
  message: string;
}

import { WhatsAppMessageDirection, WhatsAppMessageType } from '../schemas/whatsapp-message.schema';

export interface IncomingWhatsAppMessage {
  messageId: string;
  phoneNumber: string;
  content?: string;
  type: WhatsAppMessageType;
  timestamp: Date;
  mediaBuffer?: Buffer; // If media, we can pass it as a buffer
  mediaMimeType?: string;
  mediaFileName?: string;
}

export interface SendMessageOptions {
  isTest?: boolean;
  replyToMessageId?: string;
}

export interface IWhatsAppProvider {
  /**
   * Connect to the provider
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the provider
   */
  disconnect(): Promise<void>;

  /**
   * Send a text or media message
   */
  sendMessage(
    phoneNumber: string,
    text: string,
    options?: SendMessageOptions,
  ): Promise<{ success: boolean; error?: string; skippedLimit?: boolean; messageId?: string }>;

  /**
   * Register a callback to listen for incoming messages
   */
  onMessage(callback: (msg: IncomingWhatsAppMessage) => Promise<void>): void;
}

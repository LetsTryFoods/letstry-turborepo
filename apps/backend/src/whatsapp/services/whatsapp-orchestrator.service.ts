import { Injectable } from '@nestjs/common';
import { WhatsAppService } from '../whatsapp.service';
import { BaileysService } from './baileys.service';
import { BaileysMessageLogService } from './baileys-message-log.service';
import { WhatsAppSettingsService } from './whatsapp-settings.service';
import { WinstonLoggerService } from '../../logger/logger.service';

export interface SendResult {
  success: boolean;
  channel: 'NUREN' | 'BAILEYS' | 'NONE';
  error?: string;
}

@Injectable()
export class WhatsAppOrchestratorService {
  constructor(
    private readonly nurenService: WhatsAppService,
    private readonly baileysService: BaileysService,
    private readonly logService: BaileysMessageLogService,
    private readonly settingsService: WhatsAppSettingsService,
    private readonly logger: WinstonLoggerService,
  ) { }

  async sendOtp(
    phoneNumber: string,
    otp: string,
  ): Promise<SendResult> {
    const templateName = 'letstryotp';
    const payload = { phoneNumber, otp };

    const fallbackText =
      `🔒 *Your Verification Code*\n\n` +
      `Your Let's Try Foods OTP is: *${otp}*\n\n` +
      `Please do not share this code with anyone.`;

    return this.sendWithFallback(
      phoneNumber,
      templateName,
      payload,
      fallbackText,
      undefined,
      undefined,
      () => this.nurenService.sendOtpTemplate(phoneNumber, otp),
    );
  }

  async sendPaymentConfirmation(
    phoneNumber: string,
    orderId: string,
    amountPaid: string,
    paymentMode: string,
    transactionId: string,
    orderDate: string,
    recipientName?: string,
  ): Promise<SendResult> {
    const templateName = 'paymentconfirm';
    const payload = { phoneNumber, orderId, amountPaid, paymentMode, transactionId, orderDate };

    // Build a readable fallback text message for Baileys
    const fallbackText =
      `✅ *Order Confirmed!*\n\n` +
      `Order ID: ${orderId}\n` +
      `Amount Paid: ₹${amountPaid}\n` +
      `Payment Mode: ${paymentMode}\n` +
      `Transaction ID: ${transactionId}\n` +
      `Date: ${orderDate}\n\n` +
      `Thank you for shopping with Let's Try Foods! 🙏`;

    return this.sendWithFallback(
      phoneNumber,
      templateName,
      payload,
      fallbackText,
      orderId,
      recipientName,
      () => this.nurenService.sendPaymentConfirmation(phoneNumber, orderId, amountPaid, paymentMode, transactionId, orderDate),
    );
  }

  async sendOrderPackedNotification(
    phoneNumber: string,
    orderId: string,
    orderDate: string,
    trackingUrl: string,
    recipientName?: string,
  ): Promise<SendResult> {
    const templateName = 'deliveryutilitymarchtwo';
    const payload = { phoneNumber, orderId, orderDate, trackingUrl };

    const fallbackText =
      `📦 *Your Order is Packed!*\n\n` +
      `Order: ${orderId}\n` +
      `Date: ${orderDate}\n` +
      `Track your order: ${trackingUrl}\n\n` +
      `Let's Try Foods 🚀`;

    return this.sendWithFallback(
      phoneNumber,
      templateName,
      payload,
      fallbackText,
      orderId,
      recipientName,
      () => this.nurenService.sendOrderPackedNotification(phoneNumber, orderId, orderDate, trackingUrl),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Core Orchestration Logic
  // ─────────────────────────────────────────────────────────────────────────

  private async sendWithFallback(
    phoneNumber: string,
    templateName: string,
    payload: object,
    fallbackText: string,
    orderId?: string,
    recipientName?: string,
    primaryFn?: () => Promise<boolean>,
  ): Promise<SendResult> {
    const settings = await this.settingsService.getSettings();

    let primaryAttempted = false;
    let primarySuccess = false;
    let fallbackAttempted = false;
    let fallbackSuccess = false;
    let channel: 'NUREN' | 'BAILEYS' | 'NONE' = 'NONE';
    let errorMessage: string | undefined;
    let skippedLimit = false;

    // ── Step 1: Try nuren.ai (Primary) ──────────────────────────────────────
    if (settings.nurenEnabled && primaryFn) {
      primaryAttempted = true;
      try {
        primarySuccess = await primaryFn();
        if (primarySuccess) {
          channel = 'NUREN';
          this.logger.log(`WhatsApp via nuren.ai success for ${phoneNumber}`, 'WhatsAppOrchestrator');
        } else {
          this.logger.warn(`nuren.ai returned false for ${phoneNumber}`, 'WhatsAppOrchestrator');
        }
      } catch (err) {
        errorMessage = `nuren.ai error: ${err.message}`;
        this.logger.error(errorMessage, 'WhatsAppOrchestrator');
      }
    }

    // ── Step 2: Try Baileys (Fallback) if primary failed ────────────────────
    if (!primarySuccess && settings.baileysEnabled) {
      fallbackAttempted = true;
      const result = await this.baileysService.sendMessage(phoneNumber, fallbackText);

      if (result.skippedLimit) {
        skippedLimit = true;
        errorMessage = result.error;
        this.logger.warn(`Baileys daily limit reached — skipping for ${phoneNumber}`, 'WhatsAppOrchestrator');
      } else if (result.success) {
        fallbackSuccess = true;
        channel = 'BAILEYS';
        this.logger.log(`WhatsApp via Baileys success for ${phoneNumber}`, 'WhatsAppOrchestrator');
      } else {
        errorMessage = result.error;
        this.logger.error(`Baileys also failed for ${phoneNumber}: ${result.error}`, 'WhatsAppOrchestrator');
      }
    }

    // ── Step 3: Determine final status ──────────────────────────────────────
    const overallSuccess = primarySuccess || fallbackSuccess;
    const status = overallSuccess
      ? 'SUCCESS'
      : skippedLimit
        ? 'SKIPPED_LIMIT'
        : fallbackAttempted
          ? 'FAILED'
          : 'NO_FALLBACK';

    // ── Step 4: Log to DB ────────────────────────────────────────────────────
    await this.logService.logMessage({
      phoneNumber,
      recipientName,
      orderId,
      templateName,
      channel,
      status,
      primaryAttempted,
      primarySuccess,
      fallbackAttempted,
      fallbackSuccess,
      errorMessage,
      payload,
    });

    return { success: overallSuccess, channel, error: errorMessage };
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Headers,
  Res,
  HttpCode,
  HttpStatus,
  HttpException,
  Req,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { BaileysService } from './services/baileys.service';
import { BaileysMessageLogService } from './services/baileys-message-log.service';
import { WhatsAppSettingsService } from './services/whatsapp-settings.service';
import { MetaWhatsappService } from './services/meta-whatsapp.service';
import { WhatsAppService } from './whatsapp.service';
import { Public } from '../common/decorators/public.decorator';
import { logWhatsAppEvent } from './logger/whatsapp-file.logger';


@Controller('whatsapp')
export class WhatsAppController {
  private readonly webhookVerifyToken: string;
  private readonly appSecret: string;
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly baileysService: BaileysService,
    private readonly logService: BaileysMessageLogService,
    private readonly settingsService: WhatsAppSettingsService,
    private readonly metaService: MetaWhatsappService,
    private readonly nurenService: WhatsAppService,
    private readonly configService: ConfigService,
    @InjectQueue('whatsapp-inbound-queue') private readonly inboundQueue: Queue,
  ) {
    this.webhookVerifyToken = this.configService.get<string>('metaWhatsapp.webhookVerifyToken') || '';
    this.appSecret = this.configService.get<string>('metaWhatsapp.appSecret') || '';
  }

  // ── Meta Webhook ──────────────────────────────────────────────────────────

  /**
   * GET /whatsapp/webhook
   * Meta hub challenge verification. Must be @Public so JWT guard doesn't block it.
   */
  @Public()
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    logWhatsAppEvent('Webhook Challenge Received', { mode, token, challenge });
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      logWhatsAppEvent('Webhook Challenge Verified Successfully');
      res.status(200).send(challenge);
    } else {
      logWhatsAppEvent('Webhook Challenge Failed', { receivedToken: token, expectedToken: this.webhookVerifyToken });
      res.status(403).send('Forbidden');
    }
  }

  /**
   * POST /whatsapp/webhook
   * Receives inbound messages and delivery status updates from Meta.
   *
   * Design: queue-first pattern.
   * 1. Verify HMAC signature (if app secret is configured).
   * 2. Parse the payload to identify messages vs. status updates.
   * 3. Enqueue each event to `whatsapp-inbound-queue`.
   * 4. Return 200 immediately — Meta will retry if we don't respond within 20s.
   *
   * All heavy lifting (DB writes, socket emits) is done in the BullMQ processor.
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Req() req: Request,
    @Headers('x-hub-signature-256') signature: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    logWhatsAppEvent('Inbound Webhook Payload Received', body);

    // 1. Verify signature if app secret is configured
    if (this.appSecret) {
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        this.logger.warn('rawBody is missing from request, cannot verify HMAC signature');
        res.status(403).json({ error: 'Missing rawBody' });
        return;
      }
      
      const expected = `sha256=${createHmac('sha256', this.appSecret).update(rawBody).digest('hex')}`;
      if (signature !== expected) {
        logWhatsAppEvent('Inbound Webhook Signature Verification Failed', { expected, signature });
        res.status(403).json({ error: 'Invalid signature' });
        return;
      }
      logWhatsAppEvent('Inbound Webhook Signature Verified Successfully');
    }

    // 2. Parse Meta webhook payload
    try {
      const entries = body?.entry ?? [];
      for (const entry of entries) {
        const changes = entry?.changes ?? [];
        for (const change of changes) {
          const value = change?.value;
          if (!value) continue;

          // Inbound messages
          const messages: any[] = value?.messages ?? [];
          for (const msg of messages) {
            const phone = msg?.from;
            const messageId = msg?.id;
            const timestamp = msg?.timestamp
              ? new Date(parseInt(msg.timestamp) * 1000)
              : new Date();
            const text = msg?.text?.body || msg?.caption || msg?.image?.caption || msg?.video?.caption || '[media]';
            const msgType = msg?.type || 'text';
            const mediaId = msg?.image?.id || msg?.video?.id || msg?.audio?.id || msg?.document?.id || null;

            const jobData = {
              type: 'inbound_message',
              messageId,
              phone,
              text,
              timestamp,
              msgType,
              mediaId,
            };

            await this.inboundQueue.add('inbound_message', jobData, {
              attempts: 3,
              backoff: { type: 'exponential', delay: 2000 },
            });
            logWhatsAppEvent('Enqueued Inbound Message Job', jobData);
          }

          // Delivery / read status updates
          const statuses: any[] = value?.statuses ?? [];
          for (const status of statuses) {
            const messageId = status?.id;
            const statusString = status?.status; // sent, delivered, read, failed
            const phone = status?.recipient_id;

            if (messageId && statusString) {
              const jobData = {
                type: 'status_update',
                messageId,
                status: statusString,
                phone,
              };
              await this.inboundQueue.add('status_update', jobData, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
              });
              logWhatsAppEvent('Enqueued Status Update Job', jobData);
            }
          }
        }
      }
    } catch (err) {
      logWhatsAppEvent('Error parsing/enqueueing webhook payload', { error: err.message });
      console.error('[WhatsAppController] Error processing webhook:', err);
    }

    return { status: 'ok' };
  }

  // ── Baileys Connection ───────────────────────────────────────────────────

  @Get('baileys/status')
  async getBaileysStatus() {
    return this.baileysService.getStatus();
  }

  @Post('baileys/connect')
  async connectBaileys() {
    await this.baileysService.connect();
    return { message: 'Baileys connecting — scan QR code' };
  }

  @Post('baileys/disconnect')
  async disconnectBaileys() {
    await this.baileysService.disconnect();
    return { message: 'Baileys disconnected' };
  }

  @Post('baileys/test-message')
  async sendTestMessage(
    @Body('phoneNumber') phoneNumber: string,
    @Body('text') text: string,
  ) {
    if (!phoneNumber || !text) {
      throw new HttpException('phoneNumber and text are required', HttpStatus.BAD_REQUEST);
    }
    const result = await this.baileysService.sendMessage(phoneNumber, text, { isTest: true });
    if (!result.success) {
      throw new HttpException(result.error || 'Failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { message: 'Test message sent successfully' };
  }

  @Post('meta/test-otp')
  async sendMetaTestOtp(@Body('phoneNumber') phoneNumber: string) {
    if (!phoneNumber) throw new HttpException('phoneNumber required', HttpStatus.BAD_REQUEST);
    const success = await this.metaService.sendOtpTemplate(phoneNumber, '1234');
    if (!success) throw new HttpException('Meta API failed', HttpStatus.INTERNAL_SERVER_ERROR);
    return { message: 'Meta OTP sent successfully' };
  }

  @Post('nuren/test-otp')
  async sendNurenTestOtp(@Body('phoneNumber') phoneNumber: string) {
    if (!phoneNumber) throw new HttpException('phoneNumber required', HttpStatus.BAD_REQUEST);
    const success = await this.nurenService.sendOtpTemplate(phoneNumber, '1234');
    if (!success) throw new HttpException('Nuren API failed', HttpStatus.INTERNAL_SERVER_ERROR);
    return { message: 'Nuren OTP sent successfully' };
  }

  @Post('meta/send-template')
  async sendMetaTemplate(
    @Body('phoneNumber') phoneNumber: string,
    @Body('templateName') templateName: string,
    @Body('languageCode') languageCode: string,
    @Body('components') components: any[],
  ) {
    if (!phoneNumber) throw new HttpException('phoneNumber is required', HttpStatus.BAD_REQUEST);
    if (!templateName) throw new HttpException('templateName is required', HttpStatus.BAD_REQUEST);
    const result = await this.metaService.sendGenericTemplate(
      phoneNumber,
      templateName,
      languageCode || 'en_US',
      components || [],
    );
    if (!result.success) {
      throw new HttpException(
        { message: 'Meta API failed', metaError: result.error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: `Template "${templateName}" sent successfully to ${phoneNumber}` };
  }

  // ── Logs ─────────────────────────────────────────────────────────────────

  @Get('logs')
  async getLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('orderId') orderId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.logService.getLogs(
      {
        status,
        channel,
        orderId,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      },
      parseInt(page),
      parseInt(limit),
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  @Get('stats')
  async getStats(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const last7Start = new Date(today);
    last7Start.setDate(last7Start.getDate() - 6);

    const [todayStats, last7Stats, baileysStatus, settings] = await Promise.all([
      this.logService.getStats(today, tomorrow),
      this.logService.getStats(
        from ? new Date(from) : last7Start,
        to ? new Date(to) : tomorrow,
      ),
      this.baileysService.getStatus(),
      this.settingsService.getSettings(),
    ]);

    return {
      today: {
        ...todayStats,
        baileysLimit: settings.baileysDailyLimit,
        baileysUsedToday: baileysStatus.dailyCount,
      },
      period: last7Stats,
      baileys: {
        connectionStatus: baileysStatus.connectionStatus,
        phoneConnected: baileysStatus.phoneConnected,
        needsRescan: baileysStatus.needsRescan,
        disconnectReason: baileysStatus.disconnectReason,
        dailyCount: baileysStatus.dailyCount,
        dailyLimit: baileysStatus.dailyLimit,
      },
    };
  }

  // ── Settings ─────────────────────────────────────────────────────────────

  @Get('settings')
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch('settings')
  async updateSettings(
    @Body()
    body: {
      baileysDailyLimit?: number;
      baileysEnabled?: boolean;
      nurenEnabled?: boolean;
    },
  ) {
    if (
      body.baileysDailyLimit !== undefined &&
      (body.baileysDailyLimit < 1 || body.baileysDailyLimit > 100)
    ) {
      throw new HttpException(
        'dailyLimit must be between 1 and 100',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.settingsService.updateSettings(body);
  }
}

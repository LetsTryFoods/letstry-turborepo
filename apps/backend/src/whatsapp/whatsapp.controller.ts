import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaileysService } from './services/baileys.service';
import { BaileysMessageLogService } from './services/baileys-message-log.service';
import { WhatsAppSettingsService } from './services/whatsapp-settings.service';
import { MetaWhatsappService } from './services/meta-whatsapp.service';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly baileysService: BaileysService,
    private readonly logService: BaileysMessageLogService,
    private readonly settingsService: WhatsAppSettingsService,
    private readonly metaService: MetaWhatsappService,
    private readonly nurenService: WhatsAppService,
  ) { }

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
    const success = await this.metaService.sendGenericTemplate(
      phoneNumber,
      templateName,
      languageCode || 'en_US',
      components || [],
    );
    if (!success) throw new HttpException('Meta API failed — check template name, language code, and parameters', HttpStatus.INTERNAL_SERVER_ERROR);
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

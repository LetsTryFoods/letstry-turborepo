import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  makeWASocket,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  initAuthCreds,
  BufferJSON,
  Browsers,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import {
  BaileysSession,
  BaileysSessionDocument,
} from '../schemas/baileys-session.schema';
import { WinstonLoggerService } from '../../logger/logger.service';
import { WhatsAppSettingsService } from './whatsapp-settings.service';

@Injectable()
export class BaileysService implements OnModuleInit, OnModuleDestroy {
  private sock: any = null;
  private qrCodeBase64: string | null = null;
  private connectionStatus: 'disconnected' | 'qr_pending' | 'connected' =
    'disconnected';

  constructor(
    @InjectModel(BaileysSession.name)
    private sessionModel: Model<BaileysSessionDocument>,
    private readonly logger: WinstonLoggerService,
    private readonly settingsService: WhatsAppSettingsService,
  ) { }

  async onModuleInit() {
    // Auto-connect on startup if we have a saved session
    const session = await this.sessionModel.findOne({ sessionId: 'default' });
    if (session?.creds) {
      this.logger.log('Saved Baileys session found — auto-connecting', 'BaileysService');
      await this.connect();
    } else {
      this.logger.log('No Baileys session found — waiting for QR scan', 'BaileysService');
    }
  }

  async onModuleDestroy() {
    if (this.sock) {
      // Use end() NOT logout() — logout deletes the WhatsApp session permanently.
      // end() just closes the WebSocket cleanly so it can reconnect on next startup.
      this.sock.end(undefined);
      this.sock = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Connection Management
  // ─────────────────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    if (this.sock) {
      this.logger.log('Closing existing Baileys socket before reconnect', 'BaileysService');
      this.sock.end();
      this.sock = null;
    }

    // If the session was marked as needing a rescan, clear old creds so a new QR is generated
    const sessionForCheck = await this.sessionModel.findOne({ sessionId: 'default' });
    if (sessionForCheck?.needsRescan) {
      this.logger.log('Session needs rescan — clearing old credentials', 'BaileysService');
      await this.sessionModel.findOneAndUpdate(
        { sessionId: 'default' },
        { $unset: { creds: "", keys: "" } }
      );
    }

    const authState = await this.loadAuthState();

    const sock = makeWASocket({
      auth: {
        creds: authState.creds,
        keys: makeCacheableSignalKeyStore(authState.keys as any, undefined as any),
      },
      browser: Browsers.macOS('Chrome'),
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
    });

    this.sock = sock;

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.connectionStatus = 'qr_pending';
        this.qrCodeBase64 = await QRCode.toDataURL(qr);
        this.logger.log('Baileys QR code generated — waiting for scan', 'BaileysService');

        // Mark needsRescan in DB
        await this.sessionModel.findOneAndUpdate(
          { sessionId: 'default' },
          { needsRescan: true, isActive: false, lastRescanPromptAt: new Date() },
          { upsert: true },
        );
      }

      if (connection === 'open') {
        this.connectionStatus = 'connected';
        this.qrCodeBase64 = null;
        const phoneNumber = sock.user?.id?.split(':')[0] || 'unknown';

        this.logger.log(
          `Baileys connected — phone: ${phoneNumber}`,
          'BaileysService',
        );

        await this.saveAuthState(authState);
        await this.sessionModel.findOneAndUpdate(
          { sessionId: 'default' },
          {
            isActive: true,
            needsRescan: false,
            phoneConnected: phoneNumber,
            connectedAt: new Date(),
            disconnectReason: null,
          },
          { upsert: true },
        );
      }
      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const reason = DisconnectReason[statusCode] || `code_${statusCode}`;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        this.logger.warn(
          `Baileys disconnected — reason: ${reason}, reconnect: ${shouldReconnect}`,
          'BaileysService',
        );

        this.connectionStatus = 'disconnected';
        this.sock = null;

        await this.sessionModel.findOneAndUpdate(
          { sessionId: 'default' },
          {
            isActive: false,
            disconnectReason: reason,
            needsRescan: !shouldReconnect, // logged out = needs rescan
          },
          { upsert: true },
        );

        if (shouldReconnect) {
          this.logger.log('Auto-reconnecting Baileys...', 'BaileysService');
          setTimeout(() => this.connect(), 5000);
        } else {
          this.logger.warn(
            'Baileys logged out — manual QR re-scan required',
            'BaileysService',
          );
        }
      }
    });

    sock.ev.on('creds.update', async () => {
      // Save the latest creds directly from the socket's auth state
      await this.sessionModel.findOneAndUpdate(
        { sessionId: 'default' },
        { creds: JSON.stringify(sock.authState.creds, BufferJSON.replacer) },
        { upsert: true },
      );
    });
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      // end() closes the local connection cleanly without revoking the WhatsApp session.
      // Call logout() only if you want to force the user to scan QR again.
      this.sock.end(undefined);
      this.sock = null;
    }
    this.connectionStatus = 'disconnected';
    await this.sessionModel.findOneAndUpdate(
      { sessionId: 'default' },
      { isActive: false, disconnectReason: 'manual_disconnect' },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Send Message (with daily limit check)
  // ─────────────────────────────────────────────────────────────────────────

  async sendMessage(
    phoneNumber: string,
    text: string,
    options?: { isTest?: boolean },
  ): Promise<{ success: boolean; error?: string; skippedLimit?: boolean }> {
    if (this.connectionStatus !== 'connected' || !this.sock) {
      return { success: false, error: 'Baileys not connected' };
    }

    // Check daily limit unless it's a test message
    if (!options?.isTest) {
      const limitCheck = await this.checkAndIncrementDailyLimit();
      if (!limitCheck.allowed) {
        return {
          success: false,
          skippedLimit: true,
          error: `Daily Baileys limit reached (${limitCheck.limit}/day)`,
        };
      }
    }

    try {
      const jid = `${phoneNumber}@s.whatsapp.net`;
      await this.sock.sendMessage(jid, { text });

      await this.sessionModel.findOneAndUpdate(
        { sessionId: 'default' },
        { lastMessageAt: new Date() },
      );

      this.logger.log(
        `Baileys message sent to ${phoneNumber}`,
        'BaileysService',
      );
      return { success: true };
    } catch (err) {
      this.logger.error(
        `Baileys send failed: ${err.message}`,
        'BaileysService',
      );
      return { success: false, error: err.message };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Status & QR
  // ─────────────────────────────────────────────────────────────────────────

  async getStatus() {
    const session = await this.sessionModel
      .findOne({ sessionId: 'default' })
      .lean();
    const dailyLimit = await this.settingsService.getDailyLimit();

    return {
      connectionStatus: this.connectionStatus,
      qrCodeBase64: this.qrCodeBase64,
      phoneConnected: session?.phoneConnected,
      connectedAt: session?.connectedAt,
      lastMessageAt: session?.lastMessageAt,
      needsRescan: session?.needsRescan || false,
      disconnectReason: session?.disconnectReason,
      dailyCount: session?.dailyCount || 0,
      dailyLimit,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private async checkAndIncrementDailyLimit(): Promise<{
    allowed: boolean;
    limit: number;
  }> {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const limit = await this.settingsService.getDailyLimit();

    const session = await this.sessionModel.findOne({ sessionId: 'default' });

    // Reset counter if date changed
    if (!session || session.dailyCountDate !== today) {
      await this.sessionModel.findOneAndUpdate(
        { sessionId: 'default' },
        { dailyCount: 1, dailyCountDate: today },
        { upsert: true },
      );
      return { allowed: true, limit };
    }

    if (session.dailyCount >= limit) {
      return { allowed: false, limit };
    }

    await this.sessionModel.findOneAndUpdate(
      { sessionId: 'default' },
      { $inc: { dailyCount: 1 } },
    );

    return { allowed: true, limit };
  }

  private async loadAuthState(): Promise<any> {
    const session = await this.sessionModel.findOne({ sessionId: 'default' });

    // Build an in-memory auth state compatible with Baileys
    const creds = session?.creds
      ? JSON.parse(session.creds, BufferJSON.reviver)
      : initAuthCreds();

    let keysData = {};
    if (session?.keys) {
      try {
        keysData = typeof session.keys === 'string'
          ? JSON.parse(session.keys, BufferJSON.reviver)
          : session.keys;
      } catch (err) {
        this.logger.warn('Failed to parse Baileys keys from DB, starting fresh', 'BaileysService');
      }
    }

    const keys = {
      get: async (type: string, ids: string[]) => {
        const result: Record<string, any> = {};
        ids.forEach((id) => {
          const key = `${type}-${id}`;
          if (keysData[key]) result[id] = keysData[key];
        });
        return result;
      },
      set: async (data: Record<string, any>) => {
        const updates: Record<string, any> = { ...keysData };
        for (const [type, values] of Object.entries(data)) {
          for (const [id, value] of Object.entries(values as any)) {
            updates[`${type}-${id}`] = value;
          }
        }
        await this.sessionModel.findOneAndUpdate(
          { sessionId: 'default' },
          { keys: JSON.stringify(updates, BufferJSON.replacer) },
          { upsert: true },
        );
        Object.assign(keysData, updates);
      },
    };

    return { creds, keys };
  }

  private async saveAuthState(authState: any): Promise<void> {
    await this.sessionModel.findOneAndUpdate(
      { sessionId: 'default' },
      { creds: JSON.stringify(authState.creds, BufferJSON.replacer) },
      { upsert: true },
    );
  }
}

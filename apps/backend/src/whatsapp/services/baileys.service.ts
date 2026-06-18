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
import { IWhatsAppProvider, IncomingWhatsAppMessage } from '../interfaces/whatsapp-provider.interface';
import { WhatsAppMessageType } from '../schemas/whatsapp-message.schema';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

@Injectable()
export class BaileysService implements OnModuleInit, OnModuleDestroy, IWhatsAppProvider {
  private sock: any = null;
  private qrCodeBase64: string | null = null;
  private connectionStatus: 'disconnected' | 'qr_pending' | 'connected' =
    'disconnected';
  private onMessageCallback?: (msg: IncomingWhatsAppMessage) => Promise<void>;
  
  private keysSaveTimeout: NodeJS.Timeout | null = null;
  private credsSaveTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isReconnecting = false;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;

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
      this.logger.log('Closing existing Baileys socket before reconnect (preventing zombie sockets)', 'BaileysService');
      try {
        if (this.sock.ws?.isOpen) {
          this.sock.ws.close();
        }
        this.sock.end(new Error('reconnect'));
      } catch (e) {}
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

    sock.ev.on('messages.upsert', async (m: any) => {
      if (this.onMessageCallback && m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.message || msg.key.fromMe) continue;
          await this.handleIncomingMessage(msg);
        }
      }
    });

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.connectionStatus = 'qr_pending';
        this.qrCodeBase64 = await QRCode.toDataURL(qr);
        this.logger.log('Baileys QR code generated — waiting for scan', 'BaileysService');
        this.reconnectAttempts = 0;

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
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        if (this.reconnectTimeoutId) {
          clearTimeout(this.reconnectTimeoutId);
          this.reconnectTimeoutId = null;
        }

        const phoneNumber = sock.user?.id?.split(':')[0] || 'unknown';

        this.logger.log(
          `Baileys connected — phone: ${phoneNumber}`,
          'BaileysService',
        );

        this.queueCredsSave();
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
        const error = lastDisconnect?.error as Boom;
        const statusCode = error?.output?.statusCode;
        const reason = DisconnectReason[statusCode] || `code_${statusCode}`;

        this.logger.warn(
          `Baileys disconnected — reason: ${reason} (code: ${statusCode})`,
          'BaileysService',
        );

        this.connectionStatus = 'disconnected';
        
        try {
          if (this.sock?.ws?.isOpen) this.sock.ws.close();
          this.sock?.end(new Error('reconnecting'));
        } catch (e) {}
        this.sock = null;

        // 1. Logged Out / Unauthorized (401)
        if (statusCode === DisconnectReason.loggedOut) {
          this.logger.error('Baileys logged out — clearing credentials and waiting for QR re-scan.', 'BaileysService');
          await this.sessionModel.findOneAndUpdate(
            { sessionId: 'default' },
            { $unset: { creds: "", keys: "" }, isActive: false, disconnectReason: reason, needsRescan: true },
            { upsert: true }
          );
          this.isReconnecting = false;
          // Trigger a new connect to generate a fresh QR code
          this.reconnectTimeoutId = setTimeout(() => this.connect(), 2000);
          return;
        }

        // 2. Forbidden (403)
        if (statusCode === 403) {
          this.logger.error('Baileys connection forbidden (403) — stopping reconnect to avoid ban.', 'BaileysService');
          this.isReconnecting = false;
          return;
        }

        // 3. Restart Required or generic drop
        if (!this.isReconnecting) {
          this.isReconnecting = true;
          
          const isRestartRequired = statusCode === DisconnectReason.restartRequired;
          const maxDelay = 60000;
          
          // Exponential backoff: 2s, 3s, 4.5s, ... capped at 60s
          let delayMs = isRestartRequired ? 1500 : Math.min(2000 * Math.pow(1.5, this.reconnectAttempts), maxDelay);
          
          // Give up if we fail continuously without any success (prevents infinite loop ban)
          if (this.reconnectAttempts > 15) {
            this.logger.error('Max Baileys reconnection attempts reached. Halting reconnections.', 'BaileysService');
            this.isReconnecting = false;
            return;
          }

          this.reconnectAttempts++;
          this.logger.log(`Auto-reconnecting Baileys in ${delayMs / 1000}s... (Attempt ${this.reconnectAttempts})`, 'BaileysService');
          
          if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
          this.reconnectTimeoutId = setTimeout(() => {
            this.connect();
          }, delayMs);
        }
      }
    });

    sock.ev.on('creds.update', () => {
      this.queueCredsSave();
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

  onMessage(callback: (msg: IncomingWhatsAppMessage) => Promise<void>): void {
    this.onMessageCallback = callback;
  }

  private async handleIncomingMessage(msg: any): Promise<void> {
    try {
      const jid = msg.key.remoteJid;
      if (!jid || jid.includes('@g.us')) return; // Ignore groups for now
      const phoneNumber = jid.split('@')[0];

      let type: WhatsAppMessageType = WhatsAppMessageType.TEXT;
      let content = '';
      let mediaBuffer: Buffer | undefined;
      let mediaFileName: string | undefined;

      const messageContent = msg.message;

      if (messageContent.conversation || messageContent.extendedTextMessage) {
        type = WhatsAppMessageType.TEXT;
        content = messageContent.conversation || messageContent.extendedTextMessage.text;
      } else if (messageContent.imageMessage) {
        type = WhatsAppMessageType.IMAGE;
        content = messageContent.imageMessage.caption || '';
        mediaBuffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: this.logger as any, reuploadRequest: this.sock.updateMediaMessage });
        mediaFileName = `image-${Date.now()}.jpeg`; // WhatsApp images are usually jpeg
      } else if (messageContent.videoMessage) {
        type = WhatsAppMessageType.VIDEO;
        content = messageContent.videoMessage.caption || '';
        mediaBuffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: this.logger as any, reuploadRequest: this.sock.updateMediaMessage });
        mediaFileName = `video-${Date.now()}.mp4`; 
      } else if (messageContent.audioMessage) {
        type = WhatsAppMessageType.AUDIO;
        mediaBuffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: this.logger as any, reuploadRequest: this.sock.updateMediaMessage });
        mediaFileName = `audio-${Date.now()}.${messageContent.audioMessage.mimetype?.includes('ogg') ? 'ogg' : 'mp3'}`;
      } else if (messageContent.documentMessage) {
        type = WhatsAppMessageType.DOCUMENT;
        content = messageContent.documentMessage.caption || messageContent.documentMessage.fileName || '';
        mediaBuffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: this.logger as any, reuploadRequest: this.sock.updateMediaMessage });
        mediaFileName = messageContent.documentMessage.fileName || `doc-${Date.now()}.bin`;
      } else {
        type = WhatsAppMessageType.OTHER;
        content = '[Unsupported Message Type]';
      }

      const incomingMsg: IncomingWhatsAppMessage = {
        messageId: msg.key.id,
        phoneNumber,
        content,
        type,
        timestamp: new Date((msg.messageTimestamp as number) * 1000),
        mediaBuffer,
        mediaFileName,
      };

      if (this.onMessageCallback) {
        await this.onMessageCallback(incomingMsg);
      }
    } catch (err) {
      this.logger.error(`Error processing incoming Baileys message: ${err.message}`, 'BaileysService');
    }
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
      const normalized = this.normalizePhoneNumber(phoneNumber);
      const jid = `${normalized}@s.whatsapp.net`;
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
          if (keysData[key] !== undefined && keysData[key] !== null) {
            result[id] = keysData[key];
          }
        });
        return result;
      },
      set: async (data: Record<string, any>) => {
        for (const [type, values] of Object.entries(data)) {
          for (const [id, value] of Object.entries(values as any)) {
            const key = `${type}-${id}`;
            if (value === null || value === undefined) {
              delete keysData[key];
            } else {
              keysData[key] = value;
            }
          }
        }
        this.queueKeysSave(keysData);
      },
    };

    return { creds, keys };
  }

  /**
   * Normalize a phone number to E.164 format (digits only, with country code).
   * - Strips spaces, dashes, +, parentheses
   * - If the number is 10 digits (Indian mobile), prepends '91'
   * - If already has 91 prefix (12 digits), leaves as-is
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Indian mobile: 10 digits → prepend 91
    if (digits.length === 10) {
      return `91${digits}`;
    }
    // Already has country code (e.g. 918840330283 = 12 digits)
    return digits;
  }

  private queueKeysSave(keysData: any) {
    if (this.keysSaveTimeout) clearTimeout(this.keysSaveTimeout);
    this.keysSaveTimeout = setTimeout(async () => {
      try {
        await this.sessionModel.findOneAndUpdate(
          { sessionId: 'default' },
          { keys: JSON.stringify(keysData, BufferJSON.replacer) },
          { upsert: true },
        );
      } catch (err) {
        this.logger.error(`Error saving Baileys keys: ${err.message}`, 'BaileysService');
      }
    }, 2000);
  }

  private queueCredsSave() {
    if (this.credsSaveTimeout) clearTimeout(this.credsSaveTimeout);
    this.credsSaveTimeout = setTimeout(async () => {
      if (!this.sock?.authState?.creds) return;
      try {
        await this.sessionModel.findOneAndUpdate(
          { sessionId: 'default' },
          { creds: JSON.stringify(this.sock.authState.creds, BufferJSON.replacer) },
          { upsert: true },
        );
      } catch (err) {
        this.logger.error(`Error saving Baileys creds: ${err.message}`, 'BaileysService');
      }
    }, 2000);
  }
}

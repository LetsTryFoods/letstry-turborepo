import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WhatsAppChat, WhatsAppChatDocument, WhatsAppChatStatus } from '../schemas/whatsapp-chat.schema';
import { WhatsAppMessage, WhatsAppMessageDocument, WhatsAppMessageDirection } from '../schemas/whatsapp-message.schema';
import { IncomingWhatsAppMessage } from '../interfaces/whatsapp-provider.interface';
import { UploadService } from '../../upload/upload.service';
import { BaileysService } from './baileys.service';
import * as crypto from 'crypto';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class WhatsAppChatService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppChatService.name);

  constructor(
    @InjectModel(WhatsAppChat.name)
    private readonly chatModel: Model<WhatsAppChatDocument>,
    @InjectModel(WhatsAppMessage.name)
    private readonly messageModel: Model<WhatsAppMessageDocument>,
    private readonly uploadService: UploadService,
    private readonly baileysService: BaileysService,
  ) {}

  onModuleInit() {
    this.baileysService.onMessage(this.handleIncomingMessage.bind(this));
  }

  async handleIncomingMessage(msg: IncomingWhatsAppMessage): Promise<void> {
    try {
      this.logger.log(`[DEBUG][ChatService] handleIncomingMessage called \u2014 phone: ${msg.phoneNumber}, type: ${msg.type}, content: "${msg.content}"`);

      // 1. Find the most recently active OPEN chat for this phone number
      let chat = await this.chatModel.findOne({
        phoneNumber: msg.phoneNumber,
        status: WhatsAppChatStatus.OPEN,
      }).sort({ updatedAt: -1 });

      if (!chat) {
        this.logger.warn(`[DEBUG][ChatService] No OPEN chat found for ${msg.phoneNumber} \u2014 creating orphan chat`);
        chat = await this.chatModel.create({
          phoneNumber: msg.phoneNumber,
          status: WhatsAppChatStatus.OPEN,
        });
        this.logger.log(`[DEBUG][ChatService] Created orphan chat: ${chat._id} for phone: ${msg.phoneNumber}`);
      } else {
        this.logger.log(`[DEBUG][ChatService] Found existing chat: ${chat._id} for phone: ${msg.phoneNumber}`);
      }

      // 2. Handle Media Upload
      let mediaUrl: string | undefined;
      if (msg.mediaBuffer && msg.mediaFileName) {
        const uid = crypto.randomBytes(16).toString('hex');
        const extension = msg.mediaFileName.includes('.')
          ? msg.mediaFileName.substring(msg.mediaFileName.lastIndexOf('.'))
          : '';
        const key = `whatsapp/${chat._id}/${uid}${extension}`;

        await this.uploadService.uploadFile(key, msg.mediaBuffer, msg.mediaFileName);
        
        const finalKey = (this.uploadService.isImageFile(this.uploadService.getContentTypeFromExtension(msg.mediaFileName)) && extension !== '.gif')
          ? key.replace(/\.[^.]+$/, '.webp')
          : key;

        mediaUrl = this.uploadService.getCloudFrontUrl(finalKey);
      }

      // 3. Save the Message
      const message = new this.messageModel({
        chatId: chat._id,
        messageId: msg.messageId,
        direction: WhatsAppMessageDirection.INCOMING,
        type: msg.type,
        content: msg.content,
        mediaUrl,
        timestamp: msg.timestamp || new Date(),
      });

      await message.save();
      this.logger.log(`[DEBUG][ChatService] \u2705 Saved incoming message ${message._id} for chat ${chat._id}`);

      // 4. Update the Chat
      chat.lastMessageAt = new Date();
      await chat.save();
    } catch (error) {
      this.logger.error(`[DEBUG][ChatService] \u274c Error handling incoming message: ${error.message}`, error.stack);
    }
  }


  async getChatHistoryByPhone(phoneNumber: string): Promise<{ chat: WhatsAppChatDocument | null, messages: WhatsAppMessageDocument[] }> {
    // Get the most recent chat, even if closed, to show history
    const chat = await this.chatModel.findOne({ phoneNumber }).sort({ updatedAt: -1 });
    if (!chat) return { chat: null, messages: [] };

    const messages = await this.messageModel.find({ chatId: chat._id }).sort({ timestamp: 1 });
    return { chat, messages };
  }

  async saveOutgoingMessage(phoneNumber: string, content: string, messageId?: string, type: any = 'TEXT', contactId?: string): Promise<WhatsAppMessageDocument> {
    let chat = await this.chatModel.findOne({
      phoneNumber,
      status: WhatsAppChatStatus.OPEN,
    }).sort({ updatedAt: -1 });

    if (!chat) {
      this.logger.log(`No open chat found for ${phoneNumber}, creating a new one to log outgoing message.`);
      chat = await this.chatModel.create({
        phoneNumber,
        status: WhatsAppChatStatus.OPEN,
        contactId,
      });
    } else if (!chat.contactId && contactId) {
      chat.contactId = contactId as any;
      await chat.save();
    }

    const message = await this.messageModel.create({
      chatId: chat._id,
      messageId,
      direction: WhatsAppMessageDirection.OUTGOING,
      type,
      content,
      timestamp: new Date(),
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    return message;
  }
}

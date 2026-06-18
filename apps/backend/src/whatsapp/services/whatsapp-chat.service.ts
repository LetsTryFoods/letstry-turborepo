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
      // 1. Find the most recently active OPEN chat for this phone number
      let chat = await this.chatModel.findOne({
        phoneNumber: msg.phoneNumber,
        status: WhatsAppChatStatus.OPEN,
      }).sort({ updatedAt: -1 });

      if (!chat) {
        this.logger.warn(`Received message for ${msg.phoneNumber} but no OPEN chat found. Logging as unattached message.`);
        // For now, we will drop or create a generic chat without contactId?
        // Let's create an orphaned chat so we don't lose the message.
        // Or actually, the plan says it must be linked. But what if they just text us?
        // We can create a chat without a contactId if they initiate the conversation.
        chat = await this.chatModel.create({
          phoneNumber: msg.phoneNumber,
          status: WhatsAppChatStatus.OPEN,
          // contactId: undefined (orphan chat)
        });
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
        
        // If uploadService converts to webp, the key might change. Let's assume we just use the final URL format.
        // Actually uploadService handles .webp conversion. If it converts, the cloudfront URL will end in .webp
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

      // 4. Update the Chat
      chat.lastMessageAt = new Date();
      await chat.save();

      this.logger.log(`Saved incoming message for chat ${chat._id}`);
    } catch (error) {
      this.logger.error(`Error handling incoming message: ${error.message}`, error.stack);
    }
  }

  async getChatHistoryByPhone(phoneNumber: string): Promise<{ chat: WhatsAppChatDocument, messages: WhatsAppMessageDocument[] }> {
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

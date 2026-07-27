import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WhatsAppChatService } from './services/whatsapp-chat.service';
import { MetaWhatsappService } from './services/meta-whatsapp.service';
import { UploadService } from '../upload/upload.service';
import * as crypto from 'crypto';

// Normalize phone: strip leading 91 for 12-digit Indian numbers → 10-digit
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}

@Controller('whatsapp-chat')
export class WhatsAppChatController {
  constructor(
    private readonly chatService: WhatsAppChatService,
    private readonly metaService: MetaWhatsappService,
    private readonly uploadService: UploadService,
  ) {}

  @Get(':phoneNumber')
  async getChatHistory(@Param('phoneNumber') phoneNumber: string) {
    const { chat, messages } = await this.chatService.getChatHistoryByPhone(
      normalizePhone(phoneNumber),
    );
    return { chat, messages };
  }

  @Post(':phoneNumber/send')
  async sendMessage(
    @Param('phoneNumber') phoneNumber: string,
    @Body('message') messageText: string,
    @Body('contactId') contactId?: string,
  ) {
    const normalized = normalizePhone(phoneNumber);
    const result = await this.metaService.sendFreeText(
      normalized,
      messageText,
    );

    if (result.success) {
      const dbMessage = await this.chatService.saveOutgoingMessage(
        normalized,
        messageText,
        result.messageId || undefined,
        'TEXT',
        contactId,
      );
      return { success: true, message: dbMessage };
    }

    return { success: false, error: result.error };
  }

  @Post(':phoneNumber/send-media')
  @UseInterceptors(FileInterceptor('file'))
  async sendMedia(
    @Param('phoneNumber') phoneNumber: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
    @Body('contactId') contactId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No media file provided');
    }

    const normalized = normalizePhone(phoneNumber);

    // 1. Upload file to CloudFront / S3 via UploadService
    const uid = crypto.randomBytes(16).toString('hex');
    const extension = file.originalname.includes('.')
      ? file.originalname.substring(file.originalname.lastIndexOf('.'))
      : '';
    const key = `whatsapp/chat-outgoing/${uid}${extension}`;

    await this.uploadService.uploadFile(key, file.buffer, file.originalname);

    const finalKey =
      this.uploadService.isImageFile(
        this.uploadService.getContentTypeFromExtension(file.originalname),
      ) && extension !== '.gif'
        ? key.replace(/\.[^.]+$/, '.webp')
        : key;

    const mediaUrl = this.uploadService.getCloudFrontUrl(finalKey);

    // 2. Send via Meta WhatsApp Service
    const result = await this.metaService.sendImage(
      normalized,
      mediaUrl,
      caption || '',
    );

    if (result.success) {
      const isImage = file.mimetype.startsWith('image');
      const messageType = isImage ? 'IMAGE' : 'DOCUMENT';

      const dbMessage = await this.chatService.saveOutgoingMessage(
        normalized,
        caption || '',
        result.messageId || undefined,
        messageType,
        contactId,
        mediaUrl,
      );
      return { success: true, message: dbMessage, mediaUrl };
    }

    return { success: false, error: result.error };
  }
}

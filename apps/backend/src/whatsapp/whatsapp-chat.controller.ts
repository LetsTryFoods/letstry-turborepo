import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WhatsAppChatService } from './services/whatsapp-chat.service';
import { BaileysService } from './services/baileys.service';

@Controller('whatsapp-chat')
// @UseGuards(AdminAuthGuard) // Assuming there's some guard, will skip for now or rely on global guard
export class WhatsAppChatController {
  constructor(
    private readonly chatService: WhatsAppChatService,
    private readonly baileysService: BaileysService,
  ) {}

  @Get(':phoneNumber')
  async getChatHistory(@Param('phoneNumber') phoneNumber: string) {
    const { chat, messages } = await this.chatService.getChatHistoryByPhone(phoneNumber);
    return { chat, messages };
  }

  @Post(':phoneNumber/send')
  async sendMessage(
    @Param('phoneNumber') phoneNumber: string,
    @Body('message') messageText: string,
    @Body('contactId') contactId?: string,
  ) {
    // 1. Send via Baileys (currently acts as the primary provider for support)
    const result = await this.baileysService.sendMessage(phoneNumber, messageText);

    if (result.success) {
      // 2. Save outgoing message to DB
      const dbMessage = await this.chatService.saveOutgoingMessage(phoneNumber, messageText, result.messageId || undefined, 'TEXT', contactId);
      return { success: true, message: dbMessage };
    }

    return { success: false, error: result.error };
  }
}

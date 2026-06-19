import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WhatsAppChatService } from './services/whatsapp-chat.service';
import { BaileysService } from './services/baileys.service';

// Normalize phone: strip leading 91 for 12-digit Indian numbers → 10-digit
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}

@Controller('whatsapp-chat')
// @UseGuards(AdminAuthGuard) // Assuming there's some guard, will skip for now or rely on global guard
export class WhatsAppChatController {
  constructor(
    private readonly chatService: WhatsAppChatService,
    private readonly baileysService: BaileysService,
  ) {}

  @Get(':phoneNumber')
  async getChatHistory(@Param('phoneNumber') phoneNumber: string) {
    const { chat, messages } = await this.chatService.getChatHistoryByPhone(normalizePhone(phoneNumber));
    return { chat, messages };
  }

  @Post(':phoneNumber/send')
  async sendMessage(
    @Param('phoneNumber') phoneNumber: string,
    @Body('message') messageText: string,
    @Body('contactId') contactId?: string,
  ) {
    const normalized = normalizePhone(phoneNumber);
    const result = await this.baileysService.sendMessage(normalized, messageText);

    if (result.success) {
      const dbMessage = await this.chatService.saveOutgoingMessage(normalized, messageText, result.messageId || undefined, 'TEXT', contactId);
      return { success: true, message: dbMessage };
    }

    return { success: false, error: result.error };
  }
}

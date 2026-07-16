import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ContactWhatsAppService } from './services/contact-whatsapp.service';

/**
 * REST endpoints for admin panel WhatsApp chat interactions.
 * All routes are authenticated via global JWT guard.
 *
 * Base: /contact-support
 */
@Controller('contact-support')
export class ContactWhatsAppController {
  constructor(
    private readonly contactWhatsAppService: ContactWhatsAppService,
  ) {}

  /**
   * GET /contact-support
   * Paginated list of contact queries that have WhatsApp activity.
   * Sorted by most recent window expiry (active sessions first).
   */
  @Get()
  async list(
    @Query('skip') skip = '0',
    @Query('limit') limit = '50',
  ) {
    return this.contactWhatsAppService.listWithWhatsApp(
      parseInt(skip),
      parseInt(limit),
    );
  }

  /**
   * GET /contact-support/:id/conversation
   * Returns the WhatsApp chat + messages for a given contact query.
   * Also returns windowOpen status and windowExpiresAt for the UI badge.
   */
  @Get(':id/conversation')
  async getConversation(@Param('id') id: string) {
    try {
      return await this.contactWhatsAppService.getConversation(id);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * POST /contact-support/:id/send-ack
   * (Re-)sends the customersupporttemplate ack to the customer.
   * Useful if the first auto-send failed or to re-open a session.
   */
  @Post(':id/send-ack')
  async sendAck(
    @Param('id') id: string,
    @Body('phone') phone: string,
    @Body('name') name: string,
  ) {
    if (!phone || !name) {
      throw new HttpException('phone and name are required', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.contactWhatsAppService.sendAckTemplate(id, phone, name);
      return { success: true, message: 'Ack template sent' };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /contact-support/:id/send-free-text
   * Sends a free-form text reply. Only allowed when the 24h window is open.
   * Returns 400 if window has expired.
   */
  @Post(':id/send-free-text')
  async sendFreeText(
    @Param('id') id: string,
    @Body('text') text: string,
  ) {
    if (!text?.trim()) {
      throw new HttpException('text is required', HttpStatus.BAD_REQUEST);
    }
    try {
      const message = await this.contactWhatsAppService.sendFreeText(id, text);
      return { success: true, message };
    } catch (err) {
      const status = err.status || HttpStatus.BAD_REQUEST;
      throw new HttpException(err.message, status);
    }
  }

  /**
   * POST /contact-support/:id/send-template
   * Sends any approved template to the customer. Always allowed (no window check).
   */
  @Post(':id/send-template')
  async sendTemplate(
    @Param('id') id: string,
    @Body('templateName') templateName: string,
    @Body('components') components: any[],
    @Body('languageCode') languageCode?: string,
  ) {
    if (!templateName) {
      throw new HttpException('templateName is required', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.contactWhatsAppService.sendTemplate(
        id,
        templateName,
        components || [],
        languageCode || 'en',
      );
      return { success: true, message: `Template "${templateName}" sent` };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

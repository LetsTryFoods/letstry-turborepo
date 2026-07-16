import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Contact, ContactDocument } from '../contact.schema';
import {
  WhatsAppChat,
  WhatsAppChatDocument,
  WhatsAppChatStatus,
} from '../../whatsapp/schemas/whatsapp-chat.schema';
import {
  WhatsAppMessage,
  WhatsAppMessageDocument,
  WhatsAppMessageDirection,
  WhatsAppMessageType,
} from '../../whatsapp/schemas/whatsapp-message.schema';
import { MetaWhatsappService } from '../../whatsapp/services/meta-whatsapp.service';
import { WhatsAppSupportGateway } from '../../whatsapp/whatsapp-support.gateway';
import { logWhatsAppEvent } from '../../whatsapp/logger/whatsapp-file.logger';


@Injectable()
export class ContactWhatsAppService {
  private readonly logger = new Logger(ContactWhatsAppService.name);
  private readonly slaHours: number;

  constructor(
    @InjectModel(Contact.name) private readonly contactModel: Model<ContactDocument>,
    @InjectModel(WhatsAppChat.name) private readonly chatModel: Model<WhatsAppChatDocument>,
    @InjectModel(WhatsAppMessage.name) private readonly messageModel: Model<WhatsAppMessageDocument>,
    private readonly metaService: MetaWhatsappService,
    private readonly gateway: WhatsAppSupportGateway,
    private readonly configService: ConfigService,
  ) {
    this.slaHours = this.configService.get<number>('support.slaHours') ?? 4;
  }

  // ─── Normalize phone ────────────────────────────────────────────────────────

  /** Ensures phone is stored as 91XXXXXXXXXX (12 digits, no + prefix) */
  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    if (digits.length === 13 && digits.startsWith('091')) return digits.slice(1);
    return digits;
  }

  // ─── Flow 1: Auto-send ack template on Contact Query submission ─────────────

  /**
   * Sends the `customersupporttemplate` to the customer.
   * Called from ContactResolver.submitContactMessage (fire-and-forget, wrapped in try/catch).
   */
  async sendAckTemplate(contactId: string, phone: string, name: string): Promise<void> {
    const normalizedPhone = this.normalizePhone(phone);
    const shortRef = contactId.slice(-6).toUpperCase();
    const result = await this.metaService.sendGenericTemplate(
      normalizedPhone,
      'customersupporttemplate',
      'en',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: name || 'Customer' },
            { type: 'text', text: shortRef },
            { type: 'text', text: `next ${this.slaHours} hours` },
          ],
        },
      ],
    );

    if (result.success) {
      // Persist phone + timestamp on Contact
      await this.contactModel.findByIdAndUpdate(contactId, {
        whatsappPhoneNumber: normalizedPhone,
        whatsappTemplateSentAt: new Date(),
      });

      // Ensure a WhatsAppChat session exists linked to this contact query
      await this.findOrCreateChat(normalizedPhone, contactId);

      this.logger.log(`Ack template sent to ${normalizedPhone} for contact ${contactId}`);
      logWhatsAppEvent('Service: Ack template sent', { contactId, normalizedPhone });
    } else {
      this.logger.warn(`Ack template failed for ${normalizedPhone}: ${result.error}`);
      logWhatsAppEvent('Service: Ack template failed', { contactId, normalizedPhone, error: result.error });
    }
  }

  // ─── Flow 2: Customer initiates — send second template ──────────────────────

  /**
   * When a customer messages us first (from the wa.me link) and we have no
   * ContactQuery linked to their number yet, we send `customerwhentheyinitiatethechat`.
   * Returns true if template was sent.
   */
  async sendInitiatedTemplate(phone: string): Promise<boolean> {
    const result = await this.metaService.sendGenericTemplate(
      phone,
      'customerwhentheyinitiatethechat',
      'en',
      [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: String(this.slaHours) },
          ],
        },
      ],
    );
    return result.success;
  }

  // ─── Inbound message handler (called from BullMQ processor) ────────────────

  /**
   * Core logic for handling an inbound WhatsApp message from Meta webhook.
   * Finds the matching Contact by phone, saves message, updates 24h window,
   * and emits socket event to admin panel.
   */
  async handleInbound(payload: {
    messageId: string;
    phone: string;
    text: string;
    timestamp: Date;
    type?: string;
    mediaUrl?: string;
  }): Promise<void> {
    try {
      const normalizedPhone = this.normalizePhone(payload.phone);

      // 1. Find Contact by whatsappPhoneNumber
      const contact = await this.contactModel.findOne({
        whatsappPhoneNumber: normalizedPhone,
      }).sort({ createdAt: -1 });

      let chat: WhatsAppChatDocument;

      if (contact) {
        // Known customer — linked to a ContactQuery
        chat = await this.findOrCreateChat(normalizedPhone, contact._id.toString());

        // Update 24h window on Contact
        const windowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.contactModel.findByIdAndUpdate(contact._id, {
          whatsappWindowExpiresAt: windowExpiresAt,
        });

        // Update window on Chat
        chat.windowExpiresAt = windowExpiresAt;
        chat.lastMessageAt = payload.timestamp;
        await chat.save();

        // 2. Save message
        const message = await this.messageModel.create({
          chatId: chat._id,
          messageId: payload.messageId,
          direction: WhatsAppMessageDirection.INCOMING,
          type: (payload.type?.toUpperCase() as WhatsAppMessageType) || WhatsAppMessageType.TEXT,
          content: payload.text,
          mediaUrl: payload.mediaUrl,
          timestamp: payload.timestamp,
        });

        // 3. Emit to admin panel
        this.gateway.emitNewMessage(contact._id.toString(), message);
        this.gateway.emitWindowUpdated(contact._id.toString(), windowExpiresAt);

        this.logger.log(`Inbound message from ${normalizedPhone} linked to contact ${contact._id}`);
        logWhatsAppEvent('Service: Handled inbound message', { contactId: contact._id.toString(), messageId: payload.messageId });
      } else {
        // Unknown number — not linked to any ContactQuery
        // We will create a new ContactQuery on the fly so it appears in the Admin Panel
        const newContact = await this.contactModel.create({
          name: 'WhatsApp Customer',
          phone: normalizedPhone,
          message: 'Initiated chat via WhatsApp',
          queryType: 'WHATSAPP_DIRECT',
          whatsappPhoneNumber: normalizedPhone,
          whatsappWindowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'PENDING',
        });

        chat = await this.findOrCreateChat(normalizedPhone, newContact._id.toString());
        chat.windowExpiresAt = newContact.whatsappWindowExpiresAt;
        chat.lastMessageAt = payload.timestamp;
        await chat.save();

        const message = await this.messageModel.create({
          chatId: chat._id,
          messageId: payload.messageId,
          direction: WhatsAppMessageDirection.INCOMING,
          type: (payload.type?.toUpperCase() as WhatsAppMessageType) || WhatsAppMessageType.TEXT,
          content: payload.text,
          mediaUrl: payload.mediaUrl,
          timestamp: payload.timestamp,
        });

        // Send the initiated template so we open a session on our side too
        await this.sendInitiatedTemplate(normalizedPhone);

        // Emit to admin panel (we need to emit the full contact object creation logic too, 
        // but for now the table will pick it up on refresh. We emit the message anyway).
        this.gateway.emitNewMessage(newContact._id.toString(), message);
        this.gateway.emitWindowUpdated(newContact._id.toString(), newContact.whatsappWindowExpiresAt!);

        this.logger.log(`Inbound from unknown number ${normalizedPhone} — auto-created ContactQuery ${newContact._id}, template sent`);
        logWhatsAppEvent('Service: Handled inbound from unknown (auto-created Contact)', { phone: normalizedPhone, contactId: newContact._id.toString() });
      }
    } catch (err) {
      logWhatsAppEvent('Service: Failed to handle inbound message', { phone: payload.phone, error: err.message });
      this.logger.error('Error handling inbound message', err);
      throw err;
    }
  }

  // ─── Handle delivery status updates ─────────────────────────────────────────

  async handleStatusUpdate(payload: { messageId: string; status: string }): Promise<void> {
    logWhatsAppEvent('Service: Handling status update', payload);
    const updated = await this.messageModel.findOneAndUpdate(
      { messageId: payload.messageId },
      { status: payload.status.toUpperCase() },
      { new: true },
    );
    if (!updated) {
      logWhatsAppEvent('Service: Warning - Message not found for status update', payload);
      this.logger.warn(`Message not found for status update: ${payload.messageId}`);
    } else {
      logWhatsAppEvent('Service: Successfully updated message status', { messageId: payload.messageId, status: payload.status });
      this.logger.log(`WhatsApp status update: messageId=${payload.messageId}, status=${payload.status}`);
    }
  }

  // ─── Admin: send free-form reply ─────────────────────────────────────────────

  /**
   * Admin sends a free-text message. Only allowed when the 24h window is open.
   * Throws BadRequestException if the window has expired.
   */
  async sendFreeText(contactId: string, text: string): Promise<WhatsAppMessageDocument> {
    const contact = await this.contactModel.findById(contactId);
    if (!contact) throw new BadRequestException('Contact not found');

    let phone = contact.whatsappPhoneNumber;
    if (!phone) {
      if (!contact.phone) throw new BadRequestException('Contact has no phone number');
      
      let normalized = contact.phone.replace(/\D/g, '');
      if (normalized.length === 10) {
        normalized = `91${normalized}`;
      } else if (normalized.startsWith('0') && normalized.length === 11) {
        normalized = `91${normalized.substring(1)}`;
      }
      
      phone = normalized;
      contact.whatsappPhoneNumber = phone;
      await contact.save();
    }

    // Check window
    const windowOpen = contact.whatsappWindowExpiresAt && contact.whatsappWindowExpiresAt > new Date();
    if (!windowOpen) {
      throw new BadRequestException(
        'The 24-hour session window has expired. Please send a template message to re-open it.',
      );
    }

    // Send via Meta Cloud API (free-form text)
    const response = await this.metaService.sendFreeText(phone, text);
    if (!response.success) {
      throw new BadRequestException(`Meta API error: ${response.error}`);
    }

    // Save to DB
    const chat = await this.findOrCreateChat(phone, contactId);
    const message = await this.messageModel.create({
      chatId: chat._id,
      messageId: response.messageId,
      direction: WhatsAppMessageDirection.OUTGOING,
      type: WhatsAppMessageType.TEXT,
      content: text,
      timestamp: new Date(),
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    // Emit to any other admin tabs watching this contact
    this.gateway.emitNewMessage(contactId, message);

    return message;
  }

  // ─── Admin: send template (always allowed) ────────────────────────────────────

  async sendTemplate(
    contactId: string,
    templateName: string,
    components: any[] = [],
    languageCode = 'en',
  ): Promise<void> {
    const contact = await this.contactModel.findById(contactId);
    if (!contact) throw new BadRequestException('Contact not found');

    let phone = contact.whatsappPhoneNumber;
    if (!phone) {
      if (!contact.phone) throw new BadRequestException('Contact has no phone number');

      // Normalize contact.phone for Meta API (assuming India for 10-digit numbers)
      let normalized = contact.phone.replace(/\D/g, '');
      if (normalized.length === 10) {
        normalized = `91${normalized}`;
      } else if (normalized.startsWith('0') && normalized.length === 11) {
        normalized = `91${normalized.substring(1)}`;
      }

      phone = normalized;

      // Update contact with this WhatsApp number so future interactions use it
      contact.whatsappPhoneNumber = phone;
      await contact.save();
    }

    if (components.length === 0) {
      if (templateName === 'customersupporttemplate') {
        components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: contact.name || 'Customer' },
              { type: 'text', text: contact.orderId || contact._id.toString().slice(-6).toUpperCase() },
              { type: 'text', text: '12 hours' }
            ]
          }
        ];
      } else if (templateName === 'customerwhentheyinitiatethechat') {
        components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: contact.name || 'Customer' }
            ]
          }
        ];
      }
    }

    const result = await this.metaService.sendGenericTemplate(phone, templateName, languageCode, components);
    if (!result.success) {
      throw new BadRequestException(`Template send failed: ${result.error}`);
    }

    // Save template message as outgoing
    const chat = await this.findOrCreateChat(phone, contactId);
    await this.messageModel.create({
      chatId: chat._id,
      direction: WhatsAppMessageDirection.OUTGOING,
      type: WhatsAppMessageType.TEXT,
      content: `[Template: ${templateName}]`,
      timestamp: new Date(),
    });
  }

  // ─── Admin: get conversation ──────────────────────────────────────────────────

  async getConversation(contactId: string): Promise<{
    contact: ContactDocument;
    chat: WhatsAppChatDocument | null;
    messages: WhatsAppMessageDocument[];
    windowOpen: boolean;
    windowExpiresAt: Date | null;
  }> {
    const contact = await this.contactModel.findById(contactId);
    if (!contact) throw new BadRequestException('Contact not found');

    const chat = await this.chatModel
      .findOne({ contactQueryId: new Types.ObjectId(contactId) })
      .sort({ updatedAt: -1 });

    const messages = chat
      ? await this.messageModel.find({ chatId: chat._id }).sort({ timestamp: 1 })
      : [];

    const windowExpiresAt = contact.whatsappWindowExpiresAt ?? null;
    const windowOpen = !!(windowExpiresAt && windowExpiresAt > new Date());

    return { contact, chat, messages, windowOpen, windowExpiresAt };
  }

  // ─── Admin: paginated list with WhatsApp activity ────────────────────────────

  async listWithWhatsApp(skip = 0, limit = 50): Promise<{
    data: ContactDocument[];
    total: number;
  }> {
    const filter = { whatsappPhoneNumber: { $exists: true, $ne: null } };
    const [data, total] = await Promise.all([
      this.contactModel.find(filter).sort({ whatsappWindowExpiresAt: -1, createdAt: -1 }).skip(skip).limit(limit),
      this.contactModel.countDocuments(filter),
    ]);
    return { data, total };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async findOrCreateChat(
    phone: string,
    contactId: string | null,
  ): Promise<WhatsAppChatDocument> {
    const query: any = { phoneNumber: phone };
    if (contactId) query.contactQueryId = new Types.ObjectId(contactId);

    let chat = await this.chatModel.findOne(query).sort({ updatedAt: -1 });

    if (!chat) {
      const createData: any = {
        phoneNumber: phone,
        status: WhatsAppChatStatus.OPEN,
      };
      if (contactId) createData.contactQueryId = new Types.ObjectId(contactId);
      chat = await this.chatModel.create(createData);
    }

    return chat;
  }
}

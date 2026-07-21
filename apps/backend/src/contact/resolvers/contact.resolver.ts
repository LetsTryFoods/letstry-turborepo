import {
  Resolver,
  Mutation,
  Args,
  Query,
  Int,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { Public } from '../../common/decorators/public.decorator';
import { ContactService } from '../services/contact.service';
import { ContactWhatsAppService } from '../services/contact-whatsapp.service';
import { SubmitContactInput } from '../dto/submit-contact.input';
import { Contact } from '../contact.schema';

@ObjectType()
export class ContactSubmissionResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  contactId?: string; // returned so frontend can reference for re-sending ack
}

@ObjectType()
export class PaginatedContactsResponse {
  @Field(() => [Contact])
  data: Contact[];

  @Field(() => Int)
  total: number;
}

@Resolver(() => Contact)
export class ContactResolver {
  constructor(
    private readonly contactService: ContactService,
    private readonly contactWhatsAppService: ContactWhatsAppService,
  ) { }

  @Public()
  @Mutation(() => ContactSubmissionResponse)
  async submitContactMessage(
    @Args('input') input: SubmitContactInput,
  ): Promise<ContactSubmissionResponse> {
    try {
      const contact = await this.contactService.create(input);

      // Fire-and-forget: send WhatsApp ack template. We don't await it so
      // a WhatsApp failure never blocks the form submission response.
      this.contactWhatsAppService
        .sendAckTemplate(contact._id.toString(), input.phone, input.name)
        .catch((err) => {
          console.error('[ContactResolver] WhatsApp ack failed:', err.message);
        });

      return {
        success: true,
        message: 'Your query has been submitted successfully. We will get back to you shortly.',
        contactId: contact._id.toString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit your query. Please try again.',
      };
    }
  }

  @Query(() => PaginatedContactsResponse)
  async getContactMessages(
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
    @Args('queryType', { nullable: true }) queryType?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('priority', { nullable: true }) priority?: string,
    @Args('search', { nullable: true }) search?: string,
    @Args('activeChatsOnly', { type: () => Boolean, nullable: true }) activeChatsOnly?: boolean,
  ): Promise<PaginatedContactsResponse> {
    const filter: Record<string, any> = {};

    if (queryType && queryType !== 'ALL') {
      filter.queryType = queryType;
    }
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (priority && priority !== 'ALL') {
      filter.priority = priority;
    }
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { orderId: searchRegex },
      ];
    }
    if (activeChatsOnly) {
      filter.whatsappWindowExpiresAt = { $gt: new Date() };
    }

    const [data, total] = await Promise.all([
      this.contactService.findAll(skip, limit, filter),
      this.contactService.countAll(filter),
    ]);

    // Compute hasUnread for each contact:
    // A contact has unread messages if it has received an INCOMING message
    // (lastInboundAt is set) AFTER the admin last opened the chat (adminLastReadAt).
    // If adminLastReadAt is null the admin has never opened this chat — we don't
    // flag it as unread so old chats don't suddenly appear noisy after deploy.
    const dataWithUnread = data.map((contact) => {
      const plain = contact.toObject ? contact.toObject() : { ...contact };
      const lastInboundAt: Date | undefined = (contact as any).lastInboundAt;
      const adminLastReadAt: Date | undefined = (contact as any).adminLastReadAt;

      let hasUnread = false;
      if (lastInboundAt && adminLastReadAt) {
        hasUnread = new Date(lastInboundAt) > new Date(adminLastReadAt);
      }

      return { ...plain, hasUnread };
    });

    return { data: dataWithUnread as any, total };
  }

  @Mutation(() => Contact)
  async updateContactStatus(
    @Args('id') id: string,
    @Args('status') status: string,
  ): Promise<Contact> {
    return this.contactService.updateStatus(id, status);
  }

  @Mutation(() => Boolean)
  async deleteContactMessage(@Args('id') id: string): Promise<boolean> {
    return this.contactService.delete(id);
  }

  /**
   * Called by the admin panel when the chat window is opened.
   * Sets adminLastReadAt = now() in the DB so the unread badge
   * clears and stays cleared even after a laptop restart.
   */
  @Mutation(() => Boolean)
  async markContactRead(@Args('id') id: string): Promise<boolean> {
    await this.contactWhatsAppService.markContactRead(id);
    return true;
  }
}


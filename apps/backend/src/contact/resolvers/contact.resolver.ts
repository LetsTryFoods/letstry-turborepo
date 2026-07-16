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
  ): Promise<PaginatedContactsResponse> {
    const filter = queryType ? { queryType } : {};
    const [data, total] = await Promise.all([
      this.contactService.findAll(skip, limit, filter),
      this.contactService.countAll(filter),
    ]);
    return { data, total };
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
}

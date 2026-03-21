import { Resolver, Mutation, Args, Query, Int, ObjectType, Field } from '@nestjs/graphql';
import { Public } from '../../common/decorators/public.decorator';
import { ContactService } from '../services/contact.service';
import { SubmitContactInput } from '../dto/submit-contact.input';
import { Contact } from '../contact.schema';

@ObjectType()
export class ContactSubmissionResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
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
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Mutation(() => ContactSubmissionResponse)
  async submitContactMessage(
    @Args('input') input: SubmitContactInput,
  ): Promise<ContactSubmissionResponse> {
    try {
      await this.contactService.create(input);
      return {
        success: true,
        message: 'Your query has been submitted successfully. We will get back to you shortly.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit your query. Please try again.',
      };
    }
  }

  // Admin access can be secured later or assumed here
  @Query(() => PaginatedContactsResponse)
  async getContactMessages(
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<PaginatedContactsResponse> {
    const [data, total] = await Promise.all([
      this.contactService.findAll(skip, limit),
      this.contactService.countAll(),
    ]);
    return { data, total };
  }
}

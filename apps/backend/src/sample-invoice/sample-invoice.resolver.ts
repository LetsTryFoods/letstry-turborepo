import { Resolver, Query, Mutation, Args, ID, Int, Float } from '@nestjs/graphql';
import { InputType, Field } from '@nestjs/graphql';
import { SampleInvoice } from './sample-invoice.schema';
import { SampleInvoiceService } from './sample-invoice.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

// ── Input types ───────────────────────────────────────────────────────────────

@InputType()
export class SampleInvoiceItemInput {
  @Field()
  sku: string;

  @Field()
  skuName: string;

  @Field({ nullable: true })
  uom?: string;

  @Field(() => Float, { nullable: true })
  mrp?: number;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class SampleInvoiceRecipientInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class CreateSampleInvoiceInput {
  @Field()
  invoiceNumber: string;

  @Field(() => SampleInvoiceRecipientInput, { nullable: true })
  recipient?: SampleInvoiceRecipientInput;

  @Field(() => [SampleInvoiceItemInput])
  items: SampleInvoiceItemInput[];
}

// ── Resolver ──────────────────────────────────────────────────────────────────

@Resolver(() => SampleInvoice)
export class SampleInvoiceResolver {
  constructor(private readonly service: SampleInvoiceService) {}

  /**
   * Save a new sample invoice to the database.
   * Called from the admin panel when the user clicks "Save Invoice".
   */
  @Mutation(() => SampleInvoice, { name: 'createSampleInvoice' })
  @Roles(Role.ADMIN)
  async createSampleInvoice(
    @Args('input') input: CreateSampleInvoiceInput,
  ): Promise<SampleInvoice> {
    return this.service.create(input);
  }

  /**
   * List all saved sample invoices (newest first).
   */
  @Query(() => [SampleInvoice], { name: 'sampleInvoices' })
  @Roles(Role.ADMIN)
  async getSampleInvoices(): Promise<SampleInvoice[]> {
    return this.service.findAll();
  }

  /**
   * Get a single invoice by its MongoDB _id.
   */
  @Query(() => SampleInvoice, { name: 'sampleInvoiceById', nullable: true })
  @Roles(Role.ADMIN)
  async getSampleInvoiceById(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SampleInvoice | null> {
    return this.service.findById(id);
  }
}

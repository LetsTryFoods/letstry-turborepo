import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SampleInvoice, SampleInvoiceSchema } from './sample-invoice.schema';
import { SampleInvoiceService } from './sample-invoice.service';
import { SampleInvoiceResolver } from './sample-invoice.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SampleInvoice.name, schema: SampleInvoiceSchema },
    ]),
  ],
  providers: [SampleInvoiceService, SampleInvoiceResolver],
  exports: [SampleInvoiceService],
})
export class SampleInvoiceModule {}

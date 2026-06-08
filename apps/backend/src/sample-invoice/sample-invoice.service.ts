import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SampleInvoice, SampleInvoiceDocument } from './sample-invoice.schema';
import { CreateSampleInvoiceInput } from './sample-invoice.resolver';

@Injectable()
export class SampleInvoiceService {
  constructor(
    @InjectModel(SampleInvoice.name)
    private readonly invoiceModel: Model<SampleInvoiceDocument>,
  ) {}

  /** Save a new invoice. Caller is responsible for unique invoiceNumber. */
  async create(input: CreateSampleInvoiceInput): Promise<SampleInvoice> {
    const totalPcs = input.items.reduce((acc, i) => acc + i.quantity, 0);
    const totalMrpValue = input.items.reduce(
      (acc, i) => acc + (i.mrp ?? 0) * i.quantity,
      0,
    );

    const doc = new this.invoiceModel({
      ...input,
      totalPcs,
      totalMrpValue,
    });

    return doc.save();
  }

  /** Return all invoices, newest first. */
  async findAll(): Promise<SampleInvoice[]> {
    return this.invoiceModel.find().sort({ createdAt: -1 }).exec();
  }

  /** Return a single invoice by _id. */
  async findById(id: string): Promise<SampleInvoice | null> {
    return this.invoiceModel.findById(id).exec();
  }

  /** Update an existing invoice by id. */
  async update(
    id: string,
    input: CreateSampleInvoiceInput,
  ): Promise<SampleInvoice | null> {
    const totalPcs = input.items.reduce((acc, i) => acc + i.quantity, 0);
    const totalMrpValue = input.items.reduce(
      (acc, i) => acc + (i.mrp ?? 0) * i.quantity,
      0,
    );

    return this.invoiceModel
      .findByIdAndUpdate(
        id,
        {
          ...input,
          totalPcs,
          totalMrpValue,
        },
        { new: true },
      )
      .exec();
  }
}
